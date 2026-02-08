import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-wedding-cream">
      <ScrollView className="flex-1 px-5 pt-6">
        <Text className="text-2xl font-serif font-bold text-wedding-navy">
          Welcome, {user?.name || 'Guest'}
        </Text>
        <Text className="text-sm text-gray-500 mt-1 mb-6">
          Your wedding dashboard
        </Text>

        {/* Wedding Countdown */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold text-wedding-navy mb-2">
            Wedding Countdown
          </Text>
          <Text className="text-4xl font-bold text-primary text-center py-4">
            -- days
          </Text>
          <Text className="text-sm text-gray-400 text-center">
            Set your wedding date to start the countdown
          </Text>
        </Card>

        {/* Quick Stats */}
        <Text className="text-lg font-semibold text-wedding-navy mb-3">
          Quick Stats
        </Text>
        <View className="flex-row gap-3 mb-4">
          <Card className="flex-1">
            <Text className="text-2xl font-bold text-primary">0</Text>
            <Text className="text-xs text-gray-500 mt-1">Vendors Booked</Text>
          </Card>
          <Card className="flex-1">
            <Text className="text-2xl font-bold text-primary">0</Text>
            <Text className="text-xs text-gray-500 mt-1">Tasks Done</Text>
          </Card>
        </View>

        <View className="flex-row gap-3 mb-6">
          <Card className="flex-1">
            <Text className="text-2xl font-bold text-primary">0</Text>
            <Text className="text-xs text-gray-500 mt-1">RSVPs</Text>
          </Card>
          <Card className="flex-1">
            <Text className="text-2xl font-bold text-primary">$0</Text>
            <Text className="text-xs text-gray-500 mt-1">Budget Spent</Text>
          </Card>
        </View>

        {/* Recent Activity Placeholder */}
        <Card className="mb-8">
          <Text className="text-lg font-semibold text-wedding-navy mb-2">
            Recent Activity
          </Text>
          <Text className="text-sm text-gray-400">
            No recent activity yet. Start planning your wedding to see updates here.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
