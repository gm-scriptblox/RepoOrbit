import React from "react";

export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`bg-gh-surface border border-gh-border rounded-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`px-4 py-3 border-b border-gh-border ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = "" }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}