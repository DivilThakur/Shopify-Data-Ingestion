-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "public"."carts" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "shopify_id" TEXT NOT NULL,
    "customer_id" INTEGER,
    "total_price" DECIMAL(65,30),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."checkouts" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "shopify_id" TEXT NOT NULL,
    "customer_id" INTEGER,
    "total_price" DECIMAL(65,30),
    "status" TEXT NOT NULL DEFAULT 'STARTED',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checkouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "carts_tenant_id_shopify_id_key" ON "public"."carts"("tenant_id", "shopify_id");

-- CreateIndex
CREATE UNIQUE INDEX "checkouts_tenant_id_shopify_id_key" ON "public"."checkouts"("tenant_id", "shopify_id");
