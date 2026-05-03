import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '@/utils/api';

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'fair' | 'strong' | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No reset token found. Please check your email link.');
    }
  }, [token]);

  const calculatePasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength(null);
      return;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar, isLongEnough].filter(Boolean).length;

    if (strength <= 2) setPasswordStrength('weak');
    else if (strength <= 3) setPasswordStrength('fair');
    else setPasswordStrength('strong');
  };

  const handlePasswordChange = (text: string) => {
    setNewPassword(text);
    calculatePasswordStrength(text);
  };

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setStatus('error');
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setStatus('error');
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!strongPasswordRegex.test(newPassword)) {
      setStatus('error');
      setErrorMessage('Password must contain uppercase, lowercase, numbers, and symbols.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword,
        confirmPassword,
      });
      setStatus('success');

      setTimeout(() => {
        router.replace('/(auth)/logIn');
      }, 2000);
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(
        error.response?.data?.message ||
        'Password reset failed. Please try again.'
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
                Set New Password
              </Text>
              <Text className="text-slate-500 text-base">
                Create a strong password for your account
              </Text>
            </View>

            {status === 'success' ? (
              <View className="space-y-4">
                <View className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 items-center gap-3">
                  <Text className="text-3xl">✓</Text>
                  <Text className="text-emerald-900 font-bold text-center">
                    Password Updated
                  </Text>
                  <Text className="text-emerald-800 text-sm text-center">
                    Your password has been changed successfully. You can now login with your new password.
                  </Text>
                </View>

                <Pressable
                  onPress={() => router.replace('/(auth)/logIn')}
                  className="bg-emerald-600 rounded-lg py-3 items-center mt-4"
                >
                  <Text className="text-white font-bold text-base">
                    Sign in with new password
                  </Text>
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

                {/* New Password Input */}
                <View>
                  <Text className="text-slate-700 font-bold mb-2">New Password</Text>
                  <TextInput
                    value={newPassword}
                    onChangeText={handlePasswordChange}
                    placeholder="••••••••"
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                    className="border border-slate-200 rounded-lg px-4 py-3 bg-slate-50 text-slate-900"
                  />

                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <View className="mt-2">
                      <View className="flex-row gap-1 mb-1">
                        <View
                          className={`flex-1 h-2 rounded-full ${
                            passwordStrength === 'weak' || passwordStrength === 'fair' || passwordStrength === 'strong'
                              ? 'bg-rose-500'
                              : 'bg-slate-200'
                          }`}
                        />
                        <View
                          className={`flex-1 h-2 rounded-full ${
                            passwordStrength === 'fair' || passwordStrength === 'strong'
                              ? 'bg-amber-500'
                              : 'bg-slate-200'
                          }`}
                        />
                        <View
                          className={`flex-1 h-2 rounded-full ${
                            passwordStrength === 'strong' ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}
                        />
                      </View>
                      <Text
                        className={`text-xs font-medium ${
                          passwordStrength === 'strong'
                            ? 'text-emerald-600'
                            : passwordStrength === 'fair'
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {passwordStrength === 'strong'
                          ? 'Strong password'
                          : passwordStrength === 'fair'
                          ? 'Fair password'
                          : 'Weak password'}
                      </Text>
                    </View>
                  )}

                  <Text className="text-xs text-slate-500 mt-2">
                    Must contain uppercase, lowercase, numbers, and symbols (8+ chars)
                  </Text>
                </View>

                {/* Confirm Password Input */}
                <View>
                  <Text className="text-slate-700 font-bold mb-2">Confirm Password</Text>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="••••••••"
                    secureTextEntry={!showConfirmPassword}
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
                    {isLoading ? 'Resetting...' : 'Reset Password'}
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
