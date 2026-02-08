import { useState } from 'react';
import { View, Text, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function PhoneLoginScreen() {
  const { sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone) {
      setError('Please enter your phone number.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendPhoneOtp(phone, 'sms');
      setStep('otp');
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('Please enter the verification code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await verifyPhoneOtp(phone, otp);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err?.message || 'Invalid code. Please try again.');
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
              Phone Login
            </Text>
            <Text className="text-base text-gray-500 mt-2">
              {step === 'phone'
                ? 'Enter your phone number to receive a code'
                : 'Enter the verification code sent to your phone'}
            </Text>
          </View>

          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <Text className="text-red-600 text-sm text-center">{error}</Text>
            </View>
          ) : null}

          {step === 'phone' ? (
            <>
              <Input
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
              />

              <Button onPress={handleSendOtp} loading={loading} className="mt-2">
                Send Verification Code
              </Button>
            </>
          ) : (
            <>
              <View className="bg-white/60 rounded-xl p-3 mb-4">
                <Text className="text-sm text-gray-500 text-center">
                  Code sent to {phone}
                </Text>
              </View>

              <Input
                label="Verification Code"
                placeholder="123456"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
              />

              <Button onPress={handleVerifyOtp} loading={loading} className="mt-2">
                Verify & Login
              </Button>

              <Button
                variant="ghost"
                onPress={() => {
                  setStep('phone');
                  setOtp('');
                  setError('');
                }}
                className="mt-3"
              >
                Change Phone Number
              </Button>
            </>
          )}

          <View className="flex-row justify-center mt-6">
            <Link href="/(auth)/login" asChild>
              <Text className="text-primary font-semibold">Login with Email</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
