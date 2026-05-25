"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import ToolCard from "@/components/ToolCard";
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

export default function MyToolsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tools, setTools] = useState<Tool[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (!user) return;

    fetch("/api/tools")
      .then((r) => r.json())
      .then((data) => {
        const myTools = (data.tools ?? []).filter((t: Tool & { owner: { id?: string } }) =>
          // Filter client-side since we know the user
          t.owner && "id" in t.owner && (t.owner as { id: string }).id === user.id
        );
        setTools(myTools);
      })
      .finally(() => setFetching(false));
  }, [user, loading, router]);

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">My Tools</h1>
        <Link
          href="/tools/new"
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
        >
          + Add tool
        </Link>
      </div>

      {tools.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">📦</div>
          <p className="font-medium">You haven&apos;t shared any tools yet</p>
          <p className="text-sm mt-1">Add your first tool for your neighbors to borrow!</p>
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
