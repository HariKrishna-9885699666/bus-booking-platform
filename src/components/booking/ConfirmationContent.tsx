"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export function ConfirmationContent() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          delay: 0.2,
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
        className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500"
      >
        <motion.div
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <Check className="h-10 w-10 text-white" strokeWidth={3} />
        </motion.div>
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-2xl font-bold text-slate-800"
      >
        Booking Confirmed!
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-2 text-slate-600"
      >
        Your ticket has been booked successfully.
      </motion.p>
    </motion.div>
  );
}
