import express from "express";
import { verifyShopifyWebhook } from "../middleware/webhookMiddleware.js";
import {
  handleCustomerWebhook,
  handleProductWebhook,
  handleOrderWebhook,
  handleCartWebhook,
  handleCheckoutWebhook,
} from "../controllers/webhookController.js";

const router = express.Router();

router.post("/customers", verifyShopifyWebhook, handleCustomerWebhook);
router.post("/products", verifyShopifyWebhook, handleProductWebhook);
router.post("/orders", verifyShopifyWebhook, handleOrderWebhook);
router.post("/carts", verifyShopifyWebhook, handleCartWebhook);
router.post("/checkouts", verifyShopifyWebhook, handleCheckoutWebhook);

export default router;
