import express from "express";
import {
  getCustomersApi,
  getProductsApi,
  getOrdersApi,
  getInsightsApi,
} from "../controllers/apiController.js";
import { authenticate } from "../middleware/authMiddlware.js";
const router = express.Router();

router.get("/customers", authenticate, getCustomersApi);
router.get("/products", authenticate, getProductsApi);
router.get("/orders", authenticate, getOrdersApi);
router.get("/insights", authenticate, getInsightsApi);

export default router;
