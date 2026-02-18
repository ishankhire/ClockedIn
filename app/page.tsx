"use client";

import dynamic from "next/dynamic";

// Firebase cannot run during SSR — load the entire app client-side only.
// ssr: false must live inside a Client Component (Next.js 16 requirement).
const HomeClient = dynamic(() => import("@/components/HomeClient"), {
  ssr: false,
});

export default function Page() {
  return <HomeClient />;
}
