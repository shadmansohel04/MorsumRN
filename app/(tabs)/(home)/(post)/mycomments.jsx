import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DUMMY_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80";

const MOCK_REACTIONS_DATA = [
  {
    id: '1',
    label: "Chef's Kiss",
    icon: "chef-hat",
    color: "#FF8762",
    count: 12,
    users: [DUMMY_AVATAR, DUMMY_AVATAR, DUMMY_AVATAR],
  },
  {
    id: '3',
    label: "Hidden Gem",
    icon: "diamond-outline",
    color: "#62d27c",
    count: 6,
    users: [DUMMY_AVATAR, DUMMY_AVATAR],
  },
  {
    id: '4',
    label: "Spicy Hot",
    icon: "fire",
    color: "#FF4433",
    count: 45,
    users: [DUMMY_AVATAR, DUMMY_AVATAR, DUMMY_AVATAR],
  },
  {
    id: '5',
    label: "Mid / Meh",
    icon: "moped",
    color: "#999999",
    count: 14,
    users: [DUMMY_AVATAR, DUMMY_AVATAR],
  },
  {
    id: '6',
    label: "Yikes...",
    icon: "emoticon-dead-outline",
    color: "#777777",
    count: 9,
    users: [DUMMY_AVATAR],
  },
  {
    id: '7',
    label: "Overrated",
    icon: "thumb-down-outline",
    color: "#555555",
    count: 11,
    users: [DUMMY_AVATAR, DUMMY_AVATAR],
  },
];

export default function ReactionsGrid({ data = MOCK_REACTIONS_DATA }){
  return (
    <View style={styles.reactionsSection}>
      <Text style={styles.sectionHeader}>REACTIONS</Text>
      
      <View style={styles.reactionsGrid}>
        {data.map((item) => {
          const extraCount = item.count - item.users.length;
          
          return (
            <View key={item.id} style={styles.reactionCard}>
              
              <View style={styles.cardHeader}>
                <View style={styles.labelWrapper}>
                  <MaterialCommunityIcons name={item.icon} size={16} color={item.color} />
                  <Text style={styles.reactionLabel} numberOfLines={1}>
                    {item.label}
                  </Text>
                </View>
                <Text style={styles.reactionCount}>{item.count}</Text>
              </View>

              <View style={styles.avatarsRow}>
                {item.users.map((url, index) => (
                  <Image 
                    key={index}
                    source={{ uri: url }} 
                    style={[
                      styles.miniAvatar, 
                      index > 0 && { marginLeft: -10 }
                    ]} 
                  />
                ))}
                
                {extraCount > 0 && (
                  <View style={[styles.extraBubble, { marginLeft: -10 }]}>
                    <Text style={styles.extraText}>+{extraCount}</Text>
                  </View>
                )}
              </View>

            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  reactionsSection: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    marginTop: 10,
  },
  sectionHeader: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2.6,
    marginBottom: 16,
  },
  reactionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  reactionCard: {
    width: "48%",
    backgroundColor: "#141612",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  labelWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 6,
  },
  reactionLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 1, 
  },
  reactionCount: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
  avatarsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  miniAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#141612",
  },
  extraBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#22251F",
    borderWidth: 2,
    borderColor: "#141612",
    alignItems: "center",
    justifyContent: "center",
  },
  extraText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 10,
    fontWeight: "800",
  }
});