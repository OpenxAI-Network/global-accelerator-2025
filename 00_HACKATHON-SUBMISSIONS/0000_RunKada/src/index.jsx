import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Homepage } from "./screens/Homepage";
import { Rank } from "./screens/Rank";
import { About } from "./screens/About";
import { Clan } from "./screens/Clan";
import { Login } from "./screens/Login";

createRoot(document.getElementById("app")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/rank" element={<Rank />} />
        <Route path="/about" element={<About />} />
        <Route path="/clan" element={<Clan />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
