import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

function randomPastDate(daysBack = 60) {
  const today = new Date();
  const past = new Date();
  past.setDate(today.getDate() - daysBack);
  return new Date(
    past.getTime() + Math.random() * (today.getTime() - past.getTime())
  );
}

async function main() {
  const tenantId = 2;

  const customers = [];
  for (let i = 0; i < 5; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const customer = await prisma.customers.create({
      data: {
        tenant_id: tenantId,
        shopify_id: faker.string.uuid(),
        email: faker.internet.email({ firstName, lastName }),
        first_name: firstName,
        last_name: lastName,
        total_spent: faker.number.float({
          min: 100,
          max: 1000,
          precision: 0.01,
        }),
        created_at: randomPastDate(60),
      },
    });
    customers.push(customer);
  }
  const products = [];
  for (let i = 0; i < 10; i++) {
    const product = await prisma.products.create({
      data: {
        tenant_id: tenantId,
        shopify_id: faker.string.uuid(),
        title: faker.commerce.productName(),
        price: faker.number.float({ min: 50, max: 5000, precision: 0.01 }),
        created_at: randomPastDate(60),
      },
    });
    products.push(product);
  }
  for (let i = 0; i < 15; i++) {
    const randomCustomer =
      customers[Math.floor(Math.random() * customers.length)];
    await prisma.orders.create({
      data: {
        tenant_id: tenantId,
        shopify_id: faker.string.uuid(),
        customer_id: randomCustomer.id,
        total_price: faker.number.float({
          min: 100,
          max: 10000,
          precision: 0.01,
        }),
        status: "PENDING",
        created_at: randomPastDate(60),
      },
    });
  }
  const cartStatuses = ["ACTIVE", "ABANDONED", "COMPLETED"];
  for (let i = 0; i < 50; i++) {
    const randomCustomer =
      customers[Math.floor(Math.random() * customers.length)];
    await prisma.carts.create({
      data: {
        tenant_id: tenantId,
        shopify_id: faker.string.uuid(),
        customer_id: randomCustomer.id,
        total_price: faker.number.float({
          min: 50,
          max: 5000,
          precision: 0.01,
        }),
        status: cartStatuses[Math.floor(Math.random() * cartStatuses.length)],
        created_at: randomPastDate(60),
      },
    });
  }
  const checkoutStatuses = ["STARTED", "ABANDONED", "COMPLETED"];
  for (let i = 0; i < 40; i++) {
    const randomCustomer =
      customers[Math.floor(Math.random() * customers.length)];
    await prisma.checkouts.create({
      data: {
        tenant_id: tenantId,
        shopify_id: faker.string.uuid(),
        customer_id: randomCustomer.id,
        total_price: faker.number.float({
          min: 50,
          max: 5000,
          precision: 0.01,
        }),
        status:
          checkoutStatuses[Math.floor(Math.random() * checkoutStatuses.length)],
        created_at: randomPastDate(60),
      },
    });
  }

  console.log("Seeding finished ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
