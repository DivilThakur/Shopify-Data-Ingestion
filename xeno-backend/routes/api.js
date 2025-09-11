import express from "express";
import {
  getCustomersApi,
  getProductsApi,
  getOrdersApi,
  getInsightsApi,
  linkOrdersToCustomers,
  getWebhookInfo,
} from "../controllers/apiController.js";
import { authenticate } from "../middleware/authMiddlware.js";
const router = express.Router();


router.get("/customers", authenticate, getCustomersApi);
router.get("/products", authenticate, getProductsApi);
router.get("/orders", authenticate, getOrdersApi);
router.get("/insights", authenticate, getInsightsApi);
router.get("/webhook-info", authenticate, getWebhookInfo);
router.post("/orders/link-customers", authenticate, linkOrdersToCustomers);

export default router;
