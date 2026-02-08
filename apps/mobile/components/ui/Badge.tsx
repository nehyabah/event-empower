import React from 'react';
import { View, Text } from 'react-native';

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  textClassName?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100',
  primary: 'bg-primary/15',
  success: 'bg-green-100',
  warning: 'bg-amber-100',
  error: 'bg-red-100',
  info: 'bg-blue-100',
  outline: 'bg-transparent border border-gray-300',
};

const variantTextStyles: Record<BadgeVariant, string> = {
  default: 'text-gray-700',
  primary: 'text-primary',
  success: 'text-green-700',
  warning: 'text-amber-700',
  error: 'text-red-700',
  info: 'text-blue-700',
  outline: 'text-gray-600',
};

export function Badge({
  children,
  variant = 'default',
  className = '',
  textClassName = '',
}: BadgeProps) {
  return (
    <View
      className={`self-start px-2.5 py-1 rounded-full ${variantStyles[variant]} ${className}`}
    >
      {typeof children === 'string' ? (
        <Text
          className={`text-xs font-medium ${variantTextStyles[variant]} ${textClassName}`}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}
