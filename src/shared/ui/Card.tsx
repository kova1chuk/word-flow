import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ header, footer, className, children, ...rest }) => {
  return (
    <div
      className={[
        "rounded-xl bg-white p-4 shadow-md dark:bg-gray-800 sm:p-6",
        className ?? "",
      ].join(" ")}
      {...rest}
    >
      {header && <div className="mb-4">{header}</div>}
      <div>{children}</div>
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
};

export default Card;


