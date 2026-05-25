"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="px-6 py-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-400">{user.email}</div>
            {user.apartment && (
              <div className="text-sm text-gray-400">Apt {user.apartment}</div>
            )}
          </div>
        </div>

        {saved && (
          <div className="bg-emerald-50 text-emerald-600 text-sm px-4 py-3 rounded-lg mb-4">
            Profile updated!
          </div>
        )}

        <div className="border-t border-gray-100 pt-4">
          <button
            onClick={async () => {
              await logout();
              router.push("/");
            }}
            className="w-full text-red-500 py-3 rounded-xl font-medium hover:bg-red-50 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
