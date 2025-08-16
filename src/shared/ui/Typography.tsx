import React from "react";

type TextVariant = "h1" | "h2" | "h3" | "subtitle" | "body" | "muted";

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  variant?: TextVariant;
}

const variantClass: Record<TextVariant, string> = {
  h1: "text-3xl font-bold",
  h2: "text-2xl font-semibold",
  h3: "text-xl font-semibold",
  subtitle: "text-sm text-gray-600 dark:text-gray-400",
  body: "text-base",
  muted: "text-sm text-gray-500 dark:text-gray-400",
};

export const Text: React.FC<TextProps> = ({ as: As = "p", variant = "body", className, children, ...rest }) => {
  return (
    <As className={[variantClass[variant], className ?? ""].join(" ")} {...rest}>
      {children}
    </As>
  );
};

export default Text;


