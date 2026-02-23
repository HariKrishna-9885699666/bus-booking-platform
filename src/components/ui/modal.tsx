"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  closeOnOverlayClick?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  className,
  closeOnOverlayClick = true,
}) => {
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [isAnimated, setIsAnimated] = React.useState(false);

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setIsAnimated(true));
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300",
        isAnimated ? "opacity-100" : "opacity-0"
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
    >
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        aria-hidden
      />
      <div
        ref={contentRef}
        className={cn(
          "relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl shadow-slate-900/20",
          "transition-all duration-300",
          isAnimated ? "opacity-100 scale-100" : "opacity-0 scale-95",
          "border border-slate-200/80",
          className
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>
        {(title || description) && (
          <div className="pr-10 mb-4">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-semibold text-slate-800"
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                id="modal-description"
                className="mt-1 text-sm text-slate-500"
              >
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export interface ModalHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const ModalHeader: React.FC<ModalHeaderProps> = ({
  className,
  ...props
}) => (
  <div className={cn("mb-4", className)} {...props} />
);

export interface ModalFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const ModalFooter: React.FC<ModalFooterProps> = ({
  className,
  ...props
}) => (
  <div
    className={cn("mt-6 flex items-center justify-end gap-3", className)}
    {...props}
  />
);

export { Modal, ModalHeader, ModalFooter };
