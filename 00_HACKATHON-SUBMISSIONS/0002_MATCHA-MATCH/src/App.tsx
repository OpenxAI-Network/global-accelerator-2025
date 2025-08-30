// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AIFinder from "./pages/AIFinder";
import CalendarPage from "./pages/Calendar";
import MapPage from "./pages/MapPage";
import Discover from "./pages/Discover";
import Favorites from "./pages/Favorites";

// NEW (from your friend)
import Auth from "./pages/Auth";
import Preferences from "./pages/Preferences";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AIFinder />} />
          <Route path="/home" element={<Index />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/favorites" element={<Favorites />} />

          {/* new routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/preferences" element={<Preferences />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
