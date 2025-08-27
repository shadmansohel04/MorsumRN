import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Keyboard,
  SafeAreaView,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function Steps() {
  const [step, setStep] = useState("");
  const [steps, setSteps] = useState([]);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;
  const styles = createStyles(colors, colorScheme);
  const scrollRef = useRef(null);

  const placeholderColor =
    colorScheme === "dark" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.45)";

  const canAdd = step.trim().length > 0;

  const addStep = () => {
    if (!canAdd) return;

    const newItem = step.trim();
    setSteps((prev) => {
      const next = [...prev, newItem];
      return next;
    });

    setStep("");

    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  const deleteStep = (index) => {
    setSteps((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next;
    });
  };

  const clearAll = () => {
    AsyncStorage.removeItem("ingredients").catch(() => {});
    setSteps([]);
  };

  const submitSteps = async () => {
    if (steps.length === 0) {
      alert("Your entering a recipe with no steps");
    }
    try {
      await AsyncStorage.setItem("steps", JSON.stringify(steps));
      router.push("./confirm");
    } catch (error) {
      console.log(error);
    }
  };

  const keyboardOffset = Platform.select({ ios: 80, android: 0 });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={keyboardOffset}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => router.replace("./ingredients")}
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={28} color={colors.textColor} />
            </TouchableOpacity>

            <Text style={styles.heading}>Add Steps</Text>

            <View style={{ width: 44 }} />
          </View>

          <View style={styles.card}>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Step</Text>
              <TextInput
                style={[styles.input, { minHeight: 44 }]}
                placeholder="e.g., Chop the tomatoes"
                placeholderTextColor={placeholderColor}
                value={step}
                onChangeText={setStep}
                multiline={true}
              />
            </View>

            <TouchableOpacity
              style={[styles.addButton, !canAdd && styles.addButtonDisabled]}
              onPress={addStep}
              disabled={!canAdd}
            >
              <Ionicons name="add-circle" size={22} color={colors.background} />
              <Text style={styles.addButtonText}>Add step</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={Keyboard.dismiss}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            {steps.map((s, index) => (
              <View key={`${s}-${index}`} style={styles.item}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {index + 1}. {s}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => deleteStep(index)}
                  style={styles.deleteButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={22} color="#FF5A5F" />
                </TouchableOpacity>
              </View>
            ))}

            {steps.length > 0 && (
              <TouchableOpacity onPress={clearAll} style={styles.clearAll}>
                <Ionicons name="close-circle" size={18} color={colors.textColor} />
                <Text style={styles.clearAllText}>Clear all</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.fab} onPress={submitSteps} activeOpacity={0.9}>
            <Ionicons name="arrow-forward" size={26} color={colors.background} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors, scheme) {
  const isDark = scheme === "dark";
  const card = isDark ? "rgba(255,255,255,0.06)" : colors.background;
  const border = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";
  const subtle = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  return StyleSheet.create({
    safe: { flex: 1 },
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 8,
      backgroundColor: colors.background,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 8,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    heading: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.textColor,
      letterSpacing: 0.2,
    },

    card: {
      backgroundColor: card,
      borderRadius: 16,
      padding: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 2,
      marginBottom: 14,
    },

    row: { flexDirection: "row", gap: 10 },
    flex1: { flex: 1 },
    flex2: { flex: 2 },

    fieldWrap: {
      borderWidth: 1,
      borderColor: border,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 8,
      backgroundColor: subtle,
    },
    label: {
      fontSize: 12,
      color: isDark ? "#BFC7CF" : "#475569",
      marginBottom: 4,
      fontWeight: "600",
      letterSpacing: 0.4,
    },

    input: {
      color: colors.textColor,
      fontSize: 16,
      paddingVertical: Platform.OS === "ios" ? 10 : 6,
      paddingHorizontal: 4,
    },

    dropdown: {
      height: 40,
      justifyContent: "center",
    },
    dropdownContainer: {
      backgroundColor: card,
      borderRadius: 12,
      borderColor: border,
    },

    addButton: {
      marginTop: 10,
      height: 48,
      borderRadius: 12,
      backgroundColor: colors.pop,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    addButtonDisabled: {
      opacity: 0.6,
    },
    addButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: "700",
    },

    list: { flex: 1 },

    item: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
      padding: 12,
      borderRadius: 16,
      marginBottom: 10,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 1,
    },
    itemName: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.textColor,
      marginBottom: 6,
    },

    badgeRow: { flexDirection: "row", gap: 8 },
    badge: {
      backgroundColor: colors.pop,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    badgeText: { color: colors.background, fontWeight: "700" },
    badgeOutline: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: border,
      backgroundColor: subtle,
    },
    badgeOutlineText: { color: colors.textColor, fontWeight: "600" },

    deleteButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    },

    clearAll: {
      alignSelf: "center",
      flexDirection: "row",
      gap: 6,
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: border,
      backgroundColor: subtle,
      marginTop: 6,
      marginBottom: 4,
    },
    clearAllText: {
      color: colors.textColor,
      fontWeight: "600",
    },

    fab: {
      position: "absolute",
      right: 16,
      bottom: 24,
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: colors.pop,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
  });
}
