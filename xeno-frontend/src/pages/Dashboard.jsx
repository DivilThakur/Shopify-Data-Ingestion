import React, { useState, useEffect } from "react";
import { dataAPI } from "../services/api";
import { Users, ShoppingCart, DollarSign } from "lucide-react";

const Dashboard = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const data = await dataAPI.getInsights();
        setInsights(data);
      } catch (err) {
        setError("Failed to load insights");
        console.error("Error fetching insights:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
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
      value: `$${Number(insights?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="space-y-6">
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
                      <dd className="text-lg font-medium text-gray-900">
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
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
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
                            $
                            {Number(customer.total_spent || 0).toLocaleString()}
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

export default Dashboard;
