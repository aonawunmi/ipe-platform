"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  LogOut,
  User,
  Wallet,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, clearAuth, initializeAuth } =
    useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = () => {
    authApi.logout();
    clearAuth();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">IPE</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">
                Welcome, {user.fullName.split(" ")[0]}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to IPE Platform
          </h1>
          <p className="text-xl text-gray-600">
            Your prediction market trading dashboard
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Account Information
              </h2>
              <p className="text-gray-600">Your account details and status</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Verified
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <InfoItem label="Full Name" value={user.fullName} />
            <InfoItem label="Email" value={user.email} />
            <InfoItem label="Phone" value={user.phone || "Not provided"} />
            <InfoItem label="Role" value={user.role.toUpperCase()} />
            <InfoItem label="KYC Status" value={user.kycStatus} />
            <InfoItem label="KYC Tier" value={user.kycTier} />
            <InfoItem
              label="Email Verified"
              value={user.isEmailVerified ? "Yes" : "No"}
            />
            <InfoItem
              label="Account Status"
              value={user.isActive ? "Active" : "Inactive"}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <ActionCard
            icon={<Wallet className="h-8 w-8 text-blue-600" />}
            title="Wallet"
            description="Manage your deposits and withdrawals"
            link="/wallet"
          />
          <ActionCard
            icon={<BarChart3 className="h-8 w-8 text-blue-600" />}
            title="Markets"
            description="Browse and trade on live markets"
            link="/markets"
          />
          <ActionCard
            icon={<User className="h-8 w-8 text-blue-600" />}
            title="Profile"
            description="Update your account settings"
            link="/profile"
          />
        </div>

        {/* Getting Started */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-2">Getting Started</h3>
          <p className="mb-6 opacity-90">
            Complete your KYC verification to start trading on prediction
            markets
          </p>
          <Button
            variant="secondary"
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            Complete KYC Verification
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="text-base font-medium text-gray-900">{value}</div>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  link,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}) {
  return (
    <Link
      href={link}
      className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow group"
    >
      <div className="mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </Link>
  );
}
