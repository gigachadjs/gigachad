import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { Router } from ".";

interface ChadAppProps {
  router: Router;
  queryClient: QueryClient;
}

export function ReactApp({ router, queryClient }: ChadAppProps) {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </React.StrictMode>
  );
}
