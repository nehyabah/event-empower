import { useState } from 'react';
import { View, Text, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
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
          <View className="mb-10 items-center">
            <Text className="text-3xl font-serif text-wedding-navy font-bold">
              Event Empower
            </Text>
            <Text className="text-base text-gray-500 mt-2">
              Sign in to your account
            </Text>
          </View>

          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <Text className="text-red-600 text-sm text-center">{error}</Text>
            </View>
          ) : null}

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
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          <Button onPress={handleLogin} loading={loading} className="mt-2">
            Login
          </Button>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500">Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <Text className="text-primary font-semibold">Register</Text>
            </Link>
          </View>

          <View className="flex-row justify-center mt-3">
            <Link href="/(auth)/phone-login" asChild>
              <Text className="text-primary font-semibold">Login with Phone</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
