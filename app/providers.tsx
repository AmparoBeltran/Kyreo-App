"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth";
import { ServiceWorkerRegistrar } from "@/components/sw-register";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Small dataset (47 diagnostics, 11 articles) and Firestore reads
            // cost money, so cache generously and refetch on demand instead of
            // on every mount — the old app re-downloaded both collections in
            // full on every single page load.
            staleTime: 5 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster position="top-center" richColors closeButton />
        <ServiceWorkerRegistrar />
      </AuthProvider>
    </QueryClientProvider>
  );
}
