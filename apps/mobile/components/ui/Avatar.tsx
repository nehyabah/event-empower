import React, { useState } from 'react';
import { View, Text, Image, type ImageSourcePropType } from 'react-native';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: ImageSourcePropType | null;
  uri?: string | null;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  xs: 'w-8 h-8',
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const textSizeStyles: Record<AvatarSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-3xl',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({
  source,
  uri,
  name = '',
  size = 'md',
  className = '',
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const imageSource = source ?? (uri ? { uri } : null);
  const showImage = imageSource && !imageError;

  return (
    <View
      className={`${sizeStyles[size]} rounded-full overflow-hidden items-center justify-center bg-primary/20 ${className}`}
    >
      {showImage ? (
        <Image
          source={imageSource}
          className="w-full h-full"
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <Text className={`${textSizeStyles[size]} font-semibold text-primary`}>
          {name ? getInitials(name) : '?'}
        </Text>
      )}
    </View>
  );
}
