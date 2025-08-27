import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stomp } from '@stomp/stompjs';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
  TouchableOpacity,
} from 'react-native';
import SockJS from 'sockjs-client';
import { Colors } from '../../constants/Colors';
import AntDesign from '@expo/vector-icons/AntDesign';
import {getProfileFunction} from "../../constants/func"
import Constants from "expo-constants"

const backendURI = Constants.expoConfig.extra.backendURI
const SOCKET_URL = `${backendURI}/ws`;

export default function ChatPage() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(colors);
  const { room_ID, otherUserName } = useLocalSearchParams();

  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [selectedIMG, setSelectedIMG] = useState("");
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const stompClient = useRef(null);
  const [msg, setMessage] = useState('Connecting...');
  const flatListRef = useRef(null);

  const addToLike = async(recipeID) =>{
    try {
        const jwt = await AsyncStorage.getItem("jwt")
        const raw = await fetch(`${backendURI}/recipe/swipeUpdate`,{
            method: "PUT",
            headers:{
                "Authorization": jwt,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                swipes: [
                    {
                        recipeID: Number(recipeID),
                        action: "like"
                    }
                ]
            })
        })
        const response = await raw.json()
        console.log(response)
    } catch (error) {
        console.log(error)
    }
    finally{
      alert("Liked!")
    }
}

  const getHistory = async () => {
    try {
      const jwt = await AsyncStorage.getItem('jwt');

      const prevMessages = await fetch(
        `${backendURI}/user/getPreviousMessages/${room_ID}`,
        {
          method: 'GET',
          headers: {
            Authorization: jwt,
            'Content-Type': 'application/json',
          },
        }
      );
      const prevMessagesJSON = await prevMessages.json();
      if (prevMessagesJSON && prevMessagesJSON.success) {
        setMessages((prev) => [...prev, ...prevMessagesJSON.chats]);
      } else {
        setMessage('Something went wrong, please try again later');
      }

      const profileRES = await getProfileFunction();
      if (profileRES ) {
        setUsername(profileRES.userName);
        return profileRES.userName;
      } else {
        setMessage('Something went wrong, please try again later');
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  useEffect(() => {
    (async () => {
      const localUsername = await getHistory();
      if (localUsername) {
        connect(localUsername);
      }
    })();

    return () => {
      if (stompClient.current && stompClient.current.connected) {
        stompClient.current.deactivate();
      }
    };
  }, []);

  const connect = (localUser) => {
    const socket = new SockJS(SOCKET_URL);
    stompClient.current = Stomp.over(socket);

    stompClient.current.connect({}, () => {
      setConnected(true);

      stompClient.current.subscribe(`/topic/room/${room_ID}`, (message) => {
        const body = JSON.parse(message.body);
        setMessages((prev) => [...prev, body]);
      });

      stompClient.current.send(
        '/app/chat.addUser',
        {},
        JSON.stringify({
          sender: localUser,
          type: 'JOIN',
          roomID: room_ID,
        })
      );
    });
  };

  const sendMessage = () => {
    if (stompClient.current && input.trim() !== '') {
      stompClient.current.send(
        '/app/chat.sendMessage',
        {},
        JSON.stringify({
          sender: username,
          content: input,
          type: 'CHAT',
          roomID: room_ID,
        })
      );
      setInput('');
    }
  };

  const renderItem = ({ item }) => {
    if (item.messageType === 'JOIN' || item.messageType === 'LEAVER') return null;
    const isOwnMessage = item.sender === username;
    const arr = item.content.split('^^vv');
    const flag = arr[2] == selectedIMG
    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        <View
          style={{ flex: 1, alignItems: isOwnMessage ? 'flex-end' : 'flex-start' }}
        >
          {arr.length === 3 ? (
            <TouchableOpacity
              onPress={()=>{
                setSelectedIMG((prev)=>{
                  return(prev == arr[2] ? "": arr[2])
                })
              }}
              style={{
                position: 'relative',
                borderRadius: 30,
                overflow: 'hidden',
                width: flag? '80%': '45%',
                height: flag? 400: 200,
                backgroundColor: 'white',
              }}
            >
                <Pressable
                  onPress={()=>{
                    addToLike(arr[1])
                  }}
                  style={{
                    position: 'absolute',
                    top: 15,
                    right: 15,
                    zIndex: 12
                  }}
                >
                  <AntDesign name="like1" size={flag? 50: 20} color="rgba(58, 209, 78, 1)" />
                </Pressable>
                <Image
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 10
                  }}
                  source={{ uri: arr[2] }}
                />
                <Text style={{
                  color: 'black', 
                  position: 'absolute', 
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  bottom: 0,
                  width: '100%',
                  padding: flag? 15: 10,
                  fontSize: flag? 20: 13,
                  zIndex: 15,
                  fontWeight: 800
                }}>{arr[0]}</Text>
            </TouchableOpacity>
          ) : (
            <View style={isOwnMessage ? styles.ownBubble : styles.otherBubble}>
              <Text
                style={
                  isOwnMessage ? styles.ownMessageText : styles.otherMessageText
                }
              >
                {item.content}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (!connected) {
    return (
      <SafeAreaView
        style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}
      >
        <Text style={{ color: colors.textColor }}>{msg}</Text>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
    >
        <View style={styles.container}>
          <Pressable
            style={{ position: 'absolute', padding: 10, top: 0, left: 20, zIndex: 10 }}
            onPress={() => {
              router.push('../(tabs)/chats');
            }}
          >
            <Text style={{ color: colors.textColor, fontSize: 20 }}>←</Text>
          </Pressable>

          <Text
            style={{
              alignSelf: 'center',
              fontSize: 17,
              color: colors.textColor,
              fontWeight: '700',
              marginBottom: 7,
              marginTop: 20,
            }}
          >
            {otherUserName}
          </Text>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderItem}
            inverted={false}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'flex-end',
            }}
          />

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Type a message"
              placeholderTextColor={colors.background}
              value={input}
              onChangeText={setInput}
              style={styles.input}
            />
            <Pressable onPress={sendMessage}>
              <Text
                style={{
                  color: 'white',
                  padding: 11,
                  borderRadius: 20,
                  fontSize: 15,
                  backgroundColor: 'rgba(88,132,244, 0.6)',
                }}
              >
                Send
              </Text>
            </Pressable>
          </View>
        </View>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
      backgroundColor: colors.background,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 11,
      borderRadius: 20,
      backgroundColor: '#f0f0f0',
      fontSize: 15,
      color: colors.text,
      marginRight: 10,
    },
    messageContainer: {
      flexDirection: 'row',
      marginVertical: 4,
    },
    ownMessage: {
      alignSelf: 'flex-end',
    },
    otherMessage: {
      alignSelf: 'flex-start',
    },
    ownBubble: {
      backgroundColor: colors.pop,
      borderRadius: 20,
      padding: 10,
    },
    otherBubble: {
      backgroundColor: '#b6b6beff',
      borderRadius: 20,
      padding: 10,
      maxWidth: '75%',
    },
    ownMessageText: {
      fontSize: 16,
      color: colors.textColor,
    },
    otherMessageText: {
      fontSize: 16,
      color: colors.textColor,
    },
    sender: {
      color: colors.text,
      fontSize: 12,
      marginBottom: 2,
    },
  });
}
