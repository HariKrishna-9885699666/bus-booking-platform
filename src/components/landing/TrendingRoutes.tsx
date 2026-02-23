"use client";

import { motion } from "framer-motion";
import { ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";

const routes = [
  { from: "Hyderabad", to: "Vijayawada", price: 450, buses: 85 },
  { from: "Hyderabad", to: "Visakhapatnam", price: 850, buses: 60 },
  { from: "Hyderabad", to: "Tirupati", price: 750, buses: 55 },
  { from: "Vijayawada", to: "Visakhapatnam", price: 500, buses: 40 },
  { from: "Hyderabad", to: "Warangal", price: 300, buses: 70 },
  { from: "Hyderabad", to: "Guntur", price: 500, buses: 45 },
];

function getTomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export function TrendingRoutes() {
  const tomorrow = getTomorrowDate();

  return (
    <section className="py-20 px-4 bg-white" id="trending">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <TrendingUp className="w-6 h-6 text-[var(--primary)]" />
            <span className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
              Popular Routes
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Trending Bus Routes
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Most booked routes across Telangana and Andhra Pradesh
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route, i) => (
            <motion.div
              key={`${route.from}-${route.to}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={`/search?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}&date=${tomorrow}`}
                className="group block rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-[var(--primary-light)] hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">
                      {route.from}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[var(--primary)]" />
                    <span className="font-semibold text-gray-900">
                      {route.to}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Starting from{" "}
                    <span className="text-lg font-bold text-[var(--primary)]">
                      ₹{route.price}
                    </span>
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                    {route.buses}+ buses daily
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
