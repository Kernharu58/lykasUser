import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Alert, FlatList, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { io, Socket } from "socket.io-client";
import * as SecureStore from "expo-secure-store";
import ChatMessage from "../../components/ChatMessage";
import TypingIndicator from "../../components/TypingIndicator";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

const SOCKET_URL = api.defaults.baseURL?.replace("/api", "") || "http://localhost:5000";
const GREEN = "#1E6B45";

const QUICK_REPLIES = [
  { label: "Schedule a visit", text: "I'd like to schedule a visit." },
  { label: "Adoption fees?", text: "What are the adoption fees?" },
  { label: "Available pets", text: "Can I see all available pets?" },
];

export default function ChatScreen() {
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", () => setKeyboardVisible(true));
    const hide = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchHistory = async () => {
      try {
        const response = await api.get(`/messages/${userId}`);
        setMessages(response.data || []);
      } catch {
        setMessages([
          { _id: "welcome", text: "Hi! CarePaws staff are here to help with adoption, fostering, visits, and pet health updates.", sender: "admin", createdAt: new Date().toISOString() },
        ]);
      }
    };

    const connectSocket = async () => {
      const token = await SecureStore.getItemAsync("userToken");
      socketRef.current = io(SOCKET_URL, { transports: ["websocket", "polling"], auth: { token } });
      socketRef.current.on("connect", () => socketRef.current?.emit("joinRoom", userId));
      socketRef.current.on("receiveMessage", (newMessage) => {
        setMessages((prev) => newMessage._id && prev.some((m) => m._id === newMessage._id) ? prev : [...prev, newMessage]);
        setIsTyping(false);
      });
    };

    fetchHistory();
    connectSocket();
    return () => { socketRef.current?.disconnect(); };
  }, [userId]);

  const sendMessage = (overrideText?: string) => {
    const text = (overrideText ?? inputText).trim();
    if (!userId) {
      Alert.alert("Session Error", "Could not verify your account.");
      return;
    }
    if (!text) return;

    const optimistic = { _id: `local-${Date.now()}`, text, sender: userId, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, optimistic]);
    setInputText("");
    setIsTyping(true);
    socketRef.current?.emit("sendMessage", { userId, text });
  };

  const hasText = inputText.trim().length > 0;

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] dark:bg-gray-900" edges={["top"]}>
      <View className="bg-[#1E6B45] px-5 pt-3 pb-4 rounded-b-[28px] shadow-sm">
        <View className="flex-row items-center">
          <View className="relative mr-3 h-12 w-12 rounded-full bg-[#EAF4EE] items-center justify-center">
            <Ionicons name="paw" size={24} color={GREEN} />
            <View className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#1E6B45] bg-green-400" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-extrabold text-lg">CarePaws Shelter</Text>
            <Text className="text-emerald-100 text-xs font-semibold">Online - replies in about 10 minutes</Text>
          </View>
          <TouchableOpacity className="h-10 w-10 rounded-full bg-white/15 items-center justify-center">
            <Ionicons name="call-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <FlatList
          ref={flatListRef}
          className="flex-1"
          data={messages}
          keyExtractor={(item, index) => item._id || index.toString()}
          renderItem={({ item }) => <ChatMessage item={item} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: isKeyboardVisible ? 16 : 120 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          ListEmptyComponent={
            <View className="mt-16 items-center rounded-3xl bg-white p-6 border border-[#DCE8E1]">
              <Ionicons name="chatbubbles-outline" size={44} color={GREEN} />
              <Text className="mt-3 text-lg font-extrabold text-gray-900">Start a conversation</Text>
              <Text className="mt-1 text-center text-gray-500">Ask about visits, application status, fees, or pet care.</Text>
            </View>
          }
        />

        <View className="border-t border-[#DCE8E1] bg-white px-3 pt-2" style={{ paddingBottom: isKeyboardVisible ? 10 : 94 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8, gap: 8 }}>
            {QUICK_REPLIES.map((qr) => (
              <TouchableOpacity key={qr.text} onPress={() => sendMessage(qr.text)} className="rounded-full border border-[#1E6B45]/30 bg-[#EAF4EE] px-4 py-2">
                <Text className="text-xs font-extrabold text-[#1E6B45]">{qr.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View className="flex-row items-end pb-2">
            <TouchableOpacity className="mr-2 h-11 w-11 items-center justify-center rounded-full bg-[#EAF4EE]">
              <Ionicons name="add" size={24} color={GREEN} />
            </TouchableOpacity>
            <TextInput
              className="flex-1 rounded-2xl bg-[#F3F4F6] px-4 py-3 text-base text-gray-900 dark:text-white"
              placeholder="Message..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              multiline
              style={{ maxHeight: 100 }}
            />
            <TouchableOpacity className={`ml-2 h-11 w-11 rounded-full items-center justify-center ${hasText ? "bg-[#1E6B45]" : "bg-gray-200"}`} onPress={() => sendMessage()} disabled={!hasText}>
              <Ionicons name="send" size={18} color={hasText ? "white" : "#9CA3AF"} style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

