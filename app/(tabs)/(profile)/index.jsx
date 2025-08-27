import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { RefreshControl, ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View, Alert } from "react-native";
import AvatarComp from "../../(comp)/person";
import { Colors } from "../../../constants/Colors";
import { getProfileFunction } from "../../../constants/func"
import AntDesign from '@expo/vector-icons/AntDesign';
import { Image } from "expo-image";
import Constants from "expo-constants"

const backendURI = Constants.expoConfig.extra.backendURI
const LIK = `${backendURI}/profile/likedCards`
const MY = `${backendURI}/recipe/getMyRecipes`

export default function ProfileScreen() {
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const styles = createStyles(colors);

    const [liked, setLiked] = useState([]);
    const [past, setPast] = useState([]);
    const [loadingLiked, setLoadingLiked] = useState(true);
    const [loadingPast, setLoadingPast] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selected, setSelected] = useState(true);

    const [profileStats, setProfileStats] = useState({
        name: "",
        username: "",
        totalFriends: NaN
    });

    const router = useRouter();

    const [attributes, setAttributes] = useState({
        skinColor: 0,
        ear: "big",
        hairColor: 0,
        hairStyle: 0,
        hatStyle: 0,
        hatColor: 0,
        eyeStyle: 0,
        glassesStyle: 0,
        noseStyle: 0,
        mouthStyle: 0,
        shirtStyle: 0,
        shirtColor: 0,
        bgColor: 0,
    });

    const getLikedFetch = async () => {
        try {
            setLoadingLiked(true);
            const jwt = await AsyncStorage.getItem("jwt");
            const profileLocalString = await AsyncStorage.getItem("profile");
            if (profileLocalString) {
                const locally = JSON.parse(profileLocalString);
                if (locally?.profile) setAttributes(locally.profile);
            }

            const response = await fetch(LIK, {
                method: "GET",
                headers: { Authorization: jwt }
            });

            const data = await response.json();
            if (data?.success && Array.isArray(data.data)) {
                data.data.forEach((each)=> Image.prefetch(each.imgurl))
                setLiked(data.data);
            } else {
                setLiked([]);
            }
        } catch (error) {
            console.log(error);
            setLiked([]);
        } finally {
            setLoadingLiked(false);
        }
    };

    const getPastFetch = async () => {
        try {
            setLoadingPast(true);
            const jwt = await AsyncStorage.getItem("jwt");

            const response = await fetch(MY, {
                method: "GET",
                headers: { Authorization: jwt }
            });

            const data = await response.json();
            if (data?.success && Array.isArray(data.recipes)) {
                data.recipes.forEach((each)=> {
                    if(!each.imgurl.endsWith("null") || !each.imgurl.endsWith("default")){
                        Image.prefetch(each.imgurl)
                    }
                })
                setPast(data.recipes.filter((each)=>{
                    return !(each.imgurl.endsWith("null") || each.imgurl.endsWith("default"));
                }));
            } else {
                setPast([]);
            }
        } catch (error) {
            console.log(error);
            setPast([]);
        } finally {
            setLoadingPast(false);
        }
    };

    const getProfileFetch = async () => {
        try {
            const profile = await getProfileFunction();
            if (profile) {
                if (profile.profile) setAttributes(profile.profile);
                setProfileStats({
                    name: (profile.firstname || "") + " " + (profile.lastname || ""),
                    username: profile.userName || "",
                    totalFriends: profile.totalFriends
                });
                await AsyncStorage.setItem("profile", JSON.stringify(profile));
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        (async () => {
            await getLikedFetch();
            await getPastFetch();
            await getProfileFetch();
        })();
    }, []);

    const logout = () => {
        Alert.alert(
            "Logout?",
            "Are you sure you want to log out?",
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.clear();
                        router.replace("/(uauth)");
                    }
                }
            ]
        );
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await getProfileFetch();
        await getLikedFetch();
        await getPastFetch();
        setRefreshing(false);
    };

    const renderGrid = (list, loading) => {
        if (loading) {
            return <ActivityIndicator size="large" color="rgb(0, 208, 255)" style={styles.loading} />;
        }

        if (!list || list.length === 0) {
            return <Text style={{ color: colors.textColor, fontSize: 18, marginTop: 20 }}>No recipes found.</Text>;
        }

        return (
            <View style={styles.grid}>
                {list.map((item, index) => {
                    const img = item?.imgurl;
                    return (
                        <TouchableOpacity
                            key={index}
                            style={styles.gridItem}
                            onPress={() => {
                                router.push({
                                    pathname: 'cardCopy',
                                    params: { data: JSON.stringify({
                                        ...item,
                                        liked: item.date? formatDate(item.date): null
                                    })}
                                });
                            }}
                        >
                            {item.date && (
                                <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: 700 }}>
                                    {formatDate(item.date)}
                                </Text>
                            )}

                            <Image 
                                source={{ uri: img, cache: "force-cache" }} 
                                style={styles.image} 
                            />

                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />
            }
        >
            <View style={styles.topHalf}>
                {profileStats.name === "" ? (
                    <ActivityIndicator style={{ marginBottom: 26 }} />
                ) : (
                    <Text style={styles.name}>{profileStats.name}</Text>
                )}

                <AvatarComp size={200} attributes={attributes} />

                <Pressable style={{ position: 'absolute', top: 20, right: 20 }} onPress={logout}>
                    <AntDesign name="logout" size={20} color={colors.textColor} />
                </Pressable>

                <Pressable
                    style={styles.changeAvatar}
                    onPress={() => {
                        router.push({
                            pathname: "character",
                        })
                    }}
                >
                    <Text style={styles.changeText}>Change Avatar</Text>
                </Pressable>

                <Pressable
                    style={{ alignItems: 'center' }}
                    onPress={() => {
                        router.push({
                            pathname: './freindsPage',
                            params: { username: profileStats.username }
                        });
                    }}
                >
                    <Text style={{ color: colors.textColor, fontSize: 22, fontWeight: 900 }}>
                        {Number.isNaN(profileStats.totalFriends) ? "..." : profileStats.totalFriends}
                    </Text>
                    <Text style={{ color: colors.textColor }}>Freinds</Text>
                </Pressable>
            </View>

            <View style={styles.bottomHalf}>
                {/* Segmented control: Liked | Past */}
                <View style={styles.tabRow}>
                    <Pressable
                        onPress={() => setSelected(true)}
                        style={[styles.tab, selected && styles.tabActive]}
                    >
                        <Text style={styles.tabText}>Liked</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setSelected(false)}
                        style={[styles.tab, !selected && styles.tabActive]}
                    >
                        <Text style={styles.tabText}>Past</Text>
                    </Pressable>
                </View>

                <View style={{ width: "100%" }}>
                    <View style={{ display: selected ? "flex" : "none" }}>
                        {renderGrid(liked, loadingLiked)}
                    </View>
                    <View style={{ display: !selected ? "flex" : "none" }}>
                        {renderGrid(past, loadingPast)}
                    </View>
                </View>


            </View>
        </ScrollView>
    );
}

function createStyles(colors) {
    return StyleSheet.create({
        changeText: {
            fontSize: 18,
            color: colors.textColor,
        },
        name: {
            fontSize: 30,
            marginBottom: 15,
            color: colors.textColor
        },
        changeAvatar: {
            marginTop: 10,
            marginBottom: 10,
            backgroundColor: colors.pop,
            padding: '3%',
            borderRadius: 20
        },
        loading: {
            marginTop: 40
        },
        container: {
            flex: 1,
            backgroundColor: colors.background,
            padding: 10
        },
        topHalf: {
            minHeight: 400,
            backgroundColor: colors.halfBackground,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 30,
            padding: 20,
        },
        bottomHalf: {
            padding: 8,
            paddingTop: 13,
            justifyContent: 'center',
            alignItems: 'center',
        },

        // Tabs
        tabRow: {
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            marginBottom: 12,
        },
        tab: {
            borderRadius: 14,
            paddingVertical: 6,
            paddingHorizontal: 14,
            borderWidth: 1,
            borderColor: colors.halfBackground,
            backgroundColor: 'transparent',
        },
        tabActive: {
            backgroundColor: colors.pop,
            borderColor: 'transparent',
        },
        tabText: {
            color: colors.textColor,
            fontSize: 22,
        },

        // Grid
        grid: {
            width: '100%',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 10,
        },
        gridItem: {
            width: '31%',
            aspectRatio: 0.6,
            marginBottom: 10,
            borderRadius: 8,
            overflow: 'hidden',
            alignItems: 'center'
        },
        image: {
            width: '100%',
            height: '100%',
            contentFit: 'cover',
        },

        text: {
            color: colors.textColor,
            marginBottom: 20,
            fontSize: 25
        },
    });
}

const formatDate = (dateString) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const date = new Date(dateString);
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${month}/${day}/${year}`;
};
