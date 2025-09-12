import prisma from "../prismaClient.js";

// Generate a random past date within the last `minutesAgoMax` minutes
function randomPastDate(minutesAgoMax = 15) {
  const date = new Date();
  const pastMinutes = Math.floor(Math.random() * minutesAgoMax);
  date.setMinutes(date.getMinutes() - pastMinutes);
  return date;
}

async function main() {
  const tenantId = 5; // Use your tenant ID

  // 1️⃣ Seed 5 customers
  const customers = [];
  for (let i = 1; i <= 5; i++) {
    const customer = await prisma.customers.upsert({
      where: {
        tenant_id_shopify_id: {
          tenant_id: tenantId,
          shopify_id: `customer_${i}`,
        },
      },
      update: {},
      create: {
        tenant_id: tenantId,
        shopify_id: `customer_${i}`,
        email: `customer${i}@test.com`,
        first_name: `Customer${i}`,
        last_name: `Test`,
        total_spent: 0,
      },
    });
    customers.push(customer);
  }

  // 2️⃣ Seed 50 carts
  const cartStatuses = ["ACTIVE", "ABANDONED", "COMPLETED"];
  const cartData = [];
  for (let i = 1; i <= 50; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    cartData.push({
      tenant_id: tenantId,
      shopify_id: `cart_${i}`,
      customer_id: customer.id,
      total_price: Math.floor(Math.random() * 500) + 50, // 50 - 550
      status: cartStatuses[Math.floor(Math.random() * cartStatuses.length)],
      created_at: randomPastDate(120), // within last 2 hours
    });
  }
  await prisma.carts.createMany({ data: cartData, skipDuplicates: true });

  // 3️⃣ Seed 50 checkouts
  const checkoutStatuses = ["STARTED", "ABANDONED", "COMPLETED"];
  const checkoutData = [];
  for (let i = 1; i <= 50; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    checkoutData.push({
      tenant_id: tenantId,
      shopify_id: `checkout_${i}`,
      customer_id: customer.id,
      total_price: Math.floor(Math.random() * 1000) + 100,
      status:
        checkoutStatuses[Math.floor(Math.random() * checkoutStatuses.length)],
      created_at: randomPastDate(120), 
    });
  }
  await prisma.checkouts.createMany({
    data: checkoutData,
    skipDuplicates: true,
  });

  console.log(
    "✅ Seeded customers, carts, and checkouts with past timestamps!"
  );
}


main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
