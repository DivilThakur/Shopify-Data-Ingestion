import prisma from "../prismaClient.js";
import redis from "../redisClient.js";

const getTenantId = async (shopDomain) => {
  const tenant = await prisma.tenants.findFirst({
    where: { store_url: shopDomain },
    select: { id: true },
  });
  return tenant?.id || null;
};

export const handleCustomerWebhook = async (req, res) => {
  try {
    const shopDomain = req.get("X-Shopify-Shop-Domain");
    const tenant_id = await getTenantId(shopDomain);

    if (!tenant_id) {
      console.error("No tenant found for shop:", shopDomain);
      return res.status(400).send("Invalid tenant");
    }

    const customers = Array.isArray(req.body) ? req.body : [req.body];

    for (let c of customers) {
      const { id: shopify_id, email, first_name, last_name, total_spent } = c;

      await prisma.customers.upsert({
        where: {
          tenant_id_shopify_id: {
            tenant_id,
            shopify_id: shopify_id.toString(),
          },
        },
        update: {
          email,
          first_name,
          last_name,
          total_spent: parseFloat(total_spent) || 0,
        },
        create: {
          tenant_id,
          shopify_id: shopify_id.toString(),
          email,
          first_name,
          last_name,
          total_spent: parseFloat(total_spent) || 0,
        },
      });
    }
    const cacheKey = `customers:${tenant_id}`;
    await redis.del(cacheKey);

    console.log(
      `Processed ${customers.length} customer(s) for tenant ${tenant_id}`
    );
    res.status(200).send("Customers processed successfully");
  } catch (err) {
    console.error("Customer webhook error:", err);
    res.status(500).send("Internal Server Error");
  }
};

export const handleProductWebhook = async (req, res) => {
  try {
    const shopDomain = req.get("X-Shopify-Shop-Domain");
    const tenant_id = await getTenantId(shopDomain);

    if (!tenant_id) {
      console.error("No tenant found for shop:", shopDomain);
      return res.status(400).send("Invalid tenant");
    }

    const products = Array.isArray(req.body) ? req.body : [req.body];

    for (let p of products) {
      const { id: shopify_id, title, variants } = p;
      const price = parseFloat(variants?.[0]?.price) || 0;

      await prisma.products.upsert({
        where: {
          tenant_id_shopify_id: {
            tenant_id,
            shopify_id: shopify_id.toString(),
          },
        },
        update: { title, price },
        create: {
          tenant_id,
          shopify_id: shopify_id.toString(),
          title,
          price,
        },
      });
    }

    const cacheKey = `products:${tenant_id}`;
    await redis.del(cacheKey);

    console.log(
      `Processed ${products.length} product(s) for tenant ${tenant_id}`
    );
    res.status(200).send("Products processed successfully");
  } catch (err) {
    console.error("Product webhook error:", err);
    res.status(500).send("Internal Server Error");
  }
};

export const handleOrderWebhook = async (req, res) => {
  try {
    const shopDomain = req.get("X-Shopify-Shop-Domain");
    const tenant_id = await getTenantId(shopDomain);
    const topic = req.get("X-Shopify-Topic");

    if (!tenant_id) {
      console.error("No tenant found for shop:", shopDomain);
      return res.status(400).send("Invalid tenant");
    }

    const orders = Array.isArray(req.body) ? req.body : [req.body];

    for (let o of orders) {
      const { id: shopify_id, total_price, customer, customer_id } = o;

      let status = "PENDING";
      if (topic.includes("paid") || topic.includes("fulfilled")) {
        status = "COMPLETED";
      } else if (topic.includes("cancelled")) {
        status = "CANCELED";
      } else if (topic.includes("refunded")) {
        status = "REFUNDED";
      }

      let localCustomerId = null;
      const customerShopifyId = customer?.id || customer_id;
      if (customerShopifyId) {
        const customerRecord = await prisma.customers.findFirst({
          where: { tenant_id, shopify_id: customerShopifyId.toString() },
          select: { id: true },
        });
        localCustomerId = customerRecord?.id || null;
      }

      const order = await prisma.orders.upsert({
        where: {
          tenant_id_shopify_id: {
            tenant_id,
            shopify_id: shopify_id.toString(),
          },
        },
        update: {
          total_price: parseFloat(total_price) || 0,
          customer_id: localCustomerId,
          status,
        },
        create: {
          tenants: { connect: { id: tenant_id } },
          shopify_id: shopify_id.toString(),
          total_price: parseFloat(total_price) || 0,
          status,
          ...(localCustomerId
            ? { customers: { connect: { id: localCustomerId } } }
            : {}),
        },
      });

      const cacheKey = `orders:${tenant_id}`;
      await redis.del(cacheKey);

      if (localCustomerId) {
        const totalSpent = await prisma.orders.aggregate({
          _sum: { total_price: true },
          where: { customer_id: localCustomerId, status: "COMPLETED" },
        });

        await prisma.customers.update({
          where: { id: localCustomerId },
          data: { total_spent: totalSpent._sum.total_price || 0 },
        });
      }
    }

    console.log(`Processed ${orders.length} order(s) for tenant ${tenant_id}`);
    res.status(200).send("Orders processed successfully");
  } catch (err) {
    console.error("Order webhook error:", err);
    res.status(500).send("Internal Server Error");
  }
};

export const handleCartWebhook = async (req, res) => {
  try {
    const shopDomain = req.get("X-Shopify-Shop-Domain");
    if (!shopDomain) {
      console.error("Missing X-Shopify-Shop-Domain header");
      return res.status(400).send("Missing shop domain");
    }

    const tenantId = await getTenantId(shopDomain);

    if (!tenantId) {
      console.error("Invalid or missing tenant ID for shop:", shopDomain);
      return res.status(400).send("Invalid tenant");
    }

    const { id: shopifyCartId, customer_id, total_price } = req.body;

    if (!shopifyCartId) {
      console.error("Missing cart ID in webhook payload");
      return res.status(400).send("Missing cart ID");
    }

    const topic = req.get("X-Shopify-Topic");

    let status = "ACTIVE";
    if (topic?.includes("abandoned")) status = "ABANDONED";
    else if (topic?.includes("completed")) status = "COMPLETED";

    const safeTotalPrice = parseFloat(total_price) || 0;

    await prisma.carts.upsert({
      where: {
        tenant_id_shopify_id: {
          tenant_id: tenantId,
          shopify_id: String(shopifyCartId),
        },
      },
      update: { total_price: safeTotalPrice, status },
      create: {
        tenant_id: tenantId,
        shopify_id: String(shopifyCartId),
        customer_id: customer_id ? Number(customer_id) : null,
        total_price: safeTotalPrice,
        status,
      },
    });

    await redis.del(`checkouts:${tenantId}`);

    console.log(
      `Cart ${shopifyCartId} processed as ${status} for tenant ${tenantId}`
    );
    res.status(200).send(`Cart ${status} webhook processed`);
  } catch (err) {
    console.error("Cart webhook error:", err);
    res.status(500).send("Error processing cart webhook");
  }
};

export const handleCheckoutWebhook = async (req, res) => {
  try {
    const shopDomain = req.get("X-Shopify-Shop-Domain");
    if (!shopDomain) {
      console.error("Missing X-Shopify-Shop-Domain header");
      return res.status(400).send("Missing shop domain");
    }

    const tenantId = await getTenantId(shopDomain);

    if (!tenantId) {
      console.error("Invalid or missing tenant ID for shop:", shopDomain);
      return res.status(400).send("Invalid tenant");
    }

    const { id: shopifyCheckoutId, customer_id, total_price } = req.body;

    if (!shopifyCheckoutId) {
      console.error("Missing checkout ID in webhook payload");
      return res.status(400).send("Missing checkout ID");
    }

    const topic = req.get("X-Shopify-Topic");

    let status = "STARTED";
    if (topic?.includes("abandoned")) status = "ABANDONED";
    else if (topic?.includes("completed") || topic?.includes("paid"))
      status = "COMPLETED";

    const safeTotalPrice = parseFloat(total_price) || 0;

    await prisma.checkouts.upsert({
      where: {
        tenant_id_shopify_id: {
          tenant_id: tenantId,
          shopify_id: String(shopifyCheckoutId),
        },
      },
      update: { total_price: safeTotalPrice, status },
      create: {
        tenant_id: tenantId,
        shopify_id: String(shopifyCheckoutId),
        customer_id: customer_id ? Number(customer_id) : null,
        total_price: safeTotalPrice,
        status,
      },
    });

    await redis.del(`checkouts:${tenantId}`);

    console.log(
      `Checkout ${shopifyCheckoutId} processed as ${status} for tenant ${tenantId}`
    );
    res.status(200).send(`Checkout ${status} webhook processed`);
  } catch (err) {
    console.error("Checkout webhook error:", err);
    res.status(500).send("Error processing checkout webhook");
  }
};
