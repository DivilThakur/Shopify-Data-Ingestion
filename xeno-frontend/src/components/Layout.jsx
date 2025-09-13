import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Products", href: "/products", icon: Package },
    { name: "Orders", href: "/orders", icon: ShoppingCart },
    { name: "Insights", href: "/insights", icon: BarChart3 },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-fade">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Xeno Dashboard
              </h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive(item.href)
                        ? "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                    } group flex items-center px-3 py-2 text-base font-medium rounded-md transition-all`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between w-full">
              <div className="ml-1">
                <p className="text-base font-medium text-gray-700 dark:text-gray-200">
                  {user?.name || "Tenant"}
                </p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={toggle}
                className="inline-flex items-center px-3 py-2 rounded-md text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Dashboard
              </h1>
            </div>
            <nav className="mt-5 flex-1 px-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive(item.href)
                        ? "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                    } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between w-full">
              <div className="ml-1">
                <p className="text-base font-medium text-gray-700 dark:text-gray-200">
                  {user?.name || "Tenant"}
                </p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={toggle}
                className="inline-flex items-center px-3 py-2 rounded-md text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <div className="sticky top-0 z-10 lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50 dark:bg-gray-900">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <div className="md:flex md:items-center md:justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0 mb-4 md:mb-0">
                  <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:text-3xl sm:truncate">
                    {navigation.find((item) => isActive(item.href))?.name ||
                      "Dashboard"}
                  </h2>
                </div>
                <div className="mt-2 md:mt-0 flex gap-2">
                  <button
                    onClick={toggle}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4 mr-2" />
                    ) : (
                      <Moon className="h-4 w-4 mr-2" />
                    )}
                    {theme === "dark" ? "Light" : "Dark"} mode
                  </button>
                  <button
                    onClick={logout}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
              <div className="space-y-6">{children}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
