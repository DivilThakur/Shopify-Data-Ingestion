import express from "express";
import "./scheduleJob.js";
import prisma from "./prismaClient.js";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import tenantsRouter from "./routes/tenants.js";
import ingestRoutes from "./routes/ingest.js";
import webhookRoutes from "./routes/webhooks.js";
import apiRoutes from "./routes/api.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  "/webhook",
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  })
);
app.use(express.json());
app.use(cors());

app.use("/webhook", webhookRoutes);
app.use("/ingest", ingestRoutes);
app.use("/api", apiRoutes);
app.use("/tenants", tenantsRouter);

app.get("/", (req, res) => {
  res.send("Xeno backend with PostgreSQL is running ✅");
});

app.get("/test", async (req, res) => {
  const tenants = await prisma.tenants.findMany();
  res.json(tenants);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
