import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  type PressableProps,
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary active:bg-yellow-700',
  secondary: 'bg-secondary active:bg-gray-200',
  outline: 'bg-transparent border border-primary active:bg-primary/10',
  ghost: 'bg-transparent active:bg-gray-100',
  destructive: 'bg-red-600 active:bg-red-700',
};

const variantTextStyles: Record<ButtonVariant, string> = {
  primary: 'text-white font-semibold',
  secondary: 'text-wedding-navy font-semibold',
  outline: 'text-primary font-semibold',
  ghost: 'text-wedding-navy font-medium',
  destructive: 'text-white font-semibold',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 rounded-lg',
  md: 'px-5 py-3 rounded-xl',
  lg: 'px-6 py-4 rounded-xl',
};

const sizeTextStyles: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  textClassName = '',
  ...pressableProps
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      className={`flex-row items-center justify-center ${variantStyles[variant]} ${sizeStyles[size]} ${
        isDisabled ? 'opacity-50' : ''
      } ${className}`}
      disabled={isDisabled}
      {...pressableProps}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'destructive' ? '#FFFFFF' : '#D4AF37'}
          className="mr-2"
        />
      )}
      {typeof children === 'string' ? (
        <Text
          className={`${variantTextStyles[variant]} ${sizeTextStyles[size]} ${textClassName}`}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
