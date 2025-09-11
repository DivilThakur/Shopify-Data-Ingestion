import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";

const JWT_SECRET = process.env.JWT_SECRET;


export const registerTenant = async (req, res) => {
  try {
    const { name, email, password, store_url, api_key, webhook_secret } = req.body;
    if (!name || !email || !password || !store_url || !api_key || !webhook_secret) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existing = await prisma.tenants.findUnique({ where: { email } });
    if (existing) {
      return res
        .status(409)
        .json({ error: "Tenant with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const tenant = await prisma.tenants.create({
      data: { name, email, password: hashedPassword, store_url, api_key, webhook_secret },
    });

    res.status(201).json({
      message: "Tenant registered successfully",
      tenant: {
        id: tenant.id,
        name: tenant.name,
        email: tenant.email,
        store_url: tenant.store_url,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const loginTenant = async (req, res) => {
  try {
    const { email, password } = req.body;
    const tenant = await prisma.tenants.findUnique({ where: { email } });

    if (!tenant) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, tenant.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ tenant_id: tenant.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      message: "Login successful",
      token,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        email: tenant.email,
        store_url: tenant.store_url,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
