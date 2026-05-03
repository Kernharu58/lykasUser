import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '@/utils/api';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await api.post('/auth/forgot-password', { email });
      setStatus('success');
      setEmail('');
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(
        error.response?.data?.message ||
        'An error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-4 py-8">
            {/* Header */}
            <View className="mb-8">
              <Text className="text-3xl font-bold text-slate-900 mb-2">
                Forgot Password?
              </Text>
              <Text className="text-slate-500 text-base">
                Enter your email address and we'll send you a link to reset your password.
              </Text>
            </View>

            {status === 'success' ? (
              <View className="space-y-4">
                <View className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <Text className="text-emerald-900 font-bold mb-1">
                    Check your email
                  </Text>
                  <Text className="text-emerald-800 text-sm">
                    If an account exists with this email, you'll receive a password reset link shortly. The link will expire in 1 hour.
                  </Text>
                </View>

                <Pressable
                  onPress={() => router.replace('/(auth)/logIn')}
                  className="bg-emerald-600 rounded-lg py-3 items-center mt-6"
                >
                  <Text className="text-white font-bold text-base">Return to Login</Text>
                </Pressable>
              </View>
            ) : (
              <View className="space-y-5">
                {status === 'error' && (
                  <View className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                    <Text className="text-rose-800 text-sm font-medium">
                      {errorMessage}
                    </Text>
                  </View>
                )}

                {/* Email Input */}
                <View>
                  <Text className="text-slate-700 font-bold mb-2">Email Address</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="name@shelter.org"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                    className="border border-slate-200 rounded-lg px-4 py-3 bg-slate-50 text-slate-900"
                  />
                </View>

                {/* Submit Button */}
                <Pressable
                  onPress={handleSubmit}
                  disabled={isLoading}
                  className={`${
                    isLoading ? 'opacity-50' : ''
                  } bg-emerald-600 rounded-lg py-3 items-center justify-center flex-row gap-2`}
                >
                  {isLoading && <ActivityIndicator color="white" />}
                  <Text className="text-white font-bold text-base">
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Text>
                </Pressable>

                {/* Back Link */}
                <Pressable
                  onPress={() => router.replace('/(auth)/logIn')}
                  className="mt-2"
                >
                  <Text className="text-center text-emerald-600 font-bold">
                    Back to Login
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
