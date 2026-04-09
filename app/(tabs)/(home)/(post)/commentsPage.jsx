import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

const THEME = {
  bg: "#0d0f0c",
  accent: "#FF8762",
  surface: "#141612",
  bottom: "#1d201c",
  text: "#FFFFFF",
  textSoft: "#E3E7DE",
};

const REACTIONS = [
  { id: '1', label: "Chef's Kiss", icon: 'chef-hat', active: false },
  { id: '3', label: 'Hidden Gem', icon: 'diamond-outline', active: false },
  { id: '4', label: 'Spicy Hot', icon: 'fire', active: false },
  { id: '5', label: 'Mid / Meh', icon: 'moped', active: false },
  { id: '6', label: 'Yikes...', icon: 'emoticon-dead-outline', active: false },
  { id: '7', label: 'Overrated', icon: 'thumb-down-outline', active: false },
];

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 55) / 2; 

export default function ReactionScreen() {
  const [reactions, setReactions] = useState(REACTIONS)
  const router = useRouter()

  const handleClick = (accept) => {

    router.back()
  }

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Pressable onPress={()=>{handleClick(false)}}>
          <MaterialCommunityIcons name="close" size={26} color={THEME.text} />
        </Pressable>
        <Pressable onPress={()=>{handleClick(true)}}>
          <MaterialCommunityIcons name="check" size={26} color={THEME.text} />
        </Pressable>
      </View>

      <View style={styles.targetCard}>
        <Image 
          source="https://images.unsplash.com/photo-1617421753170-46511a8d73fc?auto=format&fit=crop&w=100&q=80" 
          style={styles.avatar} 
        />
        <View>
          <Text style={styles.reactingTo}>REACTING TO</Text>
          <Text style={styles.foodName}>The Umami Bomb Burger</Text>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
      >
        <View style={styles.gridWrapper}>
          {reactions.map((item, index) => (
            <Pressable
              onPress={() => {
                setReactions((prev) => {
                  const newReactions = [...prev];
                  newReactions[index] = { 
                    ...newReactions[index], 
                    active: !newReactions[index].active 
                  };
                  return newReactions;
                });
              }}
              key={item.id}
              style={[
                styles.card, 
                item.active && { backgroundColor: THEME.accent }
              ]}
            >
              {item.badge && <Text style={styles.badge}>{item.badge}</Text>}
              
              <MaterialCommunityIcons 
                name={item.icon} 
                size={32} 
                color={item.active ? THEME.text : THEME.accent} 
              />
              
              <Text style={[
                styles.cardLabel, 
                { color: item.active ? THEME.text : THEME.textSoft }
              ]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  targetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161815',
    padding: 12,
    borderRadius: 50,
    marginBottom: 30,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reactingTo: {
    color: '#6e726b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  foodName: {
    color: THEME.text,
    fontSize: 15,
    fontWeight: '600',
  },
  gridContent: {
    paddingBottom: 20,
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: THEME.surface,
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.15,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  badge: {
    color: THEME.text,
    fontWeight: '900',
    fontSize: 22,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  cardLabel: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
});