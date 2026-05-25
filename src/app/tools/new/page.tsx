"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { CATEGORIES } from "@/lib/categories";

export default function NewToolPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    deposit: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    router.push("/login");
    return null;
  }

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add tool");
        return;
      }

      router.push(`/tools/${data.tool.id}`);
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-6 py-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Share a tool</h1>
      <p className="text-gray-400 mb-6">Add a tool your neighbors can borrow</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tool name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="e.g. Bosch Cordless Drill"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            required
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            placeholder="Describe the tool, its condition, and any notes for borrowers"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deposit amount <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.deposit}
            onChange={(e) => update("deposit", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="0.00"
          />
          <p className="text-xs text-gray-400 mt-1">Optional security deposit for the tool</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 mt-2"
        >
          {submitting ? "Adding..." : "Add tool"}
        </button>
      </form>
    </div>
  );
}
