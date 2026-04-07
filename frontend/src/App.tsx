import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MemberProvider } from "@/contexts/MemberContext";
import Index from "./pages/Index.tsx";
import MemberPortal from "./pages/MemberPortal.tsx";
import StaffDesk from "./pages/StaffDesk.tsx";
import DatabaseManagement from "./pages/DatabaseManagement.tsx";
import Settings from "./pages/Settings.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MemberProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/member" element={<MemberPortal />} />
            <Route path="/staff/desk" element={<StaffDesk />} />
            <Route path="/staff/manage" element={<DatabaseManagement />} />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </MemberProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
