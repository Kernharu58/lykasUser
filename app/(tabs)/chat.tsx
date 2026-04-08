import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, useRef } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { io } from "socket.io-client";
import api from "../../utils/api";

// Import your custom components
import ChatMessage from "../../components/ChatMessage";
import TypingIndicator from "../../components/TypingIndicator";

const socket = io("https://risky-allie-farcically.ngrok-free.dev");
// Quick Replies Data
const QUICK_REPLIES = [
  { label: "📅 Schedule a visit", text: "I'd like to schedule a visit." },
  { label: "💰 Adoption fees?", text: "What are the adoption fees?" },
  { label: "🐶 See all dogs", text: "Can I see all available dogs?" },
];
// TypeScript interface for messages (optional, but recommended)
export default function ChatScreen() {

  // State variables
  const [messages, setMessages] = useState<any[]>([]);
  // 👇 FIX: Added state for input text and typing indicator!
  const [inputText, setInputText] = useState("");
  // 👇 FIX: Added state and refs for keyboard handling and auto-scrolling!
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Listen for Keyboard Open/Close
  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const hide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false)
    );
    return () => { show.remove(); hide.remove(); };
  }, []);

  // Fetch History & Socket Listener
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/messages");
        setMessages(response.data);
      } catch (error) {
        console.error("Could not fetch messages:", error);
      }
    };
    fetchHistory();

    socket.on("receiveMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => { socket.off("receiveMessage"); };
  }, []);

  // Send Message Logic
  const sendMessage = (overrideText?: string) => {
    const text = (overrideText ?? inputText).trim();
    if (!text) return;

    const messageData = {
      text,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    socket.emit("sendMessage", messageData);
    
    setInputText("");

    // Simulate shelter typing then responding
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000);
  };

  const hasText = inputText.trim().length > 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900" edges={["top"]}>
      {/* --- Header --- */}
      <View className="bg-emerald-900 dark:bg-emerald-950 px-5 pt-3 pb-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="relative mr-3">
              <View className="w-11 h-11 rounded-full bg-emerald-700 items-center justify-center border-2 border-emerald-500/40">
                <Text style={{ fontSize: 20 }}>🐾</Text>
              </View>
              <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-emerald-900 rounded-full" />
            </View>
            <View>
              <Text className="text-white font-semibold text-base tracking-tight">Happy Paws Shelter</Text>
              <View className="flex-row items-center gap-1 mt-0.5">
                <View className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <Text className="text-emerald-300 text-xs font-medium">Online · replies in ~10 mins</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {/* --- Messages List --- */}
        <FlatList
          ref={flatListRef}
          className="flex-1 bg-gray-100 dark:bg-gray-900"
          data={messages}
          keyExtractor={(item, index) => item._id || index.toString()}
          renderItem={({ item }) => <ChatMessage item={item} />} 
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null} 
        />

        {/* 👇 FIX: Grouped the Quick Replies and Input Box into a single solid footer container! */}
        <View 
          className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
          style={{ paddingBottom: isKeyboardVisible ? 380 : 130 }}
        >
          
          {/* --- Quick Replies --- */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="max-h-14 bg-gray-100 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800"
            contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center' }}
          >
            {QUICK_REPLIES.map((qr, index) => (
              <TouchableOpacity
                key={qr.text}
                onPress={() => sendMessage(qr.text)}
                className={`bg-white dark:bg-gray-800 border border-emerald-600/50 rounded-full px-4 py-2 self-center ${
                  index !== QUICK_REPLIES.length - 1 ? 'mr-2' : ''
                }`}
              >
                <Text className="text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  {qr.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* --- Input Area --- */}
          <View className="flex-row items-end px-3 pt-2 pb-1">
            <TouchableOpacity className="mb-1 mr-2 p-1">
              <Ionicons name="add-circle" size={26} color="#059669" />
            </TouchableOpacity>
            
            <TextInput
              ref={inputRef}
              // 👇 FIX: Changed color back to text-darkBlue so your typing is visible!
              className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2.5 text-darkBlue dark:text-white mr-2 text-base"
              placeholder="Message..."
              placeholderTextColor="#9ca3af"
              value={inputText}
              onChangeText={setInputText}
              multiline
              style={{ maxHeight: 100 }}
            />
            
            <TouchableOpacity
              className={`w-10 h-10 rounded-full items-center justify-center mb-0.5 ${
                hasText ? "bg-emerald-700" : "bg-gray-200 dark:bg-gray-700"
              }`}
              onPress={() => sendMessage()}
              disabled={!hasText}
              activeOpacity={0.75}
            >
              <Ionicons name="send" size={17} color={hasText ? "#ffffff" : "#9ca3af"} style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}