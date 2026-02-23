"use client";

import dynamic from "next/dynamic";

const Hero3D = dynamic(() => import("./Hero3D"), {
  ssr: false,
  loading: () => (
    <section className="relative w-full h-screen gradient-hero flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg opacity-70">Loading experience...</p>
      </div>
    </section>
  ),
});

export default function HeroWrapper() {
  return <Hero3D />;
}
