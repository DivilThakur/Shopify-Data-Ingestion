import express from "express";
import {
  verifyShopifyWebhook,
  handleCustomerWebhook,
  handleProductWebhook,
  handleOrderWebhook,
} from "../controllers/webhookController.js";

const router = express.Router();


router.post("/customers", handleCustomerWebhook);
router.post("/products", handleProductWebhook);
router.post("/orders", handleOrderWebhook);

export default router;
