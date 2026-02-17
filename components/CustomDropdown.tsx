"use client";

import { useState, useRef, useEffect, ReactNode } from "react";

type CustomDropdownProps = {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right" | "center";
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
};

export default function CustomDropdown({
  trigger,
  children,
  align = "left",
  side = "top",
  className = "",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const closeDropdown = () => setIsOpen(false);

  // Position classes based on side
  const positionClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2",
  }[side];

  // Alignment classes
  const alignClasses = {
    left: side === "left" || side === "right" ? "top-0" : "left-0",
    right: side === "left" || side === "right" ? "bottom-0" : "right-0",
    center:
      side === "left" || side === "right"
        ? "top-1/2 -translate-y-1/2"
        : "left-1/2 -translate-x-1/2",
  }[align];

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={`absolute ${positionClasses} ${alignClasses} bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 ${className}`}
          onClick={closeDropdown}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

export function DropdownHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-4 py-3 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export function DropdownDivider() {
  return <div className="border-t border-gray-200 my-1" />;
}
