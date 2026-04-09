import { View, Pressable, useColorScheme, StyleSheet, Text, ScrollView, Animated, FlatList, ActivityIndicator } from "react-native";
import TinderCard from "./newCard";
import { useEffect, useRef, useState, useCallback } from "react";
import { DATA } from "../../../constants/sampleData";
import ingICON from"../../../assets/ingredient.png";
import listICON from "../../../assets/to-do-list.png";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { Colors } from "../../../constants/Colors";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from 'expo-blur';
import AvatarComp from "../../(comp)/person";
import { Image } from "expo-image";
import Constants from "expo-constants"

const backendURI = Constants.expoConfig.extra.backendURI

const FRIENDS_URL = `${backendURI}/user/getFreinds`;
const RECIPES_URL = `${backendURI}/recipe/returnRecipes`;
const SWIPEURL = `${backendURI}/recipe/swipeUpdate`;
const SENDRECIPE = `${backendURI}/user/insertRecipeMessage`;
const VISIBLE_CARDS = 5;
const PREFETCH_AHEAD = 6;

const prefetchImages = async (list) =>
  await Promise.all(list.map((x) => (x?.imgurl ? Image.prefetch(x.imgurl) : Promise.resolve())));

const useKeyFactory = () => {
  const ctr = useRef(0);
  const makeKey = useCallback((item) => {
    const base = String(item?.recipeID ?? item?.recipeName ?? "card");
    const id = ctr.current++;
    return `${base}__${id}`;
  }, []);
  return makeKey;
};

export default function HomeScreen() {
  const [cards, setCards] = useState([]);
  const cardsRef = useRef(cards);
  const [start, setStarting] = useState(true)

  const [visibleOverlay, setVisibleOverlay] = useState(null);
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const [friends, setFriends] = useState([]);
  const swipes = useRef([]);
  const swipeSet = useRef(new Set())

  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const inactivityTimer = useRef(null);

  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(colors);
  const router = useRouter();

  const makeKey = useKeyFactory();

  const getCardKey = (card) => card.__key;

  const scheduleInactivityCheck = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    inactivityTimer.current = setTimeout(async () => {
      await loadMore();
    }, 4000);
  }, [loadMore]);


  const withUniqueKeys = useCallback((rawList) => {
    const list = Array.isArray(rawList) ? rawList : [];
    return list.map((item) => ({ ...item, __key: makeKey(item) }));
  }, [makeKey]);

  const seedInitial = useCallback(async (raw) => {
    const initial = withUniqueKeys(raw);
    const toPrefetch = initial.slice(0, PREFETCH_AHEAD);
    await prefetchImages(toPrefetch).catch(() => null);
    setCards((prev)=> [...prev, ...initial]);
  }, [withUniqueKeys]);

  const ingest = useCallback(async (rawList) => {
    const toAdd = withUniqueKeys(rawList);
    if (toAdd.length) {
      const toPrefetch = toAdd.slice(0, PREFETCH_AHEAD);
      await prefetchImages(toPrefetch).catch(() => null);
      setCards((prev) => [...prev, ...toAdd]);
    }
    return toAdd.length;
  }, [withUniqueKeys]);

  const handleCardShift = useCallback(async (direction, id) => {
    if (!swipeSet.current.has(id)) {
      swipes.current.push({
        recipeID: id,
        action: direction
      });
      swipeSet.current.add(id);
    }

    scheduleInactivityCheck();

    const current = cardsRef.current;
    if (current.length > 1) {
      const ahead = current.slice(1, 1 + PREFETCH_AHEAD); // next few cards
      Promise.all(
        ahead.map((c) => (c?.imgurl ? Image.prefetch(c.imgurl).catch(()=>null) : Promise.resolve()))
      ).catch(()=>null);
    }


    requestAnimationFrame(() => setCards((prev) => prev.slice(1)));
  }, [scheduleInactivityCheck]);


  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || !hasMoreRef.current) return;
      isFetchingRef.current = true;
    try {
      const added = await fetcher(false);
      if (added === 0) hasMoreRef.current = false;
    } 
    finally {
      isFetchingRef.current = false;
    }
  }, [fetcher]);


  const fetcher = useCallback(async (appendFromStorage) => {
    const CHUNK = 3;

    const readLocal = async () => {
      const raw = await AsyncStorage.getItem("localPics");
      return raw ? JSON.parse(raw) : [];
    };
    const writeLocal = async (arr) => {
      await AsyncStorage.setItem("localPics", JSON.stringify(arr));
    };

    try {
      const jwt = await AsyncStorage.getItem("jwt");
      let serverRecipes = null;

      if (appendFromStorage) {
        const local = await readLocal();
        if (Array.isArray(local) && local.length > 0) {
          const chunk = local.slice(0, CHUNK);
          const remainder = local.slice(chunk.length);
          await writeLocal(remainder);
          const added = await ingest(chunk);
          if (added === 0) hasMoreRef.current = false;
          return added;
        }
      }

      if (Array.isArray(swipes.current) && swipes.current.length > 0) {
        try {
          const toSend = swipes.current;
          if (toSend.length > 0) {
            const rawSwipe = await axios.put(
              SWIPEURL,
              { swipes: toSend },
              { headers: { Authorization: jwt ?? "" } }
            ).catch((e) => {
              console.log("swipe put error:", e);
              return undefined;
            });

            const formatted = rawSwipe?.data;
            const newRecipes = Array.isArray(formatted?.recipes)
              ? formatted.recipes
              : Array.isArray(formatted)
              ? formatted
              : [];

            if (newRecipes.length > 0) {
              const currLocal = await readLocal();
              const merged = Array.isArray(currLocal) ? currLocal.concat(newRecipes) : newRecipes.slice();
              const capped = merged.slice(-50);
              await writeLocal(capped);
            }
          }
        } catch (e) {
          console.log("error posting swipes:", e);
        } finally {
          swipes.current.length = 0;
          if (swipeSet.current && swipeSet.current.size > 50) swipeSet.current.clear();
        }
      }

      try {
        const rawPull = await axios.get(RECIPES_URL, {
          headers: { Authorization: jwt ?? "" },
        }).catch((e) => {
          console.log("recipes get error:", e);
          return undefined;
        });

        const data = rawPull?.data;
        serverRecipes = Array.isArray(data?.recipes) ? data.recipes : Array.isArray(data) ? data : [];
      } catch (e) {
        console.log("unexpected fetch error:", e);
        serverRecipes = [];
      }

      if (Array.isArray(serverRecipes) && serverRecipes.length > 0) {
        const currLocal = await readLocal();
        const merged = Array.isArray(currLocal) ? currLocal.concat(serverRecipes) : serverRecipes.slice();

        const capped = merged.slice(-100);
        await writeLocal(capped);

        const chunk = capped.slice(0, CHUNK);
        const remainder = capped.slice(chunk.length);
        await writeLocal(remainder);

        const added = await ingest(chunk);
        if (added === 0) hasMoreRef.current = false;
        return added;
      }

      const added = await ingest(DATA);
      if (added === 0) hasMoreRef.current = false;
      return added;
    } catch (err) {
      console.log("fetcher error:", err);
      const added = await ingest(DATA);
      if (added === 0) hasMoreRef.current = false;
      return added;
    } finally {
      if (appendFromStorage) {
        setStarting(false);
      }
    }
  }, [ingest]);


  const starter = useCallback(async () => {
    try {
      await fetcher(true);
    } catch (e) {
      console.error("starter error:", e);
      setCards([]);
    }
  }, [seedInitial, fetcher]);

  useEffect(() => {
    starter();
  }, []);

  useEffect(() => {
    if (cards.length < 5) loadMore();
  }, [cards.length, loadMore]);

  const fetchFriends = useCallback(async () => {
    try {
      const jwt = await AsyncStorage.getItem("jwt");
      const { data } = await axios.get(FRIENDS_URL, { headers: { Authorization: jwt ?? "" } });
      const list = Array.isArray(data?.freinds) ? data.freinds : [];
      setFriends(list);
    } catch (err) {
      console.error("Error fetching friends:", err);
    }
  }, []);

  const toggleOverlay = useCallback(async (type) => {
    if (visibleOverlay === type) {
      Animated.timing(overlayOpacity, {
        toValue: 0, duration: 200, useNativeDriver: true
      }).start(() => setVisibleOverlay(null));
    } else {
      setVisibleOverlay(type);
      Animated.timing(overlayOpacity, {
        toValue: 1, duration: 200, useNativeDriver: true
      }).start();
      if (type === "send") await fetchFriends();
    }
  }, [fetchFriends, overlayOpacity, visibleOverlay]);

  const sendRecipe = useCallback(async (recipe, sendTo) => {
    try {
      const jwt = await AsyncStorage.getItem("jwt");
      const profileRaw = await AsyncStorage.getItem("profile")
      const profile = await JSON.parse(profileRaw)

      const res = await fetch(SENDRECIPE, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: jwt ?? "" },
        body: JSON.stringify({ recipe, person: sendTo, username: profile.userName }),
      });
      
      await res.json().catch(() => null);
    } catch (e) {
      console.log(e);
    }
  }, []);

  const renderFriend = useCallback(
    ({ item }) => (
      <Pressable
        style={{ margin: 10, alignItems: 'center' }}
        onPress={() => {
          if (cards[0]) sendRecipe(cards[0], item);
          toggleOverlay('send');
        }}
      >
        <AvatarComp size={50} attributes={item?.profile} />
        <Text style={{ marginTop: 5, color: 'white' }}>{item?.username || "Friend"}</Text>
      </Pressable>
    ),
    [cards, sendRecipe, toggleOverlay]
  );

  const renderOverlayContent = () => {
    if (!cards[0] || !visibleOverlay) return null;

    if (visibleOverlay === "send") {
      return (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: overlayOpacity, zIndex: 35 }]}>
          <Pressable style={{ position: 'absolute', top: 10, right: 22, zIndex: 50 }} onPress={() => toggleOverlay('send')}>
            <Text style={{ color: 'white', fontSize: 30, fontWeight: "800", padding: 10 }}>x</Text>
          </Pressable>
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill}>
            <View style={{ paddingTop: 60, alignItems: "center" }}>
              <Text style={{ fontSize: 28, fontWeight: "bold", color: "white", marginBottom: 20 }}>
                Send Recipe To:
              </Text>
              <FlatList
                data={friends}
                renderItem={renderFriend}
                keyExtractor={(item, index) => String(item?.userID ?? index)}
                numColumns={3}
                contentContainerStyle={{ paddingBottom: 150 }}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </BlurView>
        </Animated.View>
      );
    }

    const items = visibleOverlay === "ing" ? (cards[0]?.ingredients ?? []) : (cards[0]?.steps ?? []);
    const title = visibleOverlay === "ing" ? "Ingredients" : "Steps";
    const textColor = visibleOverlay === "ing" ? "black" : "white";
    const blurTint = visibleOverlay === "ing" ? "extraLight" : "dark";

    return (
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: overlayOpacity, zIndex: 35 }]}>
        <BlurView intensity={100} tint={blurTint} style={StyleSheet.absoluteFill}>
          <ScrollView contentContainerStyle={{ padding: 30, paddingTop: 40, paddingBottom: 200 }}>
            <Text style={{ fontSize: 30, fontWeight: "bold", color: textColor, marginBottom: 20 }}>{title}</Text>
            {items.map((item, i) => (
              <Text key={`${i}`} style={{ fontSize: 20, color: textColor, marginBottom: 10 }}>
                - {String(item)}
              </Text>
            ))}
          </ScrollView>
        </BlurView>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>

      {visibleOverlay !== 'send' && <Pressable
        style={{ position: 'absolute', top: 25, right: 25, zIndex: 60, padding: 8 }}
        onPress={() => toggleOverlay('send')}
      >
        <Feather name="send" size={28} color={colors.textColor} />
      </Pressable>}

      {!start ?<Pressable
        style={{
          position: 'absolute',
          top: '40%', 
          left: '50%',
          transform: [{ translateX: '-50%' }],
          zIndex: 0,
          alignItems: 'center'
        }}
        onPress={async()=>{
          const added = await fetcher(true)
          if(added == 0){
            alert("You ran out! Come back later")
          }
        }}
      >
        <Text style={{
          color: colors.textColor
        }}>
          out of cards
        </Text>
        <EvilIcons name="refresh" size={34} color={colors.textColor} />

      </Pressable>: <ActivityIndicator color={colors.pop} size={15} style={{
          position: 'absolute',
          top: '40%', 
          left: '50%',
          transform: [{ translateX: '-50%' }],
          zIndex: 0,
          alignItems: 'center'
      }}/>}

      {cards.slice(0, VISIBLE_CARDS).map((card, index) => (
        <TinderCard
          key={getCardKey(card)}
          card={card}
          index={index}
          cardsLength={cards.length}
          onSwipeComplete={handleCardShift}
        />
      ))}

      {renderOverlayContent()}
      <View style={styles.bottomBar}>
        <Pressable onPress={() => { if (cards[0]) toggleOverlay("ing"); }}>
          <Image style={styles.icon} source={ingICON} />
        </Pressable>

        <Pressable
          onPress={() => { if (cards[0]) router.push({ pathname: "./review", params: cards[0] }); }}
          style={styles.chefHat}
        >
          <MaterialCommunityIcons name="chef-hat" size={40} color="white" />
        </Pressable>

        <Pressable onPress={() => { if (cards[0]) toggleOverlay("step"); }}>
          <Image style={styles.icon} source={listICON} />
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    bottomBar: {
      maxWidth: 500,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      position: 'absolute',
      width: '100%',
      height: '10%',
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
      paddingLeft: '8%',
      paddingRight: '8%',
      zIndex: 40,
    },
    icon: {
      width: 40,
      height: 40,
    },
    chefHat: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: 5,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}
