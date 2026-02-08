import { useState } from 'react';
import { View, Text, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const ROLES = [
  { value: 'couple', label: 'Couple' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'planner', label: 'Planner' },
] as const;

type RoleValue = (typeof ROLES)[number]['value'];

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleValue>('couple');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register({ name, email, password, user_type: selectedRole });
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-wedding-cream">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          className="px-6"
        >
          <View className="mb-8 items-center">
            <Text className="text-3xl font-serif text-wedding-navy font-bold">
              Create Account
            </Text>
            <Text className="text-base text-gray-500 mt-2">
              Join Event Empower today
            </Text>
          </View>

          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <Text className="text-red-600 text-sm text-center">{error}</Text>
            </View>
          ) : null}

          <Input
            label="Full Name"
            placeholder="Jane Doe"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
          />

          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
          />

          <View className="mb-4">
            <Text className="text-sm font-medium text-wedding-navy mb-1.5">
              I am a...
            </Text>
            <View className="flex-row gap-2">
              {ROLES.map((role) => (
                <Pressable
                  key={role.value}
                  onPress={() => setSelectedRole(role.value)}
                  className={`flex-1 py-3 rounded-xl items-center border ${
                    selectedRole === role.value
                      ? 'bg-primary border-primary'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      selectedRole === role.value ? 'text-white' : 'text-wedding-navy'
                    }`}
                  >
                    {role.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Button onPress={handleRegister} loading={loading} className="mt-2">
            Register
          </Button>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500">Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <Text className="text-primary font-semibold">Login</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
