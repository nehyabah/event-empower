import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CalendarScreen() {
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

        <Text className="text-2xl font-serif font-bold text-wedding-navy mb-2">
          Calendar
        </Text>
        <Text className="text-sm text-gray-500 mb-6">
          Your wedding timeline and upcoming appointments
        </Text>

        {/* Calendar Placeholder */}
        <Card className="mb-4">
          <View className="py-10 items-center">
            <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
              <Text className="text-2xl text-primary">📅</Text>
            </View>
            <Text className="text-base font-semibold text-wedding-navy mb-1">
              Calendar View
            </Text>
            <Text className="text-sm text-gray-400 text-center px-4">
              A full calendar component will be integrated here to show your wedding
              timeline, vendor appointments, and important dates.
            </Text>
          </View>
        </Card>

        {/* Upcoming Events */}
        <Card className="mb-4">
          <Text className="text-base font-semibold text-wedding-navy mb-3">
            Upcoming Events
          </Text>
          <View className="py-6 items-center">
            <Text className="text-sm text-gray-400">
              No upcoming events. Add appointments and deadlines to see them here.
            </Text>
          </View>
        </Card>

        {/* Milestones */}
        <Card className="mb-8">
          <Text className="text-base font-semibold text-wedding-navy mb-3">
            Key Milestones
          </Text>
          <View className="py-6 items-center">
            <Text className="text-sm text-gray-400">
              Set your wedding date to generate planning milestones.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
