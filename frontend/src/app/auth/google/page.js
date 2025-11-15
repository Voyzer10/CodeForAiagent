"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GoogleCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");

    if (token) {
      document.cookie = `token=${token}; path=/; SameSite=Lax`;
      router.push("/pages/userpanel");
    } else {
      router.push("/auth/login");
    }
  }, []);

  return (
    <div className="text-white flex justify-center items-center min-h-screen">
      <h1 className="text-xl">Connecting your Google account...</h1>
    </div>
  )
}
