import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-wedding-cream">
      <ActivityIndicator size="large" color="#D4AF37" />
      {message && (
        <Text className="text-sm text-wedding-navy/60 mt-4">{message}</Text>
      )}
    </View>
  );
}
