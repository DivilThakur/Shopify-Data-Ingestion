import prisma from "../prismaClient.js";
import crypto from "crypto";

export const verifyShopifyWebhook = async (req, res, next) => {
  try {
    const shopDomain = req.get("X-Shopify-Shop-Domain");
    const shopifyHmac = req.get("X-Shopify-Hmac-Sha256");

    if (!shopDomain || !shopifyHmac || !req.rawBody) {
      console.error(
        "Webhook verification failed: Missing required headers or body"
      );
      return res.status(401).send("Unauthorized");
    }

    const tenant = await prisma.tenants.findFirst({
      where: { store_url: shopDomain },
      select: { webhook_secret: true, name: true },
    });

    if (!tenant || !tenant.webhook_secret) {
      console.error(
        `No tenant or webhook secret found for shop: ${shopDomain}`
      );
      return res.status(401).send("Unauthorized");
    }

    const hash = crypto
      .createHmac("sha256", tenant.webhook_secret)
      .update(req.rawBody, "utf8")
      .digest("base64");

    if (hash !== shopifyHmac) {
      console.error(
        `Webhook verification failed for ${tenant.name}: HMAC mismatch`
      );
      console.log(`Received HMAC: ${shopifyHmac}, Computed HMAC: ${hash}`);
      return res.status(401).send("Unauthorized");
    }

    console.log(
      `Webhook verification passed for ${tenant.name} (${shopDomain})`
    );
    next();
  } catch (err) {
    console.error("Webhook verification error:", err);
    res.status(500).send("Internal Server Error");
  }
};
