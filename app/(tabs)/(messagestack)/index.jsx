import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useColorScheme, View, RefreshControl } from "react-native";
import AvatarComp from "../../(comp)/person";
import { Colors } from "../../../constants/Colors";
import Constants from "expo-constants"

const backendURI = Constants.expoConfig.extra.backendURI

export default function AllChats() {
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const styles = createStyles(colors);
    const [dummyChats, setChats] = useState([]);
    const [freinds, setFriends] = useState([])
    const [create, setCreate] = useState(false)
    const [filter, setFilter] = useState("");
    const router = useRouter()
    const [refreshing, setRefreshing] = useState(false);

    const fetchTopChats = async () => {
        setRefreshing(true)
        try {
            const jwt = await AsyncStorage.getItem("jwt");
            const raw = await fetch(`${backendURI}/user/getTopChats`, {
                method: "GET",
                headers: {
                    "Authorization": jwt,
                    "Content-Type": "application/json"
                }
            });
            const response = await raw.json();
            if (response && response.success) {
                setChats(response.freinds);
                return response.freinds.map((each)=> each.otherUsername)
            }
        } catch (error) {
            console.log(error);
        }
        finally{
            setRefreshing(false)
        }
    };

    useEffect(() => {
        const fetchFriends = async(takeAway)=>{
            try {
                const jwt = await AsyncStorage.getItem("jwt");
                const freindRaw = await fetch(`${backendURI}/user/getFreinds`, {
                    method: "GET",
                    headers: {
                        "Authorization": jwt,
                        "Content-Type": "application/json"
                    }
                });
                const data = await freindRaw.json();
                if (data && data.success) {
                    setFriends(data.freinds.filter((each)=> !takeAway.includes(each.username)))
                }
            } catch (error) {
                console.log(error)
            }
        }

        (async () => {
            const takeAway = await fetchTopChats();
            await fetchFriends(takeAway);
        })()
    }, []);

    const createChat = async(ID, username)=>{
        try {
            const jwt = await AsyncStorage.getItem("jwt");
            const raw = await fetch(`${backendURI}/user/createChat`, {
                method: "POST",
                headers: {
                    "Authorization": jwt,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    friendID: ID
                })
            });
            const data = await raw.json();
            console.log(data)

            if(data && data.success){
                router.replace({
                    pathname: "chatPage",
                    params:{
                        room_ID: data.roomID,
                        otherUserName: username
                    }
                })
            }
        } catch (error) {
            console.log(error)
        }
    }

    function formatTimeAgo(sentAt) {
        const now = new Date();
        const sentTime = new Date(sentAt);
        const diffMs = now - sentTime;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return "Now";
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        return `${diffDays}d`;
    }

    const filteredChats = dummyChats.filter((each) =>
        each.otherUsername.toLowerCase().includes(filter.toLowerCase()) ||
        each.content.toLowerCase().includes(filter.toLowerCase())
    );

    const filteredFriends = freinds.filter((each)=>{
        each.username.toLowerCase().includes(filter.toLowerCase()) ||
        each.content.toLowerCase().includes(filter.toLowerCase())
    })

    return (
        <View style={styles.container}>
            <Text style={styles.header}>{create? "Start Convo": "Chats"}</Text>
            <Pressable style={{position: 'absolute', top: 0, right: 25, padding: 15}}
                onPress={()=>{
                    setCreate((prev)=> !prev)
                }}
            >
                <Text style={{color: colors.textColor, fontSize: 25}}>{create? "←": "+"}</Text>
            </Pressable>

            <TextInput
                placeholder='Search'
                style={styles.searchInput}
                placeholderTextColor={colors.textColor}
                onChangeText={(text) => setFilter(text)}
                value={filter}
                autoCapitalize='none'
            />

            <ScrollView 
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={()=>{
                        fetchTopChats()
                    }} tintColor={colors.textColor} />
                }
                contentContainerStyle={{ paddingBottom: 100 }} 
                style={{ width: "100%" }}
            >
                {create?(
                    freinds.map((each, index)=>
                        <Pressable 
                            key={index} 
                            style={[styles.chatItem, {backgroundColor: colors.background, borderColor: colors.textColor, borderWidth: 1}]}
                            onPress={()=>{
                                createChat(each.friend_id, each.username)
                            }}
                        >
                            <AvatarComp size={50} attributes={each.profile} />
                            <View style={{ flex: 1, marginHorizontal: 10 }}>
                                <Text style={styles.username}>{each.username}</Text>
                            </View>
                        </Pressable>
                    )
                ): filteredChats.map((chat, index) => {
                    const isUnread = !chat.readByReciever && !chat.youSent;

                    return (
                        <Pressable 
                            key={index} 
                            style={styles.chatItem}
                            onPress={()=>{
                                router.replace({
                                    pathname: "chatPage",
                                    params:{
                                        room_ID: chat.chatId,
                                        otherUserName: chat.otherUsername
                                    }
                                })
                            }}
                        >
                            <AvatarComp size={50} attributes={chat.profile} />
                            <View style={{ flex: 1, marginHorizontal: 10 }}>
                                <Text style={styles.username}>{chat.otherUsername}</Text>
                                <Text style={[styles.messagePreview, isUnread && styles.unreadMessage]}>
                                    {chat.content}
                                </Text>
                            </View>
                            <Text style={styles.viewBtn}>{formatTimeAgo(chat.sentAt)}</Text>
                        </Pressable>
                    );
                })}

                {filteredChats.length === 0 && !refreshing &&(
                    <Text style={{ color: colors.textColor, marginTop: 20, alignSelf: 'center' }}>
                        No chats found.
                    </Text>
                )}
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
        header: {
            fontSize: 28,
            fontWeight: "600",
            color: colors.textColor,
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
        chatItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(88,132,244, 0.6)',
            padding: 10,
            borderRadius: 20,
            width: '100%',
            marginBottom: 15
        },
        username: {
            color: colors.textColor,
            fontSize: 16,
            fontWeight: '500',
            marginBottom: 4
        },
        messagePreview: {
            color: colors.textColor,
            fontSize: 14
        },
        unreadMessage: {
            fontWeight: 'bold'
        },
        viewBtn: {
            fontWeight: '300',
            color: 'black',
            padding: 10,
            backgroundColor: 'white',
            borderRadius: 15
        }
    });
}