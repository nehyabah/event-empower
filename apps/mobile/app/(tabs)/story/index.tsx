import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function StoryScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-wedding-cream">
      <ScrollView className="flex-1 px-5 pt-6">
        <Text className="text-2xl font-serif font-bold text-wedding-navy mb-2">
          Our Story
        </Text>
        <Text className="text-sm text-gray-500 mb-6">
          Create and share your love story
        </Text>

        {/* Story Preview Card */}
        <Card className="mb-4">
          <View className="py-8 items-center">
            <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
              <Text className="text-2xl text-primary font-bold">
                {user?.name?.charAt(0) || '?'}
              </Text>
            </View>
            <Text className="text-lg font-semibold text-wedding-navy mb-1">
              {user?.name || 'Your Name'}
            </Text>
            <Text className="text-sm text-gray-400 mb-4">
              Your couple story has not been created yet
            </Text>
            <Button size="sm">
              Create Your Story
            </Button>
          </View>
        </Card>

        {/* Story Sections */}
        <Card className="mb-4">
          <Text className="text-base font-semibold text-wedding-navy mb-2">
            How We Met
          </Text>
          <Text className="text-sm text-gray-400">
            Share the story of how you first met...
          </Text>
        </Card>

        <Card className="mb-4">
          <Text className="text-base font-semibold text-wedding-navy mb-2">
            The Proposal
          </Text>
          <Text className="text-sm text-gray-400">
            Tell your proposal story...
          </Text>
        </Card>

        <Card className="mb-4">
          <Text className="text-base font-semibold text-wedding-navy mb-2">
            Photo Gallery
          </Text>
          <Text className="text-sm text-gray-400">
            Add photos to your story...
          </Text>
        </Card>

        <Button
          variant="outline"
          onPress={() => router.push('/(tabs)/story/preview')}
          className="mb-8"
        >
          Preview Story
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
