"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  ArrowLeft,
  Users,
  Clock,
  BarChart3,
  TrendingDown,
  Wallet,
} from "lucide-react";

interface Market {
  id: string;
  marketCode: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  lastYesPrice: number;
  lastNoPrice: number;
  totalVolume: string;
  yesVolume: string;
  noVolume: string;
  uniqueTraders: number;
  closeAt: string;
  openAt: string;
  resolutionDeadline: string;
  status: string;
}

interface OrderBookEntry {
  price: number;
  quantity: number;
}

interface OrderBook {
  yes: OrderBookEntry[];
  no: OrderBookEntry[];
}

export default function MarketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const marketId = params.id as string;

  const [market, setMarket] = useState<Market | null>(null);
  const [orderBook, setOrderBook] = useState<OrderBook>({ yes: [], no: [] });
  const [loading, setLoading] = useState(true);
  const [selectedSide, setSelectedSide] = useState<"yes" | "no">("yes");
  const [orderPrice, setOrderPrice] = useState("");
  const [orderQuantity, setOrderQuantity] = useState("");
  const [placing, setPlacing] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    fetchMarketData();
    fetchOrderBook();
    // Refresh order book every 5 seconds
    const interval = setInterval(fetchOrderBook, 5000);
    return () => clearInterval(interval);
  }, [marketId]);

  async function fetchMarketData() {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/markets/${marketId}`);
      if (response.ok) {
        const data = await response.json();
        setMarket(data);
        // Set default price to current market price
        setOrderPrice((data.lastYesPrice / 100).toString());
      }
    } catch (error) {
      console.error("Error fetching market:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchOrderBook() {
    try {
      const response = await fetch(
        `${API_URL}/orders/orderbook/${marketId}`
      );
      if (response.ok) {
        const data = await response.json();
        setOrderBook(data);
      }
    } catch (error) {
      console.error("Error fetching order book:", error);
    }
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Please login to place orders");
      router.push("/login");
      return;
    }

    try {
      setPlacing(true);
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          marketId,
          side: selectedSide,
          price: Math.floor(parseFloat(orderPrice) * 100), // Convert to basis points
          quantity: parseInt(orderQuantity),
        }),
      });

      if (response.ok) {
        alert("Order placed successfully!");
        setOrderQuantity("");
        fetchOrderBook();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || "Failed to place order"}`);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading market...</p>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Market not found</p>
          <Link
            href="/markets"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            Back to Markets
          </Link>
        </div>
      </div>
    );
  }

  const yesPrice = (market.lastYesPrice / 100).toFixed(1);
  const noPrice = (market.lastNoPrice / 100).toFixed(1);

  // Calculate days left using current date
  const now = new Date();
  const closeDate = new Date(market.closeAt);
  const diffMs = closeDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  // Format the time remaining
  const getTimeRemaining = () => {
    if (daysLeft < 0) return "Closed";
    if (daysLeft === 0) {
      const hoursLeft = Math.ceil(diffMs / (1000 * 60 * 60));
      return hoursLeft > 0 ? `${hoursLeft}h` : "Closing soon";
    }
    return `${daysLeft}d`;
  };

  const costToWin = selectedSide === "yes"
    ? (parseFloat(orderPrice) * parseInt(orderQuantity || "0")) / 100
    : ((100 - parseFloat(orderPrice || "0")) * parseInt(orderQuantity || "0")) / 100;

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
            <div className="flex items-center gap-4">
              <Link
                href="/wallet"
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
              >
                <Wallet className="h-5 w-5" />
                <span className="hidden sm:inline">Wallet</span>
              </Link>
              <Link
                href="/portfolio"
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
              >
                <BarChart3 className="h-5 w-5" />
                <span className="hidden sm:inline">Portfolio</span>
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
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Market Header */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-3 capitalize">
                {market.category.replace("_", " ")}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {market.title}
              </h1>
              <p className="text-gray-600">{market.description}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {market.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatItem
              icon={<Users className="h-5 w-5" />}
              label="Traders"
              value={market.uniqueTraders.toString()}
            />
            <StatItem
              icon={<Clock className="h-5 w-5" />}
              label="Time Left"
              value={getTimeRemaining()}
            />
            <StatItem
              icon={<BarChart3 className="h-5 w-5" />}
              label="Total Volume"
              value={`₦${parseInt(market.totalVolume).toLocaleString()}`}
            />
            <StatItem
              icon={<TrendingUp className="h-5 w-5" />}
              label="Market Code"
              value={market.marketCode}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Prices & Order Book */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Prices */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Current Prices
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                  <div className="text-sm text-green-700 font-medium mb-2">
                    YES
                  </div>
                  <div className="text-4xl font-bold text-green-700 mb-2">
                    {yesPrice}%
                  </div>
                  <div className="text-sm text-green-600">
                    ₦{parseInt(market.yesVolume).toLocaleString()} volume
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
                  <div className="text-sm text-red-700 font-medium mb-2">
                    NO
                  </div>
                  <div className="text-4xl font-bold text-red-700 mb-2">
                    {noPrice}%
                  </div>
                  <div className="text-sm text-red-600">
                    ₦{parseInt(market.noVolume).toLocaleString()} volume
                  </div>
                </div>
              </div>
            </div>

            {/* Order Book */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Book
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {/* YES Orders */}
                <div>
                  <h3 className="text-sm font-semibold text-green-700 mb-2">
                    YES Orders
                  </h3>
                  {orderBook.yes.length === 0 ? (
                    <p className="text-sm text-gray-500">No open YES orders</p>
                  ) : (
                    <div className="space-y-1">
                      {orderBook.yes.slice(0, 10).map((order, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-sm py-1 border-b"
                        >
                          <span className="text-gray-700">
                            {(order.price / 100).toFixed(1)}%
                          </span>
                          <span className="text-gray-500">
                            {order.quantity} shares
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* NO Orders */}
                <div>
                  <h3 className="text-sm font-semibold text-red-700 mb-2">
                    NO Orders
                  </h3>
                  {orderBook.no.length === 0 ? (
                    <p className="text-sm text-gray-500">No open NO orders</p>
                  ) : (
                    <div className="space-y-1">
                      {orderBook.no.slice(0, 10).map((order, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-sm py-1 border-b"
                        >
                          <span className="text-gray-700">
                            {(order.price / 100).toFixed(1)}%
                          </span>
                          <span className="text-gray-500">
                            {order.quantity} shares
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Trading Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Place Order
              </h2>

              <form onSubmit={handlePlaceOrder} className="space-y-4">
                {/* Side Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSide("yes")}
                      className={`py-3 rounded-lg font-semibold transition-colors ${
                        selectedSide === "yes"
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Buy YES
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSide("no")}
                      className={`py-3 rounded-lg font-semibold transition-colors ${
                        selectedSide === "no"
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Buy NO
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={orderPrice}
                    onChange={(e) => setOrderPrice(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter price (0-100%)"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Market price: {selectedSide === "yes" ? yesPrice : noPrice}%
                  </p>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity (shares)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter quantity"
                    required
                  />
                </div>

                {/* Cost Summary */}
                {orderQuantity && orderPrice && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cost to buy:</span>
                      <span className="font-semibold">
                        ₦{costToWin.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Payout if wins:</span>
                      <span className="font-semibold text-green-600">
                        ₦{parseInt(orderQuantity || "0").toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Potential profit:</span>
                      <span className="font-semibold text-blue-600">
                        ₦{(parseInt(orderQuantity || "0") - costToWin).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={placing || !orderQuantity || !orderPrice}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    selectedSide === "yes"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {placing ? "Placing Order..." : `Place ${selectedSide.toUpperCase()} Order`}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-gray-500">{icon}</div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  );
}
