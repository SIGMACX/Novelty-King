"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "400px",
        fontSize: "1.2rem",
        color: "var(--muted)"
      }}>
        <span className="lang-en-inline">Loading...</span>
        <span className="lang-zh-inline">加载中...</span>
      </div>
    );
  }

  // Don't render children until user is authenticated
  if (!user) {
    return null;
  }

  return children;
}
