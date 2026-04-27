import React from "react";

export default function Input({
  label,
  error,
  hint,
  className = "",
  inputClassName = "",
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-gh-text text-sm font-medium">{label}</label>
      )}
      <input
        className={`
          bg-gh-bg border rounded px-3 py-2 text-gh-text text-sm
          placeholder-gh-muted outline-none transition-colors
          ${error
            ? "border-gh-danger focus:border-gh-danger"
            : "border-gh-border focus:border-gh-blue"
          }
          ${inputClassName}
        `}
        {...props}
      />
      {error && <p className="text-gh-danger text-xs">{error}</p>}
      {hint && !error && <p className="text-gh-muted text-xs">{hint}</p>}
    </div>
  );
}