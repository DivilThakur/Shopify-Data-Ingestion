import React, { useState, useEffect } from "react";
import { dataAPI } from "../services/api";
import {
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import { Users, ShoppingCart, DollarSign } from "lucide-react";

const Insights = () => {
  const [insights, setInsights] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const insightsData = await dataAPI.getInsights();
        setInsights(insightsData);

        const ordersData = await dataAPI.getOrders();
        setOrders(ordersData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load insights");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">{error}</div>
      </div>
    );
  }

  const revenueData = orders.reduce((acc, order) => {
    const date = new Date(order.created_at);
    const month = date.toLocaleString("default", { month: "short" });

    if (!acc[month]) {
      acc[month] = { month, revenue: 0, orders: 0 };
    }

    acc[month].revenue += Number(order.total_price || 0);
    acc[month].orders += 1;

    return acc;
  }, {});

  const revenueArray = Object.values(revenueData);

  const stats = [
    {
      name: "Total Customers",
      value: insights?.totalCustomers || 0,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      name: "Total Orders",
      value: insights?.totalOrders || 0,
      icon: ShoppingCart,
      color: "bg-green-500",
    },
    {
      name: "Total Revenue",
      value: `₹${Number(insights?.totalRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: "bg-yellow-500",
    },
    {
      name: "Carts Active",
      value: insights?.cartSummary?.ACTIVE || 0,
      icon: ShoppingCart,
      color: "bg-indigo-500",
    },
    {
      name: "Carts Abandoned",
      value: insights?.cartSummary?.ABANDONED || 0,
      icon: ShoppingCart,
      color: "bg-red-500",
    },
    {
      name: "Checkouts Started",
      value: insights?.checkoutSummary?.STARTED || 0,
      icon: ShoppingCart,
      color: "bg-purple-500",
    },
    {
      name: "Checkouts Abandoned",
      value: insights?.checkoutSummary?.ABANDONED || 0,
      icon: ShoppingCart,
      color: "bg-pink-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-md ${stat.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-xl font-semibold text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue & Orders Trend Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        {" "}
        {/* reduced padding */}
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Revenue & Orders Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={revenueArray}
            margin={{ top: 5, right: 10, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              tickFormatter={(value) => Number(value).toFixed(2)}
              width={60}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name?.includes("Revenue")) {
                  return [`₹${(+value).toFixed(3)}`, "Revenue"];
                }
                return [value, name];
              }}
            />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3B82F6"
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#10B981"
              name="Orders"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Customers */}
      {insights?.topCustomers && insights.topCustomers.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Top Customers
            </h3>
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {insights.topCustomers.map((customer, index) => {
                  const name =
                    `${customer.first_name || ""} ${
                      customer.last_name || ""
                    }`.trim() ||
                    customer.email ||
                    "Unknown Customer";
                  return (
                    <li key={customer.id || index} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200">
                            <span className="text-sm font-medium text-gray-700">
                              {name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {customer.email || "No email"}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ₹{Number(customer.total_spent || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Insights;
