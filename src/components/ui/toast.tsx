"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  createdAt: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const DEFAULT_DURATION = 5000;

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const variantStyles = {
  success:
    "bg-emerald-50/95 backdrop-blur-md border-emerald-200/80 text-emerald-800 shadow-lg shadow-emerald-200/20",
  error:
    "bg-red-50/95 backdrop-blur-md border-red-200/80 text-red-800 shadow-lg shadow-red-200/20",
  warning:
    "bg-amber-50/95 backdrop-blur-md border-amber-200/80 text-amber-800 shadow-lg shadow-amber-200/20",
  info:
    "bg-blue-50/95 backdrop-blur-md border-blue-200/80 text-blue-800 shadow-lg shadow-blue-200/20",
};

const iconStyles = {
  success: "text-emerald-600",
  error: "text-red-600",
  warning: "text-amber-600",
  info: "text-blue-600",
};

function ToastItemComponent({
  toast,
  onRemove,
}: {
  toast: ToastItem;
  onRemove: (id: string) => void;
}) {
  const Icon = icons[toast.type];
  const duration = toast.duration ?? DEFAULT_DURATION;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onRemove]);

  return (
    <div
      role="alert"
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3 min-w-[320px] max-w-md",
        "transition-all duration-300",
        variantStyles[toast.type]
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0", iconStyles[toast.type])} />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="rounded-lg p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-1"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function ToastContainer({ toasts, removeToast }: { toasts: ToastItem[]; removeToast: (id: string) => void }) {
  return (
    <div
      className="fixed right-4 top-4 z-[100] flex flex-col gap-3"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItemComponent
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = React.useCallback(
    (message: string, type: ToastType = "info", duration?: number) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [
        ...prev,
        { id, message, type, duration, createdAt: Date.now() },
      ]);
    },
    []
  );

  const value = React.useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
      success: (msg: string, duration?: number) =>
        addToast(msg, "success", duration),
      error: (msg: string, duration?: number) => addToast(msg, "error", duration),
      warning: (msg: string, duration?: number) =>
        addToast(msg, "warning", duration),
      info: (msg: string, duration?: number) => addToast(msg, "info", duration),
    }),
    [toasts, addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <ToastContainer toasts={toasts} removeToast={removeToast} />,
          document.body
        )}
    </ToastContext.Provider>
  );
}

