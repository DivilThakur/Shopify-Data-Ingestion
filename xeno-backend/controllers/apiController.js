import prisma from "../prismaClient.js";
import redis from "../redisClient.js";

export const getCustomersApi = async (req, res) => {
  try {
    const tenant_id = req.tenant.tenant_id;
    const cacheKey = `customers:${tenant_id}`;

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(
        `✅ [CACHE HIT] Customers data found in cache for tenant ${tenant_id}`
      );
      return res.json({ customers: cachedData });
    }

    console.log(
      `❌ [CACHE MISS] Customers data not found in cache for tenant ${tenant_id}, fetching from database`
    );

    const customers = await prisma.customers.findMany({
      where: { tenant_id },
      orderBy: { created_at: "desc" },
    });

    await redis.setex(cacheKey, 300, JSON.stringify(customers));

    res.json({ customers });
  } catch (err) {
    console.error(
      `❌ [ERROR] getCustomersApi failed for tenant ${req.tenant?.tenant_id}:`,
      err.message
    );
    res.status(500).json({ error: err.message });
  }
};

export const getProductsApi = async (req, res) => {
  try {
    const tenant_id = req.tenant.tenant_id;
    const cacheKey = `products:${tenant_id}`;

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(
        `✅ [CACHE HIT] Products data found in cache for tenant ${tenant_id}`
      );
      return res.json({ products: cachedData });
    }

    console.log(
      `❌ [CACHE MISS] Products data not found in cache for tenant ${tenant_id}, fetching from database`
    );

    const products = await prisma.products.findMany({
      where: { tenant_id },
      orderBy: { created_at: "desc" },
    });

    await redis.setex(cacheKey, 300, JSON.stringify(products));
    console.log(
      `💾 [CACHE SET] Products data cached for tenant ${tenant_id} (TTL: 300s)`
    );

    res.json({ products });
  } catch (err) {
    console.error(
      `❌ [ERROR] getProductsApi failed for tenant ${req.tenant?.tenant_id}:`,
      err.message
    );
    res.status(500).json({ error: err.message });
  }
};

export const getOrdersApi = async (req, res) => {
  try {
    const tenant_id = req.tenant.tenant_id;
    const { from, to } = req.query;

    const cacheKey = `orders:${tenant_id}:${from || "all"}:${to || "all"}`;

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(
        `✅ [CACHE HIT] Orders data found in cache for tenant ${tenant_id} (${
          from || "all"
        } to ${to || "all"})`
      );
      return res.json({ orders: cachedData });
    }

    console.log(
      `❌ [CACHE MISS] Orders data not found in cache for tenant ${tenant_id}, fetching from database`
    );

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

    await redis.setex(cacheKey, 180, JSON.stringify(orders));
    console.log(
      `💾 [CACHE SET] Orders data cached for tenant ${tenant_id} (TTL: 180s, Records: ${orders.length})`
    );

    res.json({ orders });
  } catch (err) {
    console.error(
      `❌ [ERROR] getOrdersApi failed for tenant ${req.tenant?.tenant_id}:`,
      err.message
    );
    res.status(500).json({ error: err.message });
  }
};

export const getInsightsApi = async (req, res) => {
  try {
    const tenant_id = req.tenant.tenant_id;
    const cacheKey = `insights:${tenant_id}`;

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(
        `✅ [CACHE HIT] Insights data found in cache for tenant ${tenant_id}`
      );
      return res.json(cachedData);
    }

    console.log(
      `❌ [CACHE MISS] Insights data not found in cache for tenant ${tenant_id}, fetching from database`
    );

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

    const insightsData = {
      total_customers,
      total_orders: orderAgg._count.id,
      total_revenue: orderAgg._sum.total_price || 0,
      top_customers,
      cart_summary: cartSummary,
      checkout_summary: checkoutSummary,
    };

    await redis.setex(cacheKey, 120, JSON.stringify(insightsData));
    console.log(
      `💾 [CACHE SET] Insights data cached for tenant ${tenant_id} (TTL: 120s, Customers: ${total_customers}, Orders: ${
        orderAgg._count.id
      }, Revenue: $${orderAgg._sum.total_price || 0})`
    );

    res.json(insightsData);
  } catch (err) {
    console.error(
      `❌ [ERROR] getInsightsApi failed for tenant ${req.tenant?.tenant_id}:`,
      err.message
    );
    res.status(500).json({ error: err.message });
  }
};
