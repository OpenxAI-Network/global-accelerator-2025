import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { Homepage } from "./screens/Homepage";
import { Rank } from "./screens/Rank";
import { About } from "./screens/About";
import { Clan } from "./screens/Clan";
import { Login } from "./screens/Login";
import { Dashboard } from "./screens/Dashboard";
import { Profile } from "./screens/Profile";
import { Settings } from "./screens/Settings";
import { ClanDashboard } from "./screens/ClanDashboard";

createRoot(document.getElementById("app")).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/rank" element={<Rank />} />
          <Route path="/about" element={<About />} />
          <Route path="/clan" element={<Clan />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/clan-dashboard" element={<ClanDashboard />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
