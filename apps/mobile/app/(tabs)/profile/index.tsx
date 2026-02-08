import { View, Text, SafeAreaView, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-wedding-cream">
      <ScrollView className="flex-1 px-5 pt-6">
        <Text className="text-2xl font-serif font-bold text-wedding-navy mb-6">
          Profile & Settings
        </Text>

        {/* User Info */}
        <Card className="mb-4">
          <View className="items-center py-4">
            <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-3">
              <Text className="text-3xl font-bold text-primary">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <Text className="text-lg font-semibold text-wedding-navy">
              {user?.name || 'User'}
            </Text>
            <Text className="text-sm text-gray-500 mt-0.5">
              {user?.email || 'No email'}
            </Text>
          </View>
        </Card>

        {/* Settings Sections */}
        <Card className="mb-4">
          <Text className="text-base font-semibold text-wedding-navy mb-3">
            Account Settings
          </Text>
          <View className="border-b border-gray-100 py-3">
            <Text className="text-sm text-wedding-navy">Edit Profile</Text>
          </View>
          <View className="border-b border-gray-100 py-3">
            <Text className="text-sm text-wedding-navy">Change Password</Text>
          </View>
          <View className="py-3">
            <Text className="text-sm text-wedding-navy">Notification Preferences</Text>
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="text-base font-semibold text-wedding-navy mb-3">
            Wedding Settings
          </Text>
          <View className="border-b border-gray-100 py-3">
            <Text className="text-sm text-wedding-navy">Wedding Date</Text>
          </View>
          <View className="border-b border-gray-100 py-3">
            <Text className="text-sm text-wedding-navy">Guest List</Text>
          </View>
          <View className="py-3">
            <Text className="text-sm text-wedding-navy">Privacy Settings</Text>
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="text-base font-semibold text-wedding-navy mb-3">
            Support
          </Text>
          <View className="border-b border-gray-100 py-3">
            <Text className="text-sm text-wedding-navy">Help Center</Text>
          </View>
          <View className="border-b border-gray-100 py-3">
            <Text className="text-sm text-wedding-navy">Contact Support</Text>
          </View>
          <View className="py-3">
            <Text className="text-sm text-wedding-navy">About</Text>
          </View>
        </Card>

        <Button
          variant="destructive"
          onPress={handleLogout}
          className="mb-8"
        >
          Logout
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
