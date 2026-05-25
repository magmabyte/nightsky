"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import { getCategoryIcon } from "@/lib/categories";

type BorrowRequest = {
  id: string;
  status: string;
  message: string | null;
  startDate: string;
  endDate: string;
  tool: { id: string; name: string; category: string };
  borrower?: { id: string; name: string; apartment: string | null };
  lender?: { id: string; name: string; apartment: string | null };
};

export default function RequestsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [incoming, setIncoming] = useState<BorrowRequest[]>([]);
  const [outgoing, setOutgoing] = useState<BorrowRequest[]>([]);
  const [fetching, setFetching] = useState(true);
  const [tab, setTab] = useState<"incoming" | "outgoing">("incoming");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (!user) return;

    fetch("/api/requests")
      .then((r) => r.json())
      .then((data) => {
        setIncoming(data.incoming ?? []);
        setOutgoing(data.outgoing ?? []);
      })
      .finally(() => setFetching(false));
  }, [user, loading, router]);

  async function handleAction(id: string, status: string) {
    await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await fetch("/api/requests").then((r) => r.json());
    setIncoming(data.incoming ?? []);
    setOutgoing(data.outgoing ?? []);
  }

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const requests = tab === "incoming" ? incoming : outgoing;

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Requests</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4">
        <button
          onClick={() => setTab("incoming")}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "incoming"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500"
          }`}
        >
          Incoming ({incoming.length})
        </button>
        <button
          onClick={() => setTab("outgoing")}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "outgoing"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500"
          }`}
        >
          My requests ({outgoing.length})
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">📭</div>
          <p className="font-medium">
            {tab === "incoming" ? "No incoming requests" : "You haven't made any requests"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((req) => {
            const person = tab === "incoming" ? req.borrower : req.lender;
            return (
              <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">{getCategoryIcon(req.tool.category)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/tools/${req.tool.id}`} className="font-medium text-gray-900 hover:underline truncate">
                        {req.tool.name}
                      </Link>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
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
                    <div className="text-sm text-gray-500 mt-0.5">
                      {tab === "incoming" ? "From" : "To"}: {person?.name}
                      {person?.apartment ? ` (Apt ${person.apartment})` : ""}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                    </div>
                    {req.message && (
                      <p className="text-sm text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-2">
                        &ldquo;{req.message}&rdquo;
                      </p>
                    )}

                    {tab === "incoming" && req.status === "pending" && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleAction(req.id, "approved")}
                          className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(req.id, "denied")}
                          className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                    {tab === "incoming" && req.status === "approved" && (
                      <button
                        onClick={() => handleAction(req.id, "returned")}
                        className="w-full mt-3 border border-emerald-200 text-emerald-700 py-2 rounded-lg text-sm font-medium hover:bg-emerald-50"
                      >
                        Mark as returned
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
