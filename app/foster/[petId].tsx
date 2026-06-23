/**
 * This screen is intentionally retired.
 * Fostering now flows through the unified application form at /pets/apply/[id]?type=foster
 * This file just redirects so any old deep-links still work without crashing.
 */
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";

export default function FosterRedirect() {
  const router = useRouter();
  const { petId } = useLocalSearchParams();

  useEffect(() => {
    // Redirect immediately to the proper unified form
    router.replace(`/pets/apply/${petId}?type=foster` as any);
  }, [petId]);

  return null;
}
