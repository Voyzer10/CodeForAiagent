"use client";

import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#030604] via-[#041208] to-[#030604] text-white">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading.</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
