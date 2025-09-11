import express from "express";
import {
  verifyShopifyWebhook,
  handleCustomerWebhook,
  handleProductWebhook,
  handleOrderWebhook,

} from "../controllers/webhookController.js";

const router = express.Router();

router.post("/customers", verifyShopifyWebhook, handleCustomerWebhook);
router.post("/products", verifyShopifyWebhook, handleProductWebhook);
router.post("/orders", verifyShopifyWebhook, handleOrderWebhook);

export default router;
