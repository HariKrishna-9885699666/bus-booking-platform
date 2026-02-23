import HeroWrapper from "@/components/landing/HeroWrapper";
import { SearchWidget, TrendingRoutes, Offers, WhyChooseUs, Footer, Navbar } from "@/components/landing";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="relative">
        <HeroWrapper />
        <div className="absolute bottom-0 left-0 right-0 z-10 transform translate-y-1/2">
          <div className="max-w-5xl mx-auto px-4">
            <SearchWidget />
          </div>
        </div>
      </div>
      <div className="pt-32">
        <TrendingRoutes />
      </div>
      <Offers />
      <WhyChooseUs />
      <Footer />
    </main>
  );
}
