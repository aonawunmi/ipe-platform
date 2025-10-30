"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  ArrowLeft,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  TrendingDown as TrendingDownIcon,
  DollarSign,
} from "lucide-react";

interface WalletBalance {
  available: string;
  locked: string;
  total: string;
}

interface Transaction {
  id: string;
  transactionType: string;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  description: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export default function WalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    fetchWalletData();
  }, []);

  async function fetchWalletData() {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);

      // Fetch balance
      const balanceResponse = await fetch(`${API_URL}/wallets/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        setBalance(balanceData);
      }

      // Fetch transaction history
      const txResponse = await fetch(
        `${API_URL}/wallets/transactions?limit=50`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (txResponse.ok) {
        const txData = await txResponse.json();
        setTransactions(txData);
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatAmount(amount: string): string {
    return (parseInt(amount) / 100).toFixed(2);
  }

  function getTransactionIcon(type: string) {
    switch (type) {
      case "deposit":
        return <ArrowDownCircle className="h-5 w-5 text-green-600" />;
      case "withdrawal":
        return <ArrowUpCircle className="h-5 w-5 text-red-600" />;
      case "trade_buy":
      case "trade_sell":
        return <RefreshCw className="h-5 w-5 text-blue-600" />;
      case "settlement":
        return <DollarSign className="h-5 w-5 text-purple-600" />;
      default:
        return <TrendingDownIcon className="h-5 w-5 text-gray-600" />;
    }
  }

  function getTransactionColor(type: string): string {
    switch (type) {
      case "deposit":
        return "text-green-600";
      case "withdrawal":
        return "text-red-600";
      case "trade_buy":
      case "trade_sell":
        return "text-blue-600";
      case "settlement":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  }

  const filteredTransactions =
    filterType === "all"
      ? transactions
      : transactions.filter((tx) => tx.transactionType === filterType);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading wallet...</p>
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
        {/* Balance Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="h-6 w-6 text-blue-600" />
              <h3 className="text-sm font-medium text-gray-500">
                Available Balance
              </h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ₦{balance ? formatAmount(balance.available) : "0.00"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Ready for trading
            </p>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-2">
              <RefreshCw className="h-6 w-6 text-orange-600" />
              <h3 className="text-sm font-medium text-gray-500">
                Locked Balance
              </h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ₦{balance ? formatAmount(balance.locked) : "0.00"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              In active orders
            </p>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-6 w-6 text-green-600" />
              <h3 className="text-sm font-medium text-gray-500">
                Total Balance
              </h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ₦{balance ? formatAmount(balance.total) : "0.00"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Available + Locked
            </p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Transaction History
            </h2>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("deposit")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === "deposit"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Deposits
              </button>
              <button
                onClick={() => setFilterType("withdrawal")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === "withdrawal"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Withdrawals
              </button>
              <button
                onClick={() => setFilterType("trade_buy")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === "trade_buy"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Trades
              </button>
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Your transaction history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {getTransactionIcon(tx.transactionType)}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {tx.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${getTransactionColor(tx.transactionType)}`}
                    >
                      {parseInt(tx.amount) >= 0 ? "+" : ""}₦
                      {formatAmount(tx.amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Balance: ₦{formatAmount(tx.balanceAfter)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
