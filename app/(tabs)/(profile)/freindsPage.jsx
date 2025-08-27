import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { RefreshControl, ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";
import AvatarComp from "../../(comp)/person";
import { Colors } from "../../../constants/Colors";
import Constants from "expo-constants"

const backendURI = Constants.expoConfig.extra.backendURI
const REQ = `${backendURI}/user/freindRequest`
const SEA = `${backendURI}/user/findPeople`
const DEL = `${backendURI}/user/deleteFriend`
const ACC = `${backendURI}/user/acceptFriend`
const FET = `${backendURI}/user/getFreinds`
const PEN = `${backendURI}/user/getPending`

export default function FreindsPage() {
    const {username} = useLocalSearchParams()
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const styles = createStyles(colors);

    const [filter, setFilter] = useState("");
    const [debounced, setDebouncedText] = useState("");
    const [searching, setSearching] = useState(false);
    const [freinds, setFreinds] = useState([]);
    const [newPeople, setNewPeople] = useState([]);
    const router = useRouter()
    const [pending, setPending] = useState(false)
    const [pendingPeople, setPendingPeople] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const freindRequest = async (username) => {
        try {
            const jwt = await AsyncStorage.getItem("jwt");
            const raw = await fetch(REQ, {
                method: "POST",
                headers: {
                    "Authorization": jwt,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username })
            });
            await raw.json();
            setNewPeople((prev) => prev.filter((each) => each.username !== username));
            alert("Friend request sent");
        } catch (error) {
            console.log(error);
        }
    };

    const searchFreinds = async () => {
        try {
            setSearching(true);
            const jwt = await AsyncStorage.getItem("jwt");
            const rawPeople = await fetch(SEA, {
                method: "POST",
                headers: {
                    "Authorization": jwt,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    search: debounced
                })
            });
            const response = await rawPeople.json();
            if (response && response.success) {
                setNewPeople(response.profile);
            }
        } catch (error) {
            console.log(error);
        }
        finally{
            setSearching(false)
        }
    };

    const acceptFriend = async(friend_id) =>{
        try {
            const jwt = await AsyncStorage.getItem("jwt");
            const raw = await fetch(ACC, {
                method: "POST",
                headers: {
                    "Authorization": jwt,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    friendID: friend_id
                })
            });
            const response = await raw.json();

            if(response && response.success){
                setPendingPeople((prev)=> prev.filter((each)=> each.friend_id != friend_id))
                fetchFriends();
            }

        } catch (error) {
            console.log(error)
        }
    }

    const deleteFriend = async(friend_id, pending) =>{
        try {
            const jwt = await AsyncStorage.getItem("jwt");
            const raw = await fetch(DEL, {
                method: "DELETE",
                headers: {
                    "Authorization": jwt,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    friendID: friend_id,
                    pending: pending
                })
            });
            const response = await raw.json();
            console.log(response)
            if(pending){
                setPendingPeople((prev) => prev.filter((each)=> each.friend_id != friend_id))                
            }
            else{
                setFreinds((prev)=> prev.filter((each)=> each.friend_id != friend_id))
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (filter === "") {
            setNewPeople([]);
        }
        const handler = setTimeout(() => {
            setDebouncedText(filter);
        }, 500);

        return () => clearTimeout(handler);
    }, [filter]);

    useEffect(() => {
        if (debounced !== "") {
            searchFreinds();
        }
    }, [debounced]);

    const fetchFriends = async () => {
        try {
            const jwt = await AsyncStorage.getItem("jwt");
            const freindRaw = await fetch(FET, {
                method: "GET",
                headers: {
                    "Authorization": jwt,
                    "Content-Type": "application/json"
                }
            });
            const data = await freindRaw.json();
            if (data && data.success) {
                setFreinds(data.freinds);
            }

            const pendingRaw = await fetch(PEN, {
                headers: {
                    "Authorization": jwt,
                    "Content-Type": "Application/json"
                }
            })

            const jsonPending = await pendingRaw.json()
            if(jsonPending && jsonPending.success){
                setPendingPeople(jsonPending.freinds)
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchFriends();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchFriends();
        setRefreshing(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.topNav}>
                <Pressable
                    onPress={() => {
                        router.back()
                    }}
                >
                    <Text style={{ color: colors.textColor, fontSize: 30 }}>←</Text>
                </Pressable>
                <Text style={{ color: colors.textColor, fontWeight: "500" }}>{username}</Text>
                <Pressable onPress={() => {
                    setPending((prev) => !prev)
                }}>
                    {!pending ? (
                        <Text style={{ color: colors.textColor, fontSize: 35 }}>+</Text>
                    ) : <Text style={{ color: colors.textColor, fontSize: 40 }}>-</Text>}
                </Pressable>
            </View>

            <TextInput
                placeholder='Search'
                style={styles.searchInput}
                placeholderTextColor={colors.textColor}
                onChangeText={(text) => {
                    setFilter(text)
                }}
                autoCapitalize='none'
            />

            <ScrollView
                style={{ width: '100%' }}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                {!pending ? (freinds
                    .filter((each) => each.username.includes(filter))
                    .map((each, index) => (
                        <View style={styles.friendItem} key={index}>
                            <AvatarComp size={50} attributes={each.profile} />
                            <Text style={{ fontSize: 18, color: 'white' }}>{each.username}</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    deleteFriend(each.friend_id, false)
                                }}
                            >
                                <Text style={styles.removeBtn}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    ))): pendingPeople.length === 0 ? <Text style={{ color: colors.textColor }}>No one pending...</Text> : (
                        pendingPeople.map((each, index) => (
                            <View style={[styles.friendItem, { backgroundColor: 'grey' }]} key={index}>
                                <AvatarComp size={50} attributes={each.profile} />
                                <Text style={{ fontSize: 18, color: 'white' }}>{each.username}</Text>

                                {each.requested == each.friend_id ? (
                                    <View style={{ flexDirection: 'row', width: 160, justifyContent: 'space-between' }}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                acceptFriend(each.friend_id)
                                            }}
                                        >
                                            <Text style={styles.addBtn}>Accept</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => {
                                                deleteFriend(each.friend_id, true);
                                            }}
                                        >
                                            <Text style={styles.removeBtn}>Decline</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) :
                                    <TouchableOpacity
                                        onPress={() => {
                                            deleteFriend(each.friend_id, true);
                                        }}
                                    >
                                        <Text style={[styles.removeBtn, { backgroundColor: 'white', color: 'black' }]}>Pending</Text>
                                    </TouchableOpacity>}

                            </View>
                        ))

                    )
                }

                {!pending ? (searching ? (
                    <ActivityIndicator size={150} color={colors.textColor} />
                ) : newPeople.map((each, index) => (
                    <View style={[styles.friendItem, { backgroundColor: colors.textColor }]} key={index}>
                        <AvatarComp size={50} attributes={each.profile} />
                        <Text style={{ fontSize: 18, color: colors.background }}>{each.username}</Text>
                        <TouchableOpacity onPress={() => freindRequest(each.username)}>
                            <Text style={styles.addBtn}>Add</Text>
                        </TouchableOpacity>
                    </View>
                ))): null}
            </ScrollView>
        </View>
    );
}

function createStyles(colors) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            padding: 10,
            alignItems: 'center'
        },
        topNav: {
            padding: 5,
            justifyContent: 'space-between',
            width: '100%',
            alignItems: 'center',
            flexDirection: 'row',
            marginBottom: 20
        },
        searchInput: {
            color: colors.textColor,
            width: '90%',
            marginBottom: 30,
            borderColor: colors.textColor,
            borderWidth: 2,
            fontSize: 18,
            backgroundColor: colors.fillColor,
            padding: 15,
            borderRadius: 20
        },
        friendItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.pop,
            padding: 10,
            borderRadius: 20,
            width: '100%',
            marginBottom: 15
        },
        removeBtn: {
            fontWeight: '300',
            color: 'white',
            padding: 15,
            backgroundColor: 'rgba(255, 0, 0, 0.4)',
            borderRadius: 20
        },
        addBtn: {
            fontWeight: '300',
            color: 'black',
            padding: 15,
            backgroundColor: 'rgba(0, 255, 85, 0.4)',
            borderRadius: 20
        }
    });
}
