import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function StoryPreviewScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-wedding-cream">
      <ScrollView className="flex-1 px-5 pt-6">
        <Button
          variant="ghost"
          onPress={() => router.back()}
          className="self-start mb-2"
        >
          Back to Story
        </Button>

        <Text className="text-2xl font-serif font-bold text-wedding-navy mb-2">
          Story Preview
        </Text>
        <Text className="text-sm text-gray-500 mb-6">
          This is how your story will appear to guests
        </Text>

        {/* Preview Header */}
        <Card className="mb-4">
          <View className="items-center py-6">
            <Text className="text-xl font-serif font-bold text-wedding-navy">
              {user?.name || 'Your Names'}
            </Text>
            <View className="w-12 h-0.5 bg-primary my-3" />
            <Text className="text-sm text-gray-500">
              Our Love Story
            </Text>
          </View>
        </Card>

        {/* Preview Sections */}
        <Card className="mb-4">
          <Text className="text-base font-serif font-semibold text-wedding-navy mb-2">
            How We Met
          </Text>
          <Text className="text-sm text-gray-400 italic">
            Your story will appear here...
          </Text>
        </Card>

        <Card className="mb-4">
          <Text className="text-base font-serif font-semibold text-wedding-navy mb-2">
            The Proposal
          </Text>
          <Text className="text-sm text-gray-400 italic">
            Your proposal story will appear here...
          </Text>
        </Card>

        <Card className="mb-4">
          <Text className="text-base font-serif font-semibold text-wedding-navy mb-2">
            Gallery
          </Text>
          <View className="py-6 items-center">
            <Text className="text-sm text-gray-400 italic">
              Your photos will be displayed here...
            </Text>
          </View>
        </Card>

        <Button className="mb-4">
          Share Story Link
        </Button>

        <Button variant="outline" className="mb-8">
          Edit Story
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
