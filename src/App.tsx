// BUG 4 FIX: key={id} on /clients/:id Route forces full remount when navigating between clients,
//             preventing stale strategyStatuses state from persisting across different client pages
// BUG 9 FIX: removed unused Index.tsx import (page exists but was never routed anywhere)
// BUG 10 FIX: QueryClient configured with retry: 1 and sensible staleTime defaults
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientWorkspace from "./pages/ClientWorkspace";
import Agents from "./pages/Agents";
import Knowledge from "./pages/Knowledge";
import Insights from "./pages/Insights";
import Deliverables from "./pages/Deliverables";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// BUG 10 FIX: configured with retry: 1 (not 3) and staleTime so failed queries don't spam retries
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// BUG 4 FIX: Wrapper forces key change on clientId so ClientWorkspace fully remounts between clients
function ClientWorkspaceWithKey() {
  const { id } = useParams<{ id: string }>();
  return <ClientWorkspace key={id} />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            {/* BUG 4 FIX: ClientWorkspaceWithKey provides key={id} to force remount on client change */}
            <Route path="/clients/:id" element={<ClientWorkspaceWithKey />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/knowledge" element={<Knowledge />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/deliverables" element={<Deliverables />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
