import { View, Text, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';

const PLANNING_SECTIONS = [
  {
    title: 'Todo Lists',
    description: 'Track your wedding tasks and checklist items',
    icon: 'checkmark-circle-outline' as const,
    href: '/(tabs)/planning/todos',
  },
  {
    title: 'Expenses',
    description: 'Manage your wedding budget and expenses',
    icon: 'wallet-outline' as const,
    href: '/(tabs)/planning/expenses',
  },
  {
    title: 'Calendar',
    description: 'View your wedding timeline and appointments',
    icon: 'calendar-outline' as const,
    href: '/(tabs)/planning/calendar',
  },
];

export default function PlanningHubScreen() {
  return (
    <SafeAreaView className="flex-1 bg-wedding-cream">
      <ScrollView className="flex-1 px-5 pt-6">
        <Text className="text-2xl font-serif font-bold text-wedding-navy mb-2">
          Planning Hub
        </Text>
        <Text className="text-sm text-gray-500 mb-6">
          Organize every detail of your special day
        </Text>

        {PLANNING_SECTIONS.map((section) => (
          <Pressable
            key={section.title}
            onPress={() => router.push(section.href)}
          >
            <Card className="mb-3">
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center mr-4">
                  <Ionicons name={section.icon} size={24} color="#D4AF37" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-wedding-navy">
                    {section.title}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-0.5">
                    {section.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </Card>
          </Pressable>
        ))}

        {/* Planning Progress */}
        <Card className="mt-4 mb-8">
          <Text className="text-base font-semibold text-wedding-navy mb-3">
            Overall Progress
          </Text>
          <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <View className="h-full bg-primary rounded-full" style={{ width: '0%' }} />
          </View>
          <Text className="text-xs text-gray-400 mt-2">
            0% complete -- start adding tasks to track your progress
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
