"use client";
import { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export default function ClientOnly({ children, fallback = null }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}


