import { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RsvpScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const [guestName, setGuestName] = useState('');
  const [attending, setAttending] = useState<'yes' | 'no' | null>(null);
  const [dietaryNotes, setDietaryNotes] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-wedding-cream">
      <ScrollView className="flex-1 px-5 pt-6">
        {/* RSVP Header */}
        <View className="items-center py-8">
          <Text className="text-3xl font-serif font-bold text-wedding-navy">
            RSVP
          </Text>
          <View className="w-12 h-0.5 bg-primary my-4" />
          <Text className="text-sm text-gray-500">
            Invitation code: {code}
          </Text>
        </View>

        {/* RSVP Form */}
        <Card className="mb-4">
          <Text className="text-base font-semibold text-wedding-navy mb-4">
            Confirm Your Attendance
          </Text>

          <Input
            label="Your Name"
            placeholder="Enter your full name"
            value={guestName}
            onChangeText={setGuestName}
            autoCapitalize="words"
          />

          <Text className="text-sm font-medium text-wedding-navy mb-2">
            Will you attend?
          </Text>
          <View className="flex-row gap-3 mb-4">
            <Button
              variant={attending === 'yes' ? 'primary' : 'outline'}
              onPress={() => setAttending('yes')}
              className="flex-1"
              size="sm"
            >
              Joyfully Accept
            </Button>
            <Button
              variant={attending === 'no' ? 'primary' : 'outline'}
              onPress={() => setAttending('no')}
              className="flex-1"
              size="sm"
            >
              Regretfully Decline
            </Button>
          </View>

          <Input
            label="Dietary Requirements"
            placeholder="Any allergies or preferences?"
            value={dietaryNotes}
            onChangeText={setDietaryNotes}
            multiline
            numberOfLines={3}
          />

          <Button className="mt-2">
            Submit RSVP
          </Button>
        </Card>

        {/* Event Details Placeholder */}
        <Card className="mb-8">
          <Text className="text-base font-semibold text-wedding-navy mb-3">
            Event Details
          </Text>
          <View className="border-b border-gray-100 py-3">
            <Text className="text-xs text-gray-400 uppercase tracking-wide">Date</Text>
            <Text className="text-sm text-wedding-navy mt-0.5">To be confirmed</Text>
          </View>
          <View className="border-b border-gray-100 py-3">
            <Text className="text-xs text-gray-400 uppercase tracking-wide">Venue</Text>
            <Text className="text-sm text-wedding-navy mt-0.5">To be confirmed</Text>
          </View>
          <View className="py-3">
            <Text className="text-xs text-gray-400 uppercase tracking-wide">Dress Code</Text>
            <Text className="text-sm text-wedding-navy mt-0.5">To be confirmed</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
