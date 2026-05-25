"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthContext";
import ToolCard from "@/components/ToolCard";
import { CATEGORIES } from "@/lib/categories";
import Link from "next/link";

type Tool = {
  id: string;
  name: string;
  category: string;
  description: string;
  available: boolean;
  deposit: number | null;
  owner: { name: string; apartment: string | null };
};

export default function Home() {
  const { user, loading } = useAuth();
  const [tools, setTools] = useState<Tool[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);

    const timer = setTimeout(() => {
      setFetching(true);
      fetch(`/api/tools?${params}`)
        .then((r) => r.json())
        .then((data) => setTools(data.tools ?? []))
        .finally(() => setFetching(false));
    }, search ? 300 : 0);

    return () => clearTimeout(timer);
  }, [search, category]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-6 py-16 text-center max-w-md mx-auto">
        <div className="text-6xl mb-6">🏠</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">ToolShed</h1>
        <p className="text-gray-500 mb-2 text-lg">Community Tool Sharing</p>
        <p className="text-gray-400 mb-8">
          Share tools with your neighbors. Borrow what you need, lend what you have. Save money and build community.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/register"
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Join your community
          </Link>
          <Link
            href="/login"
            className="text-gray-500 hover:text-gray-700 py-2"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 max-w-2xl mx-auto">
      {/* Search */}
      <div className="relative mb-4">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          placeholder="Search tools..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        <button
          onClick={() => setCategory("")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !category
              ? "bg-emerald-600 text-white"
              : "bg-white text-gray-600 border border-gray-200"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(category === cat.value ? "" : cat.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === cat.value
                ? "bg-emerald-600 text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Tool list */}
      {fetching ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin h-6 w-6 border-3 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      ) : tools.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">🔧</div>
          <p className="font-medium">No tools found</p>
          <p className="text-sm mt-1">Be the first to share a tool with your neighbors!</p>
          <Link
            href="/tools/new"
            className="inline-block mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700"
          >
            Add a tool
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tools.map((tool) => (
            <ToolCard key={tool.id} {...tool} />
          ))}
        </div>
      )}
    </div>
  );
}
