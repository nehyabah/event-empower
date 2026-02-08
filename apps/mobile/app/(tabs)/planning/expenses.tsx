import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ExpensesScreen() {
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
            Expenses
          </Text>
          <Button size="sm" variant="outline">
            Add Expense
          </Button>
        </View>

        {/* Budget Summary */}
        <Card className="mb-4">
          <Text className="text-base font-semibold text-wedding-navy mb-3">
            Budget Summary
          </Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-500">Total Budget</Text>
            <Text className="text-sm font-semibold text-wedding-navy">$0.00</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-500">Total Spent</Text>
            <Text className="text-sm font-semibold text-primary">$0.00</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500">Remaining</Text>
            <Text className="text-sm font-semibold text-green-600">$0.00</Text>
          </View>
          <View className="h-3 bg-gray-200 rounded-full overflow-hidden mt-4">
            <View className="h-full bg-primary rounded-full" style={{ width: '0%' }} />
          </View>
        </Card>

        {/* Expense Categories */}
        <Card className="mb-4">
          <Text className="text-base font-semibold text-wedding-navy mb-3">
            By Category
          </Text>
          <View className="py-6 items-center">
            <Text className="text-sm text-gray-400">
              No expenses recorded yet. Start tracking your wedding budget.
            </Text>
          </View>
        </Card>

        {/* Recent Expenses */}
        <Card className="mb-8">
          <Text className="text-base font-semibold text-wedding-navy mb-3">
            Recent Expenses
          </Text>
          <View className="py-6 items-center">
            <Text className="text-sm text-gray-400">
              No recent expenses.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
