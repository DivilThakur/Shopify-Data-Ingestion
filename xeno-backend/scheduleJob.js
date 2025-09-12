import prisma from "./prismaClient.js";
import cron from "node-cron";


cron.schedule("*/2 * * * *", async () => {
  console.log("Running abandonment job...");

  const cutoff = new Date();
  cutoff.setMinutes(cutoff.getMinutes() - 2);

 
  await prisma.carts.updateMany({
    where: { status: "ACTIVE", created_at: { lt: cutoff } },
    data: { status: "ABANDONED" },
  });


  await prisma.checkouts.updateMany({
    where: { status: "STARTED", created_at: { lt: cutoff } },
    data: { status: "ABANDONED" },
  });

  console.log("Abandonment job completed");
});
