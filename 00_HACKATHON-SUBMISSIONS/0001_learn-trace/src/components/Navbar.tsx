"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "../../public/logo1.png";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
      {/* Logo */}
      <div className="text-xl font-bold text-blue-600 flex">
        <Image src={logo} alt="" width={40} height={40} />
        <div className="pt-1">LearnTrace</div>
      </div>

      {/* Menu */}
      <ul className="flex items-center gap-6 text-gray-700">
        <button>
          <li className="text-blue-600 font-medium cursor-pointer">Home</li>
        </button>
        <button>
          <li className="cursor-pointer">Features</li>
        </button>
        <button>
          <li className="cursor-pointer">Map</li>
        </button>
        <button>
          <li className="cursor-pointer">About</li>
        </button>
      </ul>

      {/* Theme Toggle */}
      <button
        onClick={() => {
          router.push("/login");
        }}
        className="p-2 w-[80px] rounded-xl bg-blue-500 border border-gray-300 cursor-pointer"
      >
        Login
      </button>
    </nav>
  );
}
