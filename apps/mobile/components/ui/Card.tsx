import React from 'react';
import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}

export function Card({
  children,
  className = '',
  padded = true,
  ...viewProps
}: CardProps) {
  return (
    <View
      className={`bg-white rounded-2xl shadow-sm shadow-black/10 ${
        padded ? 'p-4' : ''
      } ${className}`}
      style={{
        elevation: 2, // Android shadow
      }}
      {...viewProps}
    >
      {children}
    </View>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <View className={`pb-3 mb-3 border-b border-gray-100 ${className}`}>
      {children}
    </View>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <View className={className}>{children}</View>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <View className={`pt-3 mt-3 border-t border-gray-100 ${className}`}>
      {children}
    </View>
  );
}
