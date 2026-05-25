"use client";

import Link from "next/link";
import { getCategoryIcon } from "@/lib/categories";

type ToolCardProps = {
  id: string;
  name: string;
  category: string;
  description: string;
  available: boolean;
  owner: { name: string; apartment?: string | null };
  deposit?: number | null;
};

export default function ToolCard({ id, name, category, description, available, owner, deposit }: ToolCardProps) {
  return (
    <Link
      href={`/tools/${id}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl flex-shrink-0">{getCategoryIcon(category)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                available
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {available ? "Available" : "Borrowed"}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>{owner.name}{owner.apartment ? ` - Apt ${owner.apartment}` : ""}</span>
            {deposit ? <span>Deposit: ${deposit}</span> : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
