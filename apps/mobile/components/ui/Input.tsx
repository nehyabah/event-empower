import React, { useState } from 'react';
import { View, Text, TextInput, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  hint,
  containerClassName = '',
  className = '',
  ...textInputProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const borderStyle = error
    ? 'border-red-500'
    : isFocused
    ? 'border-primary'
    : 'border-gray-300';

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-sm font-medium text-wedding-navy mb-1.5">
          {label}
        </Text>
      )}
      <TextInput
        className={`bg-white border rounded-xl px-4 py-3 text-base text-wedding-navy ${borderStyle} ${className}`}
        placeholderTextColor="#9CA3AF"
        onFocus={(e) => {
          setIsFocused(true);
          textInputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          textInputProps.onBlur?.(e);
        }}
        {...textInputProps}
      />
      {error && (
        <Text className="text-xs text-red-500 mt-1">{error}</Text>
      )}
      {hint && !error && (
        <Text className="text-xs text-gray-400 mt-1">{hint}</Text>
      )}
    </View>
  );
}
