import React, { useState, useEffect } from "react";
import { dataAPI } from "../services/api";
import { Search, Package, DollarSign, Tag } from "lucide-react";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await dataAPI.getProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load products");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredProducts = products
    .filter((product) => {
      const title = (product.title || "").toLowerCase();
      return title.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      if (sortField === "price") {
        const aPrice = Number(a.price) || 0;
        const bPrice = Number(b.price) || 0;
        return sortDirection === "asc" ? aPrice - bPrice : bPrice - aPrice;
      }
      const aValue = (a[sortField] || "").toString().toLowerCase();
      const bValue = (b[sortField] || "").toString().toLowerCase();
      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
        <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                Products ({filteredProducts.length})
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage your product catalog
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-900 placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {product.title || "Untitled Product"}
                  </h4>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-300">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    <span className="text-xs mr-1">INR</span>
                    {Number(product.price || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-300">
                  <Tag className="h-4 w-4 mr-1" />
                  <span>id: {product.id}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>shopify_id: {product.shopify_id || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            No products found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
            {searchTerm
              ? "Try adjusting your search terms."
              : "No products available."}
          </p>
        </div>
      )}
    </div>
  );
};

export default Products;
