import express from "express";
import {
  ingestCustomers,
  ingestOrders,
  ingestProducts,
} from "../controllers/ingestController.js";

const router = express.Router();

router.post("/customers", ingestCustomers);
router.post("/orders", ingestOrders);
router.post("/products", ingestProducts);

export default router;
