"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const OFFERS = [
  {
    title: "First Trip 20% Off",
    code: "FIRST20",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    title: "Weekend Special ₹100 Off",
    code: "WEEKEND100",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    title: "Group Discount 15% Off",
    code: "GROUP15",
    gradient: "from-violet-500 to-purple-600",
  },
];

export function Offers() {
  return (
    <section className="py-16 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-bold text-gray-900 mb-10"
        >
          Special Offers
        </motion.h2>

        <div className="flex gap-6 overflow-x-auto pb-4 md:overflow-visible md:grid md:grid-cols-3 scrollbar-hide">
          {OFFERS.map((offer, i) => (
            <motion.div
              key={offer.code}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "flex-shrink-0 w-72 md:w-auto rounded-2xl p-6",
                "bg-gradient-to-br text-white shadow-lg",
                offer.gradient
              )}
            >
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-sm font-mono font-semibold mb-4">
                {offer.code}
              </span>
              <h3 className="text-xl font-bold">{offer.title}</h3>
              <p className="text-white/90 mt-2 text-sm">
                Use code at checkout
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
