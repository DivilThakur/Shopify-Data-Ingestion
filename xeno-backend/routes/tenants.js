import express from "express";
import { registerTenant, loginTenant } from "../controllers/tenantController.js";

const router = express.Router();

router.post("/register", registerTenant);
router.post("/login", loginTenant);

export default router;
