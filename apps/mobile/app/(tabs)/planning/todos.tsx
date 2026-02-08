import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function TodosScreen() {
  return (
    <SafeAreaView className="flex-1 bg-wedding-cream">
      <ScrollView className="flex-1 px-5 pt-6">
        <Button
          variant="ghost"
          onPress={() => router.back()}
          className="self-start mb-2"
        >
          Back to Planning
        </Button>

        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-serif font-bold text-wedding-navy">
            Todo Lists
          </Text>
          <Button size="sm" variant="outline">
            Add Task
          </Button>
        </View>

        {/* Categories */}
        <Card className="mb-4">
          <Text className="text-base font-semibold text-wedding-navy mb-3">
            Pre-Wedding
          </Text>
          <View className="py-6 items-center">
            <Text className="text-sm text-gray-400">
              No tasks yet. Tap "Add Task" to create your first checklist item.
            </Text>
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="text-base font-semibold text-wedding-navy mb-3">
            Wedding Day
          </Text>
          <View className="py-6 items-center">
            <Text className="text-sm text-gray-400">
              No tasks yet.
            </Text>
          </View>
        </Card>

        <Card className="mb-8">
          <Text className="text-base font-semibold text-wedding-navy mb-3">
            Post-Wedding
          </Text>
          <View className="py-6 items-center">
            <Text className="text-sm text-gray-400">
              No tasks yet.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
