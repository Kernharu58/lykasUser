import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { io, Socket } from "socket.io-client";
import ChatMessage from "../../components/ChatMessage";
import { EmptyState, ErrorState, LoadingState } from "../../components/StateView";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import { COLORS } from "../../utils/colors";

const SOCKET_URL = api.defaults.baseURL?.replace(/\/api\/?$/, "") || "http://localhost:5000";
const GREEN = COLORS.primary;

const QUICK_REPLIES = [
  { label: "Schedule a visit", text: "I'd like to schedule a visit." },
  { label: "Application status", text: "Can you check my application status?" },
  { label: "Foster report", text: "I need help with my foster monitoring report." },
];

type ChatItem = {
  _id: string;
  text: string;
  sender: "user" | "admin" | "shelter" | string;
  createdAt: string;
  pending?: boolean;
  failed?: boolean;
};

function normalizeMessages(data: any[]): ChatItem[] {
  return (Array.isArray(data) ? data : []).map((item, index) => ({
    _id: item._id || `message-${index}-${item.createdAt || Date.now()}`,
    text: item.text || "",
    sender: item.sender || "shelter",
    createdAt: item.createdAt || new Date().toISOString(),
  }));
}

function mergeIncomingMessage(previous: ChatItem[], incoming: ChatItem) {
  if (incoming._id && previous.some((message) => message._id === incoming._id)) return previous;

  const pendingIndex = previous.findIndex(
    (message) =>
      message.pending &&
      message.sender === incoming.sender &&
      message.text === incoming.text &&
      Math.abs(new Date(incoming.createdAt).getTime() - new Date(message.createdAt).getTime()) < 60000,
  );

  if (pendingIndex >= 0) {
    const next = [...previous];
    next[pendingIndex] = incoming;
    return next;
  }

  return [...previous, incoming];
}

export default function ChatScreen() {
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList<ChatItem>>(null);
  const socketRef = useRef<Socket | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!userId) {
      setHistoryError("Could not verify your account.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setHistoryError(null);
      const response = await api.get(`/messages/${userId}`);
      setMessages(normalizeMessages(response.data));
    } catch (error: any) {
      console.error("[Chat] Failed to load history:", error);
      setHistoryError(error.response?.data?.message || "Could not load your messages.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  const connectSocket = useCallback(async () => {
    if (!userId) return;

    socketRef.current?.disconnect();
    setSocketError(null);

    try {
      const token = await SecureStore.getItemAsync("userToken");
      const socket = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        auth: { token },
        reconnectionAttempts: 5,
        timeout: 15000,
      });

      socketRef.current = socket;
      socket.on("connect", () => {
        setIsConnected(true);
        setSocketError(null);
        socket.emit("joinRoom", userId);
      });
      socket.on("disconnect", () => setIsConnected(false));
      socket.on("connect_error", (error) => {
        console.error("[Chat] Socket connection failed:", error.message);
        setIsConnected(false);
        setSocketError("Live chat is reconnecting. You can still review past messages.");
      });
      socket.on("receiveMessage", (newMessage) => {
        setMessages((prev) => mergeIncomingMessage(prev, normalizeMessages([newMessage])[0]));
      });
    } catch (error) {
      console.error("[Chat] Socket setup failed:", error);
      setIsConnected(false);
      setSocketError("Could not start live chat.");
    }
  }, [userId]);

  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", () => setKeyboardVisible(true));
    const hide = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    fetchHistory();
    connectSocket();
    return () => {
      socketRef.current?.disconnect();
    };
  }, [connectSocket, fetchHistory]);

  const retry = () => {
    setLoading(true);
    fetchHistory();
    connectSocket();
  };

  const sendMessage = (overrideText?: string) => {
    const text = (overrideText ?? inputText).trim();
    if (!userId) {
      Alert.alert("Session Error", "Could not verify your account.");
      return;
    }
    if (!text) return;

    const localId = `local-${Date.now()}`;
    const optimistic: ChatItem = {
      _id: localId,
      text,
      sender: "user",
      createdAt: new Date().toISOString(),
      pending: true,
    };

    setMessages((prev) => [...prev, optimistic]);
    setInputText("");

    if (!socketRef.current?.connected) {
      setMessages((prev) => prev.map((message) => (message._id === localId ? { ...message, pending: false, failed: true } : message)));
      setSocketError("Message not sent. Live chat is disconnected.");
      return;
    }

    socketRef.current.emit("sendMessage", { userId, text });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
    connectSocket();
  };

  const hasText = inputText.trim().length > 0;
  const inputDisabled = !userId;

  return (
    <SafeAreaView className="flex-1 bg-bgSoft dark:bg-gray-900" edges={["top"]}>
      <View className="rounded-b-[28px] bg-primary px-5 pb-4 pt-3 shadow-sm">
        <View className="flex-row items-center">
          <View className="relative mr-3 h-12 w-12 items-center justify-center rounded-full bg-mintBg">
            <Ionicons name="paw" size={24} color={GREEN} />
            <View className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-primary ${isConnected ? "bg-green-400" : "bg-amber-400"}`} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-extrabold text-white">CarePaws Shelter</Text>
            <Text className="text-xs font-semibold text-emerald-100">{isConnected ? "Online - replies in about 10 minutes" : "Connecting to live chat..."}</Text>
          </View>
          <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-white/15" onPress={() => Alert.alert("Call Shelter", "Phone call support can be added when the shelter contact number is finalized.")}>
            <Ionicons name="call-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {socketError ? (
        <View className="mx-4 mt-3 flex-row items-center rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <Ionicons name="wifi-outline" size={18} color={COLORS.warning} />
          <Text className="ml-2 flex-1 text-xs font-bold text-amber-700">{socketError}</Text>
          <TouchableOpacity onPress={connectSocket}>
            <Text className="text-xs font-extrabold text-primary">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        {loading ? (
          <View className="px-4">
            <LoadingState message="Loading messages..." />
          </View>
        ) : historyError ? (
          <View className="px-4">
            <ErrorState message={historyError} onAction={retry} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            className="flex-1"
            data={messages}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <ChatMessage item={item} />}
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingTop: 18, paddingBottom: isKeyboardVisible ? 16 : 120 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GREEN} colors={[GREEN]} />}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <EmptyState
                title="Start a conversation"
                message="Ask about visits, application status, fees, foster reports, or pet care."
                icon="chatbubbles-outline"
                actionLabel="Ask About Application"
                onAction={() => sendMessage("Can you check my application status?")}
              />
            }
          />
        )}

        <View className="border-t border-border bg-white px-3 pt-2 dark:border-gray-800 dark:bg-gray-900" style={{ paddingBottom: isKeyboardVisible ? 10 : 94 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8, gap: 8 }}>
            {QUICK_REPLIES.map((qr) => (
              <TouchableOpacity key={qr.text} onPress={() => sendMessage(qr.text)} disabled={inputDisabled} className="rounded-full border border-primary/30 bg-mintBg px-4 py-2 disabled:opacity-50">
                <Text className="text-xs font-extrabold text-primary">{qr.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View className="flex-row items-end pb-16">
            <TouchableOpacity className="mr-2 h-11 w-11 items-center justify-center rounded-full bg-green" onPress={() => Alert.alert("Attachments", "Photo and document attachments can be connected to the chat API next.")}>
              <Ionicons name="add" size={24} color={GREEN} />
            </TouchableOpacity>
            <TextInput
              className="flex-1 rounded-2xl bg-gray100 px-4 py-3 text-base font-medium text-gray-900 dark:bg-gray-800 dark:text-white"
              placeholder={inputDisabled ? "Sign in to message..." : "Message..."}
              placeholderTextColor={COLORS.mutedLight}
              value={inputText}
              onChangeText={setInputText}
              editable={!inputDisabled}
              multiline
              style={{ maxHeight: 100 }}
            />
            <TouchableOpacity className={`ml-2 h-11 w-11 items-center justify-center rounded-full ${hasText ? "bg-primary" : "bg-gray-200"}`} onPress={() => sendMessage()} disabled={!hasText || inputDisabled}>
              <Ionicons name="send" size={18} color={hasText ? "white" : COLORS.mutedLight} style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
