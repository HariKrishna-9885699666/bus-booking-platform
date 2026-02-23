"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Clock,
  Wallet,
  Headphones,
  RefreshCw,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: MapPin,
    title: "1000+ Routes",
    description: "Connect to major cities across Telangana and Andhra Pradesh",
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "Verified operators and secure payment processing",
  },
  {
    icon: Wallet,
    title: "Best Prices",
    description: "Compare fares and get the best deals on every trip",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Round-the-clock customer support for all your queries",
  },
  {
    icon: RefreshCw,
    title: "Easy Cancellation",
    description: "Flexible cancellation options with hassle-free refunds",
  },
  {
    icon: Clock,
    title: "Live Tracking",
    description: "Track your bus in real-time and never miss your ride",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function WhyChooseUs() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-bold text-gray-900 mb-10"
        >
          Why Choose Us
        </motion.h2>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className={cn(
                "p-6 rounded-2xl bg-white border border-gray-200",
                "hover:shadow-lg hover:border-red-100 transition-all duration-300"
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 mb-4">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
