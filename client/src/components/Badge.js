import React from "react";

const variants = {
  green: "bg-green-500/15 text-green-400 border border-green-500/20",
  red: "bg-red-500/15 text-red-400 border border-red-500/20",
  blue: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  yellow: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
  gray: "bg-gh-elevated text-gh-muted border border-gh-border",
  orange: "bg-orange-500/15 text-orange-400 border border-orange-500/20",
};

export default function Badge({ children, variant = "gray", className = "" }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}