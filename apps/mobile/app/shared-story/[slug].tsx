import { View, Text, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Card } from '@/components/ui/Card';

export default function SharedStoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  return (
    <SafeAreaView className="flex-1 bg-wedding-cream">
      <ScrollView className="flex-1 px-5 pt-6">
        {/* Story Header */}
        <View className="items-center py-8">
          <Text className="text-3xl font-serif font-bold text-wedding-navy">
            A Love Story
          </Text>
          <View className="w-12 h-0.5 bg-primary my-4" />
          <Text className="text-sm text-gray-500">
            Shared story: {slug}
          </Text>
        </View>

        {/* Story Content Placeholder */}
        <Card className="mb-4">
          <Text className="text-base font-serif font-semibold text-wedding-navy mb-2">
            How We Met
          </Text>
          <Text className="text-sm text-gray-400 leading-5">
            This shared story will be loaded from the API using the story slug.
            Guests and visitors can view the couple's love story through this
            shareable link.
          </Text>
        </Card>

        <Card className="mb-4">
          <Text className="text-base font-serif font-semibold text-wedding-navy mb-2">
            The Proposal
          </Text>
          <Text className="text-sm text-gray-400 leading-5">
            The proposal story section will appear here...
          </Text>
        </Card>

        <Card className="mb-4">
          <Text className="text-base font-serif font-semibold text-wedding-navy mb-2">
            Gallery
          </Text>
          <View className="py-8 items-center">
            <Text className="text-sm text-gray-400">
              Photo gallery will be displayed here.
            </Text>
          </View>
        </Card>

        {/* RSVP CTA */}
        <Card className="mb-8">
          <View className="items-center py-4">
            <Text className="text-base font-semibold text-wedding-navy mb-2">
              You're Invited!
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              If you have an RSVP code, use it to confirm your attendance.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
