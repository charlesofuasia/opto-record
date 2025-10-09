import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className = "" }: CardProps) => (
  <div className={`bg-white shadow-md rounded-lg p-4 ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = "" }: CardProps) => (
  <div className={`mb-2 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = "" }: CardProps) => (
  <h3 className={`text-sm font-medium text-gray-500 ${className}`}>{children}</h3>
);

export const CardContent = ({ children, className = "" }: CardProps) => (
  <div className={className}>{children}</div>
);
