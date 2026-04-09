import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Dimensions, 
  Pressable 
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { oneMonthFormat } from '../../../../constants/dateHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";
const backendURI = Constants.expoConfig.extra.backendURI;

// GET CALL USING TOKEN, MONTH YEAR

const { width } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const GAP = 10;
const ITEM_WIDTH = (width - (HORIZONTAL_PADDING * 2) - (GAP * 2)) / 3;

const THEME = {
  bg: '#111211',
  accent: '#FF7B54',
  text: '#FFFFFF',
  textMuted: '#8E8E8E',
  navBg: '#1C1D1C',
};

function getMonthInt(month) {
  const months = {
    JAN: "01",
    FEB: "02",
    MAR: "03",
    APR: "04",
    MAY: "05",
    JUN: "06",
    JUL: "07",
    AUG: "08",
    SEP: "09",
    OCT: 10,
    NOV: 11,
    DEC: 12
  };

  return months[month.toUpperCase()] || null;
}

export default function HistoryScreen() {
  const router = useRouter()
  const {data} = useLocalSearchParams()
  const parsedData = JSON.parse(data)
  const year = parsedData.year
  const month = parsedData.month
  const [DUMMY_DATA, set_DUMMY_DATA] = useState([])
  const [avatarImage, setAvatar] = useState(null)
  const [username, setUsername] = useState(null)
  
  const getURL = async()=>{
    try {
      const url = await AsyncStorage.getItem("avatarUrl")
      const user = await AsyncStorage.getItem("username")
      setAvatar(url)
      if (user){
        setUsername(user)
      }
    } catch (error) {
      return null
    }
  }

  useEffect(()=>{
    const pull = async()=>{
      
      try {
        const m = getMonthInt(month)
        const jwt = await AsyncStorage.getItem("jwt")
        const raw = await fetch(`${backendURI}/Post/getPostsMonth?monthYear=${year}-${m}`, {
          headers: {
            "Authorization": jwt
          }
        })
        if(!raw.ok){
          return
        }
        const response = await raw.json()
        set_DUMMY_DATA(response)

      } catch (error) {
        console.log(error)
      }
    }
    getURL()
    pull()
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable hitSlop={10} onPress={()=>{router.back()}}>
          <Feather name="arrow-left" size={24} color={THEME.accent} />
        </Pressable>
        <Text style={styles.headerTitle}>{oneMonthFormat(month, year)}</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitleText}>SEE YOUR CAPTURES</Text>
          <View style={styles.subtitleUnderline} />
        </View>

        <View style={styles.gridContainer}>
          {DUMMY_DATA.map((item, index) => (
            <Pressable key={index} style={styles.gridItem} onPress={()=>{
              const formattedData = {
                heroImage: item.imgurl,
                caption: item.caption,
                badges: item.badges,
                avatar: item.avatarurl,
                name: item.username || "Guest",
                meta: item.date,
                name: username,
                avatar: avatarImage,
                homemade: item.homemade,
                title: item.createdAt.slice(0, 10),
                individualData: {
                  flavor: item.flavor,
                  rating: item.stars,
                  time: item.time,
                  quantity: item.quant 
                }
              };
              router.push({
                pathname: "individualPost",
                params: {
                  data: JSON.stringify(formattedData)
                }
              })
            }}>
              <Image 
                source={{ uri: item.imgurl }} 
                style={styles.image} 
              />
              {item.date != null && (
                <View style={styles.badgeContainer}>
                  <MaterialCommunityIcons name="star" size={14} color="#1A1A1A" />
                </View>
              )}
            </Pressable>
          ))}
        </View>

        <View style={styles.endMarkerContainer}>
          <Feather name="calendar" size={28} color={THEME.textMuted} style={styles.endIcon} />
          <Text style={styles.endText}>END OF HISTORY</Text>
        </View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.text,
    marginLeft: 16,
    letterSpacing: -0.5,
  },

  subtitleContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    marginBottom: 24,
  },
  subtitleText: {
    color: THEME.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitleUnderline: {
    width: 45,
    height: 2,
    backgroundColor: THEME.accent,
  },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: GAP,
  },
  gridItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    marginBottom: GAP,
    borderRadius: 16,
    backgroundColor: '#222',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  badgeContainer: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: THEME.accent,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  endMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  endIcon: {
    marginBottom: 12,
    opacity: 0.6,
  },
  endText: {
    color: THEME.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    opacity: 0.6,
  },
});