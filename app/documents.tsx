import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../utils/api";

const DOC_TYPES = [
  { key: "government_id",    label: "Government ID",       icon: "card-outline" },
  { key: "proof_of_address", label: "Proof of Address",    icon: "home-outline" },
  { key: "proof_of_income",  label: "Proof of Income",     icon: "cash-outline" },
  { key: "house_photo",      label: "House Photo",         icon: "camera-outline" },
  { key: "other",            label: "Other Document",      icon: "document-outline" },
];

const statusMeta: Record<string, { color: string; bg: string; icon: string }> = {
  pending:  { color: "#E8A020", bg: "#FEF3E2", icon: "time-outline" },
  verified: { color: "#1E6B45", bg: "#EAF4EE", icon: "checkmark-circle-outline" },
  rejected: { color: "#EF4444", bg: "#FEE2E2", icon: "close-circle-outline" },
};

export default function Documents() {
  const router = useRouter();
  const [documents, setDocuments]     = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [uploading, setUploading]     = useState<string | null>(null); // tracks which docType is uploading

  /* ── Fetch documents ─────────────────────────────────── */
  const fetchDocuments = async () => {
    try {
      const res = await api.get("/documents/my");
      setDocuments(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchDocuments(); }, []));

  /* ── Upload helper ───────────────────────────────────── */
  const uploadFile = async (docType: string, uri: string, name: string, mimeType: string) => {
    setUploading(docType);
    try {
      const formData = new FormData();
      formData.append("file", { uri, name, type: mimeType } as any);
      formData.append("type", docType);
      formData.append("label", DOC_TYPES.find(d => d.key === docType)?.label || docType);

      await api.post("/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Uploaded!", "Your document has been submitted for review.");
      fetchDocuments();
    } catch (err: any) {
      Alert.alert("Upload Failed", err.response?.data?.message || "Could not upload document.");
    } finally {
      setUploading(null);
    }
  };

  /* ── Pick image or file ──────────────────────────────── */
  const handleUpload = (docType: string) => {
    const isPhoto = docType === "house_photo";

    if (isPhoto) {
      // For house photos — offer camera or library
      if (Platform.OS === "ios") {
        ActionSheetIOS.showActionSheetWithOptions(
          { options: ["Cancel", "Take Photo", "Choose from Library"], cancelButtonIndex: 0 },
          async (idx) => {
            if (idx === 1) await pickFromCamera(docType);
            if (idx === 2) await pickFromLibrary(docType);
          }
        );
      } else {
        Alert.alert("Upload Photo", "Choose source", [
          { text: "Camera",  onPress: () => pickFromCamera(docType) },
          { text: "Library", onPress: () => pickFromLibrary(docType) },
          { text: "Cancel",  style: "cancel" },
        ]);
      }
    } else {
      // For IDs and docs — offer file picker or camera
      Alert.alert("Upload Document", "Choose method", [
        { text: "File (PDF/Image)", onPress: () => pickDocument(docType) },
        { text: "Take Photo",       onPress: () => pickFromCamera(docType) },
        { text: "Cancel",           style: "cancel" },
      ]);
    }
  };

  const pickFromCamera = async (docType: string) => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert("Permission needed", "Camera access is required."); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      await uploadFile(docType, asset.uri, `${docType}_${Date.now()}.jpg`, "image/jpeg");
    }
  };

  const pickFromLibrary = async (docType: string) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert("Permission needed", "Photo library access is required."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsEditing: true });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      await uploadFile(docType, asset.uri, `${docType}_${Date.now()}.jpg`, "image/jpeg");
    }
  };

  const pickDocument = async (docType: string) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      await uploadFile(docType, asset.uri, asset.name, asset.mimeType || "application/octet-stream");
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Document", "Remove this document?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/documents/${id}`);
            setDocuments(prev => prev.filter(d => d._id !== id));
          } catch (err: any) {
            Alert.alert("Error", err.response?.data?.message || "Could not delete.");
          }
        },
      },
    ]);
  };

  if (loading) return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] items-center justify-center">
      <ActivityIndicator size="large" color="#1E6B45" />
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center px-6 mt-4 mb-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white border border-[#DCE8E1] dark:bg-gray-800">
          <Ionicons name="arrow-back" size={20} color="#1E6B45" />
        </TouchableOpacity>
        <View className="ml-4">
          <Text className="text-2xl font-extrabold text-[#111827] dark:text-white">My Documents</Text>
          <Text className="text-xs font-bold text-[#6B7280]">{documents.length} uploaded</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchDocuments(); }}
            colors={["#1E6B45"]}
          />
        }
      >
        {/* Info banner */}
        <View className="mb-5 rounded-3xl bg-[#EAF4EE] p-4">
          <Text className="font-extrabold text-[#1E6B45]">Required for adoption</Text>
          <Text className="mt-1 text-sm text-[#6B7280]">
            Upload a government ID, proof of address, and house photos. Staff will verify each document.
          </Text>
        </View>

        {/* Upload slots per doc type */}
        {DOC_TYPES.map(({ key, label, icon }) => {
          const uploaded = documents.filter(d => d.type === key);
          const latest   = uploaded[0];
          const meta     = latest ? statusMeta[latest.status] : null;
          const isUploading = uploading === key;

          return (
            <View
              key={key}
              className="mb-3 rounded-3xl border border-[#DCE8E1] bg-white p-4 dark:bg-gray-800 dark:border-gray-700">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1 mr-3">
                  <View className="h-11 w-11 items-center justify-center rounded-full bg-[#EAF4EE]">
                    <Ionicons name={icon as any} size={22} color="#1E6B45" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="font-extrabold text-[#111827] dark:text-white">{label}</Text>
                    {latest ? (
                      <View className="flex-row items-center gap-1 mt-0.5">
                        <Ionicons name={meta!.icon as any} size={12} color={meta!.color} />
                        <Text className="text-xs font-bold capitalize" style={{ color: meta!.color }}>
                          {latest.status}
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-xs text-[#B0A898] mt-0.5">Not uploaded</Text>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  className="rounded-xl bg-[#1E6B45] px-4 py-2"
                  onPress={() => handleUpload(key)}
                  disabled={isUploading}>
                  {isUploading
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text className="font-bold text-white text-xs">
                        {latest?.status === "rejected" ? "Replace" : latest ? "Update" : "Upload"}
                      </Text>}
                </TouchableOpacity>
              </View>

              {/* Rejection reason */}
              {latest?.status === "rejected" && latest.rejectedReason ? (
                <View className="mt-3 rounded-xl bg-red-50 p-3">
                  <Text className="text-xs font-bold text-red-500">
                    Rejected: {latest.rejectedReason}
                  </Text>
                </View>
              ) : null}

              {/* Previous uploads for this type */}
              {uploaded.length > 0 && (
                <View className="mt-3 gap-2">
                  {uploaded.map(d => (
                    <View key={d._id} className="flex-row items-center justify-between rounded-xl bg-[#F4F2EE] px-3 py-2 dark:bg-gray-700">
                      <Text className="text-xs text-[#6B7280] flex-1" numberOfLines={1}>
                        {d.label} · {new Date(d.createdAt).toLocaleDateString()}
                      </Text>
                      {d.status === "pending" && (
                        <TouchableOpacity onPress={() => handleDelete(d._id)} className="ml-2">
                          <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
