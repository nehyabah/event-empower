import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function VendorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView className="flex-1 bg-wedding-cream">
      <ScrollView className="flex-1 px-5 pt-6">
        <Button
          variant="ghost"
          onPress={() => router.back()}
          className="self-start mb-4"
        >
          Back
        </Button>

        <Text className="text-2xl font-serif font-bold text-wedding-navy mb-2">
          Vendor Details
        </Text>
        <Text className="text-sm text-gray-500 mb-6">
          Vendor ID: {id}
        </Text>

        <Card className="mb-4">
          <View className="items-center py-6">
            <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-4">
              <Text className="text-2xl text-primary font-bold">V</Text>
            </View>
            <Text className="text-lg font-semibold text-wedding-navy">
              Vendor Name
            </Text>
            <Text className="text-sm text-gray-500 mt-1">Category</Text>
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="text-base font-semibold text-wedding-navy mb-2">
            About
          </Text>
          <Text className="text-sm text-gray-500 leading-5">
            Vendor description and details will appear here once loaded from the API.
          </Text>
        </Card>

        <Card className="mb-4">
          <Text className="text-base font-semibold text-wedding-navy mb-2">
            Services & Pricing
          </Text>
          <Text className="text-sm text-gray-400">
            Pricing information will be displayed here.
          </Text>
        </Card>

        <Card className="mb-4">
          <Text className="text-base font-semibold text-wedding-navy mb-2">
            Reviews
          </Text>
          <Text className="text-sm text-gray-400">
            No reviews yet.
          </Text>
        </Card>

        <Button className="mb-8">
          Send Inquiry
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
