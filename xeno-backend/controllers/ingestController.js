import prisma from "../prismaClient.js";


export const ingestCustomers = async (req, res) => {
  try {
    const { tenant_id, customers } = req.body;
    if (!tenant_id || !Array.isArray(customers)) {
      return res
        .status(400)
        .json({ error: "tenant_id and customers array are required" });
    }

    const insertedCustomers = [];
    for (let cust of customers) {
      const { shopify_id, email, first_name, last_name, total_spent } = cust;
      const customer = await prisma.customers.upsert({
        where: { tenant_id_shopify_id: { tenant_id, shopify_id } },
        update: { email, first_name, last_name, total_spent: total_spent || 0 },
        create: {
          tenant_id,
          shopify_id,
          email,
          first_name,
          last_name,
          total_spent: total_spent || 0,
        },
      });
      insertedCustomers.push(customer);
    }

    res.json({
      message: `${insertedCustomers.length} customers ingested/updated`,
      data: insertedCustomers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const ingestProducts = async (req, res) => {
  try {
    const { tenant_id, products } = req.body;
    if (!tenant_id || !Array.isArray(products)) {
      return res
        .status(400)
        .json({ error: "tenant_id and products array are required" });
    }

    const insertedProducts = [];
    for (let p of products) {
      const { shopify_id, title, price } = p;
      const product = await prisma.products.upsert({
        where: { tenant_id_shopify_id: { tenant_id, shopify_id } },
        update: { title, price },
        create: { tenant_id, shopify_id, title, price },
      });
      insertedProducts.push(product);
    }

    res.json({
      message: `${insertedProducts.length} products ingested/updated`,
      data: insertedProducts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const ingestOrders = async (req, res) => {
  try {
    const { tenant_id, orders } = req.body;
    if (!tenant_id || !Array.isArray(orders)) {
      return res
        .status(400)
        .json({ error: "tenant_id and orders array are required" });
    }

    const insertedOrders = [];
    for (let o of orders) {
      const { shopify_id, total_price } = o;
      const order = await prisma.orders.upsert({
        where: { tenant_id_shopify_id: { tenant_id, shopify_id } },
        update: { total_price },
        create: { tenant_id, shopify_id, total_price },
      });
      insertedOrders.push(order);
    }

    res.json({
      message: `${insertedOrders.length} orders ingested/updated`,
      data: insertedOrders,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
