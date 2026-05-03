import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, Pressable, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

export default function VerifyEmailScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { userToken } = useAuth();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token found. Please check your email link.');
        return;
      }

      try {
        await api.post('/auth/verify-email', { token });
        setStatus('success');
        setMessage('Email verified successfully!');

        // Redirect after 2 seconds
        setTimeout(() => {
          if (userToken) {
            router.replace('/(tabs)');
          } else {
            router.replace('/(auth)/logIn');
          }
        }, 2000);
      } catch (error: any) {
        setStatus('error');
        setMessage(
          error.response?.data?.message ||
          'Email verification failed. Token may have expired.'
        );
      }
    };

    verifyEmail();
  }, [token, userToken, router]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-4">
        {status === 'loading' && (
          <View className="items-center gap-4">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="text-slate-600 font-medium text-center">
              Verifying your email address...
            </Text>
          </View>
        )}

        {status === 'success' && (
          <View className="items-center gap-4">
            <View className="w-16 h-16 rounded-full bg-emerald-100 justify-center items-center">
              <Text className="text-3xl">✓</Text>
            </View>
            <Text className="text-xl font-bold text-slate-900 text-center">
              Email Verified!
            </Text>
            <Text className="text-slate-600 text-center">{message}</Text>
            <Text className="text-sm text-slate-500">Redirecting...</Text>
          </View>
        )}

        {status === 'error' && (
          <View className="items-center gap-4 w-full">
            <View className="w-16 h-16 rounded-full bg-rose-100 justify-center items-center">
              <Text className="text-3xl">!</Text>
            </View>
            <Text className="text-xl font-bold text-slate-900 text-center">
              Verification Failed
            </Text>
            <Text className="text-slate-600 text-center">{message}</Text>

            <View className="flex-row gap-3 w-full mt-6">
              <Pressable
                onPress={() => router.replace('/(auth)/logIn')}
                className="flex-1 bg-emerald-600 rounded-lg py-3 items-center"
              >
                <Text className="text-white font-bold">Back to Login</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
