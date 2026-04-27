import React from "react";
import { Loader2 } from "lucide-react";

const variants = {
  primary: "bg-gh-accent hover:bg-gh-accent-hover text-white border border-gh-accent",
  secondary: "bg-gh-elevated hover:bg-gh-border text-gh-text border border-gh-border",
  danger: "bg-gh-danger hover:bg-gh-danger-hover text-white border border-gh-danger",
  blue: "bg-gh-blue hover:bg-gh-blue-hover text-white border border-gh-blue",
  ghost: "bg-transparent hover:bg-gh-elevated text-gh-muted hover:text-gh-text border border-transparent",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  className = "",
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded
        transition-colors duration-150 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : icon ? (
        React.cloneElement(icon, { size: size === "sm" ? 13 : 15 })
      ) : null}
      {children}
    </button>
  );
}