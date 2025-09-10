"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { CheckCircle, AlertCircle, X } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";

type ToastType = "success" | "error";

interface Toast { id: string; type: ToastType; message: string }

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((t) => (
            <Alert
              key={t.id}
              className={`min-w-[300px] shadow-lg border-2 ${
                t.type === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {t.type === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription className="flex items-center justify-between">
                <span>{t.message}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 ml-2"
                  onClick={() => remove(t.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

