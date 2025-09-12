import prisma from "../prismaClient.js";
import redis from "../redisClient.js";

export const getCustomersApi = async (req, res) => {
  try {
    const tenant_id = req.tenant.tenant_id;
    const cacheKey = `customers:${tenant_id}`;
    
    console.log(`🔍 [CACHE] Checking cache for customers - Tenant: ${tenant_id}, Key: ${cacheKey}`);
    
    // Try to get data from Redis cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`✅ [CACHE HIT] Customers data found in cache for tenant ${tenant_id}`);
      return res.json({ customers: cachedData });
    }
    
    console.log(`❌ [CACHE MISS] Customers data not found in cache for tenant ${tenant_id}, fetching from database`);
    
    // If not in cache, fetch from database
    const customers = await prisma.customers.findMany({
      where: { tenant_id },
      orderBy: { created_at: "desc" },
    });
    
    // Cache the result for 5 minutes (300 seconds)
    await redis.setex(cacheKey, 300, JSON.stringify(customers));
    console.log(`💾 [CACHE SET] Customers data cached for tenant ${tenant_id} (TTL: 300s)`);
    
    res.json({ customers });
  } catch (err) {
    console.error(`❌ [ERROR] getCustomersApi failed for tenant ${req.tenant?.tenant_id}:`, err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getProductsApi = async (req, res) => {
  try {
    const tenant_id = req.tenant.tenant_id;
    const cacheKey = `products:${tenant_id}`;
    
    console.log(`🔍 [CACHE] Checking cache for products - Tenant: ${tenant_id}, Key: ${cacheKey}`);
    
    // Try to get data from Redis cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`✅ [CACHE HIT] Products data found in cache for tenant ${tenant_id}`);
      return res.json({ products: cachedData });
    }
    
    console.log(`❌ [CACHE MISS] Products data not found in cache for tenant ${tenant_id}, fetching from database`);
    
    // If not in cache, fetch from database
    const products = await prisma.products.findMany({
      where: { tenant_id },
      orderBy: { created_at: "desc" },
    });
    
    // Cache the result for 5 minutes (300 seconds)
    await redis.setex(cacheKey, 300, JSON.stringify(products));
    console.log(`💾 [CACHE SET] Products data cached for tenant ${tenant_id} (TTL: 300s)`);
    
    res.json({ products });
  } catch (err) {
    console.error(`❌ [ERROR] getProductsApi failed for tenant ${req.tenant?.tenant_id}:`, err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getOrdersApi = async (req, res) => {
  try {
    const tenant_id = req.tenant.tenant_id;
    const { from, to } = req.query;
    
    // Create cache key including query parameters
    const cacheKey = `orders:${tenant_id}:${from || 'all'}:${to || 'all'}`;
    
    console.log(`🔍 [CACHE] Checking cache for orders - Tenant: ${tenant_id}, Date Range: ${from || 'all'} to ${to || 'all'}, Key: ${cacheKey}`);
    
    // Try to get data from Redis cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`✅ [CACHE HIT] Orders data found in cache for tenant ${tenant_id} (${from || 'all'} to ${to || 'all'})`);
      return res.json({ orders: cachedData });
    }
    
    console.log(`❌ [CACHE MISS] Orders data not found in cache for tenant ${tenant_id}, fetching from database`);
    
    // If not in cache, fetch from database
    const orders = await prisma.orders.findMany({
      where: {
        tenant_id,
        created_at: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      include: {
        customers: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            shopify_id: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
    
    // Cache the result for 3 minutes (180 seconds) - shorter TTL for orders as they change more frequently
    await redis.setex(cacheKey, 180, JSON.stringify(orders));
    console.log(`💾 [CACHE SET] Orders data cached for tenant ${tenant_id} (TTL: 180s, Records: ${orders.length})`);
    
    res.json({ orders });
  } catch (err) {
    console.error(`❌ [ERROR] getOrdersApi failed for tenant ${req.tenant?.tenant_id}:`, err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getInsightsApi = async (req, res) => {
  try {
    const tenant_id = req.tenant.tenant_id;
    const cacheKey = `insights:${tenant_id}`;
    
    console.log(`🔍 [CACHE] Checking cache for insights - Tenant: ${tenant_id}, Key: ${cacheKey}`);
    
    // Try to get data from Redis cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`✅ [CACHE HIT] Insights data found in cache for tenant ${tenant_id}`);
      return res.json(cachedData);
    }
    
    console.log(`❌ [CACHE MISS] Insights data not found in cache for tenant ${tenant_id}, fetching from database`);
    
    // If not in cache, fetch from database
    console.log(`📊 [DB] Fetching insights data from database for tenant ${tenant_id}...`);
    const total_customers = await prisma.customers.count({
      where: { tenant_id },
    });

    const orderAgg = await prisma.orders.aggregate({
      _count: { id: true },
      _sum: { total_price: true },
      where: { tenant_id },
    });

    const top_customers = await prisma.customers.findMany({
      where: { tenant_id },
      orderBy: { total_spent: "desc" },
      take: 5,
    });

    const cartStats = await prisma.carts.groupBy({
      by: ["status"],
      where: { tenant_id },
      _count: { status: true },
    });

    const checkoutStats = await prisma.checkouts.groupBy({
      by: ["status"],
      where: { tenant_id },
      _count: { status: true },
    });

    const cartSummary = cartStats.reduce((acc, cur) => {
      acc[cur.status] = cur._count.status;
      return acc;
    }, {});

    const checkoutSummary = checkoutStats.reduce((acc, cur) => {
      acc[cur.status] = cur._count.status;
      return acc;
    }, {});

    const insightsData = {
      total_customers,
      total_orders: orderAgg._count.id,
      total_revenue: orderAgg._sum.total_price || 0,
      top_customers,
      cart_summary: cartSummary,
      checkout_summary: checkoutSummary,
    };
    
    // Cache the result for 2 minutes (120 seconds) - shorter TTL for insights as they change frequently
    await redis.setex(cacheKey, 120, JSON.stringify(insightsData));
    console.log(`💾 [CACHE SET] Insights data cached for tenant ${tenant_id} (TTL: 120s, Customers: ${total_customers}, Orders: ${orderAgg._count.id}, Revenue: $${orderAgg._sum.total_price || 0})`);
    
    res.json(insightsData);
  } catch (err) {
    console.error(`❌ [ERROR] getInsightsApi failed for tenant ${req.tenant?.tenant_id}:`, err.message);
    res.status(500).json({ error: err.message });
  }
};

// Cache invalidation functions
export const invalidateCustomerCache = async (tenant_id) => {
  try {
    console.log(`🗑️ [CACHE INVALIDATE] Invalidating customer cache for tenant ${tenant_id}`);
    await redis.del(`customers:${tenant_id}`);
    await redis.del(`insights:${tenant_id}`); // Also invalidate insights as it depends on customers
    console.log(`✅ [CACHE INVALIDATE] Customer and insights cache cleared for tenant ${tenant_id}`);
  } catch (err) {
    console.error(`❌ [CACHE ERROR] Error invalidating customer cache for tenant ${tenant_id}:`, err.message);
  }
};

export const invalidateProductCache = async (tenant_id) => {
  try {
    console.log(`🗑️ [CACHE INVALIDATE] Invalidating product cache for tenant ${tenant_id}`);
    await redis.del(`products:${tenant_id}`);
    console.log(`✅ [CACHE INVALIDATE] Product cache cleared for tenant ${tenant_id}`);
  } catch (err) {
    console.error(`❌ [CACHE ERROR] Error invalidating product cache for tenant ${tenant_id}:`, err.message);
  }
};

export const invalidateOrderCache = async (tenant_id) => {
  try {
    console.log(`🗑️ [CACHE INVALIDATE] Invalidating order cache for tenant ${tenant_id}`);
    // Invalidate all order caches for this tenant (including different date ranges)
    const pattern = `orders:${tenant_id}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`✅ [CACHE INVALIDATE] Cleared ${keys.length} order cache entries for tenant ${tenant_id}`);
    } else {
      console.log(`ℹ️ [CACHE INVALIDATE] No order cache entries found for tenant ${tenant_id}`);
    }
    await redis.del(`insights:${tenant_id}`); // Also invalidate insights as it depends on orders
    console.log(`✅ [CACHE INVALIDATE] Order and insights cache cleared for tenant ${tenant_id}`);
  } catch (err) {
    console.error(`❌ [CACHE ERROR] Error invalidating order cache for tenant ${tenant_id}:`, err.message);
  }
};

export const invalidateInsightsCache = async (tenant_id) => {
  try {
    console.log(`🗑️ [CACHE INVALIDATE] Invalidating insights cache for tenant ${tenant_id}`);
    await redis.del(`insights:${tenant_id}`);
    console.log(`✅ [CACHE INVALIDATE] Insights cache cleared for tenant ${tenant_id}`);
  } catch (err) {
    console.error(`❌ [CACHE ERROR] Error invalidating insights cache for tenant ${tenant_id}:`, err.message);
  }
};

// Clear all cache for a tenant
export const clearAllCache = async (tenant_id) => {
  try {
    console.log(`🗑️ [CACHE CLEAR] Clearing all cache for tenant ${tenant_id}`);
    const patterns = [
      `customers:${tenant_id}`,
      `products:${tenant_id}`,
      `insights:${tenant_id}`,
      `orders:${tenant_id}:*`
    ];
    
    let totalCleared = 0;
    for (const pattern of patterns) {
      if (pattern.includes('*')) {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
          totalCleared += keys.length;
          console.log(`🗑️ [CACHE CLEAR] Cleared ${keys.length} entries matching pattern: ${pattern}`);
        }
      } else {
        await redis.del(pattern);
        totalCleared += 1;
        console.log(`🗑️ [CACHE CLEAR] Cleared entry: ${pattern}`);
      }
    }
    console.log(`✅ [CACHE CLEAR] Successfully cleared ${totalCleared} cache entries for tenant ${tenant_id}`);
  } catch (err) {
    console.error(`❌ [CACHE ERROR] Error clearing all cache for tenant ${tenant_id}:`, err.message);
  }
};
