"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { getCategoryIcon, getCategoryLabel } from "@/lib/categories";

type Tool = {
  id: string;
  name: string;
  category: string;
  description: string;
  available: boolean;
  deposit: number | null;
  createdAt: string;
  owner: { id: string; name: string; apartment: string | null; phone: string | null };
  borrowRequests: {
    id: string;
    status: string;
    message: string | null;
    startDate: string;
    endDate: string;
    borrower: { id: string; name: string; apartment: string | null };
  }[];
};

export default function ToolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [borrowForm, setBorrowForm] = useState({ message: "", startDate: "", endDate: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/tools/${id}`)
      .then((r) => r.json())
      .then((data) => setTool(data.tool ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleBorrow(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId: id, ...borrowForm }),
      });
      if (res.ok) {
        setShowBorrowForm(false);
        const fresh = await fetch(`/api/tools/${id}`).then((r) => r.json());
        setTool(fresh.tool);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRequestAction(requestId: string, status: string) {
    await fetch(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const fresh = await fetch(`/api/tools/${id}`).then((r) => r.json());
    setTool(fresh.tool);
  }

  async function handleDelete() {
    if (!confirm("Delete this tool? This cannot be undone.")) return;
    await fetch(`/api/tools/${id}`, { method: "DELETE" });
    router.push("/my-tools");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="px-6 py-12 text-center text-gray-400">
        <p className="text-lg">Tool not found</p>
      </div>
    );
  }

  const isOwner = user?.id === tool.owner.id;
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-start gap-4">
          <div className="text-5xl">{getCategoryIcon(tool.category)}</div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{tool.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-400">{getCategoryLabel(tool.category)}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  tool.available
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {tool.available ? "Available" : "Borrowed"}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-gray-600 leading-relaxed">{tool.description}</p>

        {tool.deposit && (
          <div className="mt-3 text-sm text-gray-500">
            Security deposit: <span className="font-medium">${tool.deposit}</span>
          </div>
        )}

        {/* Owner info */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-medium">
            {tool.owner.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900">{tool.owner.name}</div>
            {tool.owner.apartment && (
              <div className="text-sm text-gray-400">Apt {tool.owner.apartment}</div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {user && !isOwner && tool.available && (
        <div className="mb-4">
          {!showBorrowForm ? (
            <button
              onClick={() => setShowBorrowForm(true)}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700"
            >
              Request to borrow
            </button>
          ) : (
            <form onSubmit={handleBorrow} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
              <h3 className="font-medium text-gray-900">Borrow request</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">From</label>
                  <input
                    type="date"
                    required
                    min={today}
                    value={borrowForm.startDate}
                    onChange={(e) => setBorrowForm((p) => ({ ...p, startDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Until</label>
                  <input
                    type="date"
                    required
                    min={borrowForm.startDate || today}
                    value={borrowForm.endDate}
                    onChange={(e) => setBorrowForm((p) => ({ ...p, endDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <textarea
                placeholder="Add a message (optional)"
                value={borrowForm.message}
                onChange={(e) => setBorrowForm((p) => ({ ...p, message: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 text-sm"
                >
                  {submitting ? "Sending..." : "Send request"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBorrowForm(false)}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Owner controls */}
      {isOwner && (
        <div className="mb-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Your tool</h3>

            {/* Borrow requests */}
            {tool.borrowRequests.length > 0 ? (
              <div className="flex flex-col gap-3">
                {tool.borrowRequests.map((req) => (
                  <div key={req.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900 text-sm">{req.borrower.name}</span>
                        {req.borrower.apartment && (
                          <span className="text-gray-400 text-sm"> - Apt {req.borrower.apartment}</span>
                        )}
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          req.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : req.status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : req.status === "returned"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                    </div>
                    {req.message && (
                      <p className="text-sm text-gray-500 mt-1">{req.message}</p>
                    )}
                    {req.status === "pending" && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleRequestAction(req.id, "approved")}
                          className="flex-1 bg-emerald-600 text-white py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRequestAction(req.id, "denied")}
                          className="flex-1 border border-gray-200 text-gray-600 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                    {req.status === "approved" && (
                      <button
                        onClick={() => handleRequestAction(req.id, "returned")}
                        className="w-full mt-2 border border-emerald-200 text-emerald-700 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-50"
                      >
                        Mark as returned
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No borrow requests yet</p>
            )}

            <button
              onClick={handleDelete}
              className="w-full mt-4 text-red-500 text-sm hover:text-red-700 py-2"
            >
              Delete this tool
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
