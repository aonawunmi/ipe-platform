"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Clock,
  Users,
  ArrowLeft,
  Filter,
  Search,
  Wallet,
  BarChart3,
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
  uniqueTraders: number;
  closeAt: string;
  status: string;
}

export default function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    fetchMarkets();
  }, [selectedCategory]);

  async function fetchMarkets() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }

      const response = await fetch(
        `${API_URL}/markets?${params.toString()}`
      );
      const data = await response.json();
      setMarkets(data);
    } catch (error) {
      console.error("Error fetching markets:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredMarkets = markets.filter((market) =>
    market.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [
    { value: "all", label: "All Markets" },
    { value: "macroeconomics", label: "Macroeconomics" },
    { value: "capital_markets", label: "Capital Markets" },
    { value: "public_policy", label: "Public Policy" },
    { value: "corporate_events", label: "Corporate Events" },
    { value: "entertainment", label: "Entertainment" },
    { value: "sports", label: "Sports" },
    { value: "technology", label: "Technology" },
    { value: "other", label: "Other" },
  ];

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
              <Link href="/" className="text-gray-700 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Explore Markets
            </h1>
            <p className="text-lg text-gray-600">
              Trade on real-world events and earn from your predictions
            </p>
          </div>
          <Link
            href="/create-market"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Market
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white rounded-lg border p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="h-5 w-5 text-gray-500 flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === category.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Markets Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading markets...</p>
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No markets found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MarketCard({ market }: { market: Market }) {
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
      return hoursLeft > 0 ? `${hoursLeft}h left` : "Closing soon";
    }
    return `${daysLeft}d left`;
  };

  return (
    <Link href={`/markets/${market.id}`}>
      <div className="bg-white rounded-lg border hover:shadow-lg transition-shadow p-6 h-full flex flex-direction cursor-pointer">
        <div className="flex-1">
          {/* Category Badge */}
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-3 capitalize">
            {market.category.replace("_", " ")}
          </span>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {market.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {market.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{market.uniqueTraders}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{getTimeRemaining()}</span>
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-xs text-green-700 font-medium mb-1">
                YES
              </div>
              <div className="text-2xl font-bold text-green-700">
                {yesPrice}%
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <div className="text-xs text-red-700 font-medium mb-1">NO</div>
              <div className="text-2xl font-bold text-red-700">{noPrice}%</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
