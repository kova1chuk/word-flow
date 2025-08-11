import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  ...rest
}) => {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
      )}
      <input
        className={[
          "w-full rounded-md border bg-white px-3 py-2 text-gray-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400",
          error
            ? "border-red-500 focus:ring-red-200"
            : "border-gray-300 dark:border-gray-700",
          className ?? "",
        ].join(" ")}
        {...rest}
      />
      {error && (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      )}
    </label>
  );
};

export default Input;
