"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  TrendingUp,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Plus,
  X,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const createMarketSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(500, "Title is too long"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(5000, "Description is too long"),
  category: z.enum([
    "macroeconomics",
    "capital_markets",
    "public_policy",
    "corporate_events",
    "entertainment",
    "sports",
    "technology",
    "other",
  ]),
  tags: z.string().min(1, "Please add at least one tag"),
  openAt: z.string().min(1, "Please select an opening date"),
  closeAt: z.string().min(1, "Please select a closing date"),
  resolutionDeadline: z.string().min(1, "Please select a resolution deadline"),
  resolutionSource: z.string().optional(),
  minTradeAmount: z.number().min(100, "Minimum must be at least ₦100"),
  maxTradeAmount: z.number().min(1000, "Maximum must be at least ₦1,000"),
});

type CreateMarketForm = z.infer<typeof createMarketSchema>;

export default function CreateMarketPage() {
  const router = useRouter();
  const { accessToken, user } = useAuthStore();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateMarketForm>({
    resolver: zodResolver(createMarketSchema),
    defaultValues: {
      minTradeAmount: 100,
      maxTradeAmount: 10000000,
    },
  });

  // Update tags field when tags array changes
  const updateTagsField = (newTags: string[]) => {
    setTags(newTags);
    setValue("tags", newTags.join(","));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      updateTagsField([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateTagsField(tags.filter((tag) => tag !== tagToRemove));
  };

  const onSubmit = async (data: CreateMarketForm) => {
    try {
      setIsLoading(true);
      setError("");

      if (!accessToken) {
        setError("You must be logged in to create a market");
        router.push("/login");
        return;
      }

      // Generate market code (will be overridden by backend if needed)
      const marketCode = `MKT-${new Date().getFullYear()}-${String(
        Math.floor(Math.random() * 1000)
      ).padStart(3, "0")}`;

      const response = await fetch(`${API_URL}/markets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          marketCode,
          title: data.title,
          description: data.description,
          category: data.category,
          tags: data.tags.split(",").map((t) => t.trim()),
          openAt: new Date(data.openAt).toISOString(),
          closeAt: new Date(data.closeAt).toISOString(),
          resolutionDeadline: new Date(data.resolutionDeadline).toISOString(),
          resolutionSource: data.resolutionSource || null,
          minTradeAmount: data.minTradeAmount,
          maxTradeAmount: data.maxTradeAmount,
          lastYesPrice: 5000, // Start at 50%
          lastNoPrice: 5000, // Start at 50%
          status: "active", // or "pending_review" if you want admin approval
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create market");
      }

      const market = await response.json();
      router.push(`/markets/${market.id}`);
    } catch (err: any) {
      const message = err.message || "Failed to create market. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
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
            <Link
              href="/markets"
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back to Markets</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Create New Market
        </h1>
        <p className="text-lg text-gray-600">
          Set up a prediction market for others to trade on
        </p>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">Market Question *</Label>
              <Input
                id="title"
                type="text"
                placeholder="Will Nigeria's inflation rate fall below 20% by December 2025?"
                {...register("title")}
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Frame as a clear yes/no question with a specific resolution
                date
              </p>
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description & Resolution Criteria *</Label>
              <textarea
                id="description"
                placeholder="This market resolves YES if Nigeria's official inflation rate as published by the National Bureau of Statistics falls below 20% by December 31, 2025. Resolution source: NBS official website."
                {...register("description")}
                className="mt-1.5 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Clearly explain what conditions lead to YES vs NO resolution and
                the official data source
              </p>
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                {...register("category")}
                className="mt-1.5 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags">Tags *</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  id="tags"
                  type="text"
                  placeholder="Add a tag (e.g., inflation, Nigeria)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {errors.tags && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.tags.message}
                </p>
              )}
            </div>

            {/* Dates */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="openAt">Trading Opens *</Label>
                <Input
                  id="openAt"
                  type="datetime-local"
                  {...register("openAt")}
                  className="mt-1.5"
                />
                {errors.openAt && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.openAt.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="closeAt">Trading Closes *</Label>
                <Input
                  id="closeAt"
                  type="datetime-local"
                  {...register("closeAt")}
                  className="mt-1.5"
                />
                {errors.closeAt && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.closeAt.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="resolutionDeadline">Resolution By *</Label>
                <Input
                  id="resolutionDeadline"
                  type="datetime-local"
                  {...register("resolutionDeadline")}
                  className="mt-1.5"
                />
                {errors.resolutionDeadline && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.resolutionDeadline.message}
                  </p>
                )}
              </div>
            </div>

            {/* Resolution Source */}
            <div>
              <Label htmlFor="resolutionSource">
                Resolution Source (Optional)
              </Label>
              <Input
                id="resolutionSource"
                type="text"
                placeholder="e.g., National Bureau of Statistics website"
                {...register("resolutionSource")}
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Official source for determining the outcome
              </p>
            </div>

            {/* Trade Limits */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minTradeAmount">
                  Minimum Trade (₦)
                </Label>
                <Input
                  id="minTradeAmount"
                  type="number"
                  {...register("minTradeAmount", { valueAsNumber: true })}
                  className="mt-1.5"
                />
                {errors.minTradeAmount && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.minTradeAmount.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="maxTradeAmount">
                  Maximum Trade (₦)
                </Label>
                <Input
                  id="maxTradeAmount"
                  type="number"
                  {...register("maxTradeAmount", { valueAsNumber: true })}
                  className="mt-1.5"
                />
                {errors.maxTradeAmount && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.maxTradeAmount.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/markets")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Market...
                  </>
                ) : (
                  "Create Market"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
