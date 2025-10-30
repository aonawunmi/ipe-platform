"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  ArrowLeft,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  TrendingDown,
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  marketId: string;
  side: string;
  price: number;
  quantity: number;
  quantityFilled: number;
  amountLocked: string;
  amountFilled: string;
  status: string;
  createdAt: string;
  filledAt?: string;
}

interface Market {
  id: string;
  marketCode: string;
  title: string;
  lastYesPrice: number;
  lastNoPrice: number;
}

export default function PortfolioPage() {
  const router = useRouter();
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [markets, setMarkets] = useState<Map<string, Market>>(new Map());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"open" | "completed">("open");

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  async function fetchPortfolioData() {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);

      // Fetch user's orders
      const ordersResponse = await fetch("http://localhost:3000/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();

        // Separate open and completed orders
        const open = ordersData.filter(
          (order: Order) =>
            order.status === "open" ||
            order.status === "pending" ||
            order.status === "partially_filled"
        );
        const completed = ordersData.filter(
          (order: Order) =>
            order.status === "filled" ||
            order.status === "cancelled" ||
            order.status === "expired"
        );

        setOpenOrders(open);
        setCompletedOrders(completed);

        // Fetch market details for all unique market IDs
        const marketIds = [...new Set(ordersData.map((o: Order) => o.marketId))];
        const marketsMap = new Map<string, Market>();

        await Promise.all(
          marketIds.map(async (marketId) => {
            try {
              const marketResponse = await fetch(
                `http://localhost:3000/markets/${marketId}`
              );
              if (marketResponse.ok) {
                const marketData = await marketResponse.json();
                marketsMap.set(marketId, marketData);
              }
            } catch (error) {
              console.error(`Error fetching market ${marketId}:`, error);
            }
          })
        );

        setMarkets(marketsMap);
      }
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelOrder(orderId: string) {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      const response = await fetch(`http://localhost:3000/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert("Order cancelled successfully");
        fetchPortfolioData();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || "Failed to cancel order"}`);
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to cancel order. Please try again.");
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "open":
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      case "filled":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3" />
            Filled
          </span>
        );
      case "cancelled":
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle className="h-3 w-3" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      case "partially_filled":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <TrendingDown className="h-3 w-3" />
            Partial
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  }

  function renderOrderCard(order: Order) {
    const market = markets.get(order.marketId);
    const fillPercentage = (order.quantityFilled / order.quantity) * 100;

    return (
      <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {market?.title || "Loading..."}
            </h3>
            <p className="text-sm text-gray-500">
              {market?.marketCode} • {order.orderNumber}
            </p>
          </div>
          {getStatusBadge(order.status)}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs text-gray-500">Side</p>
            <p
              className={`text-sm font-semibold ${
                order.side === "yes" ? "text-green-600" : "text-red-600"
              }`}
            >
              {order.side.toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-sm font-semibold text-gray-900">
              {(order.price / 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Quantity</p>
            <p className="text-sm font-semibold text-gray-900">
              {order.quantityFilled} / {order.quantity} shares
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Amount</p>
            <p className="text-sm font-semibold text-gray-900">
              ₦{(parseInt(order.amountLocked) / 100).toFixed(2)}
            </p>
          </div>
        </div>

        {order.status === "partially_filled" && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Fill Progress</span>
              <span>{fillPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${fillPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <p className="text-xs text-gray-500">
            {order.filledAt
              ? `Filled ${new Date(order.filledAt).toLocaleDateString()}`
              : `Created ${new Date(order.createdAt).toLocaleDateString()}`}
          </p>
          {(order.status === "open" || order.status === "partially_filled") && (
            <button
              onClick={() => handleCancelOrder(order.id)}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">IPE</span>
            </Link>
            <Link
              href="/markets"
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Markets</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Portfolio</h1>
          <p className="text-gray-600">Track your orders and positions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <h3 className="text-sm font-medium text-gray-500">Open Orders</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{openOrders.length}</p>
            <p className="text-xs text-gray-500 mt-1">Active in market</p>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="text-sm font-medium text-gray-500">Completed</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {completedOrders.filter((o) => o.status === "filled").length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Filled orders</p>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {openOrders.length + completedOrders.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab("open")}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === "open"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Open Orders ({openOrders.length})
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === "completed"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Completed ({completedOrders.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "open" && (
              <>
                {openOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No open orders</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Your active orders will appear here
                    </p>
                    <Link
                      href="/markets"
                      className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Browse Markets
                    </Link>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {openOrders.map((order) => renderOrderCard(order))}
                  </div>
                )}
              </>
            )}

            {activeTab === "completed" && (
              <>
                {completedOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No completed orders</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Your completed trades will appear here
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {completedOrders.map((order) => renderOrderCard(order))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
