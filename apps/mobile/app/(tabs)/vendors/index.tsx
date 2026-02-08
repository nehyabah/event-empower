import { useState } from 'react';
import { View, Text, SafeAreaView, FlatList, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

// Placeholder vendor data
const PLACEHOLDER_VENDORS = [
  { id: '1', name: 'Sample Photographer', category: 'Photography', rating: 4.8 },
  { id: '2', name: 'Elegant Catering Co.', category: 'Catering', rating: 4.6 },
  { id: '3', name: 'Bloom Floral Design', category: 'Florist', rating: 4.9 },
  { id: '4', name: 'Melody DJs', category: 'Music & DJ', rating: 4.5 },
  { id: '5', name: 'Dream Venue Hall', category: 'Venue', rating: 4.7 },
];

export default function VendorsListScreen() {
  const [search, setSearch] = useState('');

  const filteredVendors = PLACEHOLDER_VENDORS.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-wedding-cream">
      <View className="px-5 pt-6 pb-3">
        <Text className="text-2xl font-serif font-bold text-wedding-navy mb-4">
          Vendors
        </Text>
        <Input
          placeholder="Search vendors..."
          value={search}
          onChangeText={setSearch}
          containerClassName="mb-0"
        />
      </View>

      <FlatList
        data={filteredVendors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/(tabs)/vendors/${item.id}`)}>
            <Card className="mb-3">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-wedding-navy">
                    {item.name}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-0.5">
                    {item.category}
                  </Text>
                </View>
                <View className="bg-primary/10 rounded-lg px-2 py-1">
                  <Text className="text-sm font-semibold text-primary">
                    {item.rating}
                  </Text>
                </View>
              </View>
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={
          <View className="items-center py-10">
            <Text className="text-gray-400">No vendors found.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
