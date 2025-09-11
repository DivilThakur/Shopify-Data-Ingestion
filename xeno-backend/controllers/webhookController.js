import { PrismaClient } from "../generated/prisma/client.js";
import crypto from "crypto";

const prisma = new PrismaClient();
const getTenantId = async (shopDomain) => {
  const tenant = await prisma.tenants.findFirst({
    where: { store_url: shopDomain },
    select: { id: true },
  });
  return tenant?.id || null;
};

export const verifyShopifyWebhook = (req, res, next) => {
  const shopifyHmac = req.get("X-Shopify-Hmac-Sha256");
  const secret = process.env.SHOPIFY_SECRET;

  if (!shopifyHmac || !req.rawBody || !secret) {
    console.error("Webhook verification failed: Missing elements");
    return res.status(401).send("Unauthorized");
  }

  const hash = crypto
    .createHmac("sha256", secret)
    .update(req.rawBody, "utf8")
    .digest("base64");

  if (hash !== shopifyHmac) {
    console.error("Webhook verification failed: HMAC mismatch");
    console.log(`Received HMAC: ${shopifyHmac}, Computed HMAC: ${hash}`);
    return res.status(401).send("Unauthorized");
  }

  console.log(
    `Webhook verification passed for shop: ${req.get("X-Shopify-Shop-Domain")}`
  );
  next();
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

    if (!tenant_id) {
      console.error("No tenant found for shop:", shopDomain);
      return res.status(400).send("Invalid tenant");
    }

    const orders = Array.isArray(req.body) ? req.body : [req.body];

    for (let o of orders) {
      const { id: shopify_id, total_price } = o;

      await prisma.orders.upsert({
        where: {
          tenant_id_shopify_id: {
            tenant_id,
            shopify_id: shopify_id.toString(),
          },
        },
        update: { total_price: parseFloat(total_price) || 0 },
        create: {
          tenant_id,
          shopify_id: shopify_id.toString(),
          total_price: parseFloat(total_price) || 0,
        },
      });
    }

    console.log(`Processed ${orders.length} order(s) for tenant ${tenant_id}`);
    res.status(200).send("Orders processed successfully");
  } catch (err) {
    console.error("Order webhook error:", err);
    res.status(500).send("Internal Server Error");
  }
};
