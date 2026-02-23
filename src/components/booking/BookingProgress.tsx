"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const STEPS = [
  { id: 1, label: "Search" },
  { id: 2, label: "Seats" },
  { id: 3, label: "Details" },
  { id: 4, label: "Payment" },
  { id: 5, label: "Confirmed" },
];

interface BookingProgressProps {
  currentStep: number;
}

export function BookingProgress({ currentStep }: BookingProgressProps) {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isLast = index === STEPS.length - 1;

          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    backgroundColor: isCompleted
                      ? "#dc2626"
                      : isActive
                        ? "#dc2626"
                        : "#e2e8f0",
                  }}
                  transition={{ duration: 0.3 }}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                    isActive ? "border-red-600 ring-4 ring-red-100" : "border-slate-200"
                  }`}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className="h-5 w-5 text-white" strokeWidth={3} />
                    </motion.div>
                  ) : (
                    <span
                      className={`text-sm font-semibold ${
                        isActive ? "text-white" : "text-slate-500"
                      }`}
                    >
                      {step.id}
                    </span>
                  )}
                </motion.div>
                <motion.span
                  animate={{ opacity: 1 }}
                  className={`mt-2 text-xs font-medium sm:text-sm ${
                    isActive ? "text-red-600" : isCompleted ? "text-slate-700" : "text-slate-400"
                  }`}
                >
                  {step.label}
                </motion.span>
              </div>
              {!isLast && (
                <div className="relative mx-2 h-0.5 flex-1 overflow-hidden bg-slate-200 sm:mx-4">
                  <motion.div
                    initial={false}
                    animate={{
                      width: isCompleted ? "100%" : "0%",
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-y-0 left-0 bg-red-500"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
