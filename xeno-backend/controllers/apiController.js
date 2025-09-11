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
      include: {
        customers: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            shopify_id: true
          }
        }
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

export const linkOrdersToCustomers = async (req, res) => {
  try {
    const tenant_id = req.tenant.tenant_id;
    
    // Get all orders without customer_id for this tenant
    const ordersWithoutCustomer = await prisma.orders.findMany({
      where: {
        tenant_id,
        customer_id: null,
      },
    });

    let updatedCount = 0;

    for (const order of ordersWithoutCustomer) {
      // Try to find any customer for this tenant
      const customer = await prisma.customers.findFirst({
        where: {
          tenant_id,
        },
        select: { id: true },
      });

      if (customer) {
        await prisma.orders.update({
          where: { id: order.id },
          data: { customer_id: customer.id },
        });
        updatedCount++;
      }
    }

    res.json({
      message: `Successfully linked ${updatedCount} orders to customers`,
      updatedCount,
      totalOrders: ordersWithoutCustomer.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getWebhookInfo = async (req, res) => {
  try {
    const tenant_id = req.tenant.tenant_id;
    
    const tenant = await prisma.tenants.findUnique({
      where: { id: tenant_id },
      select: {
        name: true,
        store_url: true,
        webhook_secret: true,
        created_at: true,
      },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    res.json({
      tenant: {
        name: tenant.name,
        store_url: tenant.store_url,
        has_webhook_secret: !!tenant.webhook_secret,
        webhook_secret_length: tenant.webhook_secret?.length || 0,
        created_at: tenant.created_at,
      },
      webhook_endpoints: {
        customers: `/webhook/customers`,
        products: `/webhook/products`,
        orders: `/webhook/orders`,
        cart: `/webhook/cart`,
        checkout: `/webhook/checkout`,
      },
      note: "Webhook secret is stored securely and not returned in API responses",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
