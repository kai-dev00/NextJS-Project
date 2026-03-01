"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(0);
  const [mounted, setMounted] = useState(false); // 👈

  useEffect(() => {
    setMounted(true); // 👈 only runs on client
  }, []);

  useEffect(() => {
    if (!mounted) return; // 👈 skip on first mount
    setLoading(true);
    setWidth(30);

    const timer1 = setTimeout(() => setWidth(70), 100);
    const timer2 = setTimeout(() => setWidth(100), 300);
    const timer3 = setTimeout(() => {
      setLoading(false);
      setWidth(0);
    }, 600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [pathname, searchParams, mounted]);

  if (!mounted || !loading) return null;

  return (
    <div
      className="h-1 bg-primary transition-all duration-300 ease-in-out"
      style={{ width: `${width}%` }}
    />
  );
}
