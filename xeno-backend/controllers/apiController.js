import prisma from "../prismaClient.js";


export const getCustomersApi = async (req, res) => {
  try {
    const tenant_id = req.tenant.tenant_id;
    const customers = await prisma.customers.findMany({
      where: { tenant_id },
      orderBy: { created_at: "desc" },
    });
    res.json({ customers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getProductsApi = async (req, res) => {
  try {
    const tenant_id = req.tenant.tenant_id;
    const products = await prisma.products.findMany({
      where: { tenant_id },
      orderBy: { created_at: "desc" },
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
    const orders = await prisma.orders.findMany({
      where: {
        tenant_id,
        created_at: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      orderBy: { created_at: "desc" },
    });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getInsightsApi = async (req, res) => {
  try {
    const tenant_id = req.tenant.tenant_id;
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

    res.json({
      total_customers,
      total_orders: orderAgg._count.id,
      total_revenue: orderAgg._sum.total_price || 0,
      top_customers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
