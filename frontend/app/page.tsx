import Link from "next/link";
import { TrendingUp, Shield, BarChart3, Users } from "lucide-react";

export default function HomePage() {
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
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Nigeria&apos;s First Regulated
            <br />
            <span className="text-blue-600">Prediction Market</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Trade on real-world events. Generate crowd-sourced probability data
            for policymakers, businesses, and investors.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
            >
              Start Trading
            </Link>
            <Link
              href="/markets"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors font-semibold text-lg"
            >
              Explore Markets
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Shield className="h-12 w-12 text-blue-600" />}
            title="SEC Regulated"
            description="Fully compliant with Nigerian securities regulations and CBN guidelines"
          />
          <FeatureCard
            icon={<BarChart3 className="h-12 w-12 text-blue-600" />}
            title="Real-Time Data"
            description="Live market prices and crowd-sourced probability forecasts"
          />
          <FeatureCard
            icon={<Users className="h-12 w-12 text-blue-600" />}
            title="Naira-Based"
            description="Trade in Nigerian Naira with trusted payment partners like Paystack"
          />
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <StatCard number="1,000+" label="Active Users" />
            <StatCard number="10+" label="Live Markets" />
            <StatCard number="₦5M+" label="Trading Volume" />
            <StatCard number="99.5%" label="Uptime" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Ready to Start Trading?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Join Nigeria&apos;s prediction market revolution today
        </p>
        <Link
          href="/register"
          className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg inline-block"
        >
          Create Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-bold text-gray-900">IPE</span>
            </div>
            <p className="text-gray-600">
              © 2025 Information Prediction Exchange. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold mb-2">{number}</div>
      <div className="text-blue-100">{label}</div>
    </div>
  );
}
