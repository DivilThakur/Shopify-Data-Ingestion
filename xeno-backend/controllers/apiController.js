import prisma from "../prismaClient.js";
import redis from "../redisClient.js";

export const getCustomersApi = async (req, res) => {
  try {
    const tenant_id = req.tenant.tenant_id;

    const cached = await redis.get(`tenant:${tenant_id}:customers`);
    if (cached) {
      console.log("Cache hit: customers");
      return res.json({ customers: JSON.parse(cached) });
    }

    const customers = await prisma.customers.findMany({
      where: { tenant_id },
      orderBy: { created_at: "desc" },
    });

    await redis.set(
      `tenant:${tenant_id}:customers`,
      JSON.stringify(customers),
      {
        ex: 300,
      }
    );

    res.json({ customers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProductsApi = async (req, res) => {
  try {
    const tenant_id = req.tenant.tenant_id;

    const cached = await redis.get(`tenant:${tenant_id}:products`);
    if (cached) {
      console.log("Cache hit: products");
      return res.json({ products: JSON.parse(cached) });
    }

    const products = await prisma.products.findMany({
      where: { tenant_id },
      orderBy: { created_at: "desc" },
    });

    await redis.set(`tenant:${tenant_id}:products`, JSON.stringify(products), {
      ex: 1800,
    });

    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOrdersApi = async (req, res) => {
  try {
    const tenant_id = req.tenant.tenant_id;
    const { from, to } = req.query;

    const cacheKey = `tenant:${tenant_id}:orders:${from || "all"}:${
      to || "all"
    }`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Cache hit: orders");
      return res.json({ orders: JSON.parse(cached) });
    }

    const orders = await prisma.orders.findMany({
      where: {
        tenant_id,
        created_at: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      include: {
        customers: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            shopify_id: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    await redis.set(cacheKey, JSON.stringify(orders), { ex: 120 });

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getInsightsApi = async (req, res) => {
  try {
    const tenant_id = req.tenant.tenant_id;

    const cacheKey = `tenant:${tenant_id}:insights`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Cache hit: insights");
      return res.json(JSON.parse(cached));
    }

    const total_customers = await prisma.customers.count({
      where: { tenant_id },
    });

    const orderAgg = await prisma.orders.aggregate({
      _count: { id: true },
      _sum: { total_price: true },
      where: { tenant_id },
    });

    const top_customers = await prisma.customers.findMany({
      where: { tenant_id },
      orderBy: { total_spent: "desc" },
      take: 5,
    });

    const cartStats = await prisma.carts.groupBy({
      by: ["status"],
      where: { tenant_id },
      _count: { status: true },
    });

    const checkoutStats = await prisma.checkouts.groupBy({
      by: ["status"],
      where: { tenant_id },
      _count: { status: true },
    });

    const cartSummary = cartStats.reduce((acc, cur) => {
      acc[cur.status] = cur._count.status;
      return acc;
    }, {});

    const checkoutSummary = checkoutStats.reduce((acc, cur) => {
      acc[cur.status] = cur._count.status;
      return acc;
    }, {});

    const insights = {
      total_customers,
      total_orders: orderAgg._count.id,
      total_revenue: orderAgg._sum.total_price || 0,
      top_customers,
      cart_summary: cartSummary,
      checkout_summary: checkoutSummary,
    };

    await redis.set(cacheKey, JSON.stringify(insights), { ex: 120 });

    res.json(insights);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
