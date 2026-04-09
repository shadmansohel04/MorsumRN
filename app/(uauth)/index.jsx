import { Pressable, KeyboardAvoidingView, ScrollView, useColorScheme, StyleSheet, View, Image, Text, Platform, useWindowDimensions, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from "../../constants/Colors";
import newLogo from "../../assets/images/newLogo.png";
import pantryImg from "../../assets/images/Pantry.png";
import Constants from "expo-constants";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
const backendURI = Constants.expoConfig.extra.backendURI;


export default function LoginScreen() {
  const colorScheme = useColorScheme();
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const colors = colorScheme === 'dark' ? theme.dark : theme.dark;
  const fonts = theme.font;
  const { width: screenWidth } = useWindowDimensions();
	const router = useRouter()
  const styles = createStyles(colors, fonts, screenWidth);

	const handleLogin = async()=>{
		try {
			const raw = await fetch(`${backendURI}/account/login`,{
				method: "POST",
				body: JSON.stringify({
					email,
					password
				}),
				headers: {
					"Content-Type": "application/json"
				}
			})
			if(!raw.ok){
				throw Error("login failed")
			}
			const response = await raw.json()
			if (response && response.token){
				await AsyncStorage.setItem("jwt", response.token)
				await AsyncStorage.setItem("username", response.username)
				await AsyncStorage.setItem("avatarUrl", response.avatarUrl)
				await AsyncStorage.setItem("createdat", response.createdAt)
			}
			router.replace("../(tabs)")
		} 
		catch (error) {
			console.log(error)
			alert("Login failed, please try again")
		}
	}

  return(
    <KeyboardAvoidingView
      style={{ flex: 1, width: '100%', backgroundColor: colors.background}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === "ios"? 50: 20}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        style={{flex: 1}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{flexDirection: "row", height: 80, width: "65%", alignItems: "center", justifyContent: "center", marginBottom: 15}}>
          <View style={{width: 35, height: 35, marginRight: 15}}>
            <Image source={newLogo} style={{width: "100%", height: "100%"}}/>
          </View>
          <Text style={{fontFamily: fonts.title, fontWeight: '900', fontSize: 58, color: colors.titleText}}>Morsum</Text>
        </View>
        <Text style={{marginBottom: 15, color: colors.boldText, fontWeight: '700', fontSize: 22, fontFamily: fonts.title}}>Your plate, your story</Text>
        <Text style={{textAlign: "center", width: 280, color: colors.subtleText, fontWeight: '400', fontSize: 17, fontFamily: fonts.subText}}>Capture the warmth of every meal. Share your daily morsels with those who matter.</Text>
        
        <View style={{width: screenWidth - 48, height: 240, borderRadius: 24, marginTop: 40}}>
          <Image 
            style={{width: "100%", height: "100%", borderRadius: 24}} 
            resizeMode='cover' 
            source={pantryImg}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.labelText}>EMAIL</Text>
          <TextInput onChangeText={(e)=>{setEmail(e)}} style={styles.input} placeholder='johnSmith@morsum.com' placeholderTextColor={"rgba(227, 231, 222, 0.3)"}/>
          
          <Text style={styles.labelText}>PASSWORD</Text>
          <TextInput onChangeText={(e)=>{setPassword(e)}} style={styles.input} placeholder='********' placeholderTextColor={"rgba(227, 231, 222, 0.3)"} secureTextEntry={true}/>
          
          <Pressable
						onPress={handleLogin}
						style={styles.buttonShadow}
					>
            <LinearGradient
              colors={['#FF8762', '#FE6F42']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBackground}
            >
              <Text style={styles.buttonText}>Login</Text>
            </LinearGradient>
          </Pressable>
          <Pressable
						onPress={()=>{router.push("signup")}}
            style={{marginTop: 15, alignItems: "center"}}
          >
            <Text style={{ color: "#FF8762" }}>
              <Text style={{ color: "#FFFFFF" }}>
                Don't have an account?{" "}
              </Text>
              Get started
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function createStyles(colors, fonts, width) {
  return StyleSheet.create({
    scrollContent: {
      alignItems: "center",
      flexGrow: 1,
      marginTop: 20
    },
    inputContainer:{
      width: width - 68,
      marginTop: 10,
    },
    labelText: {
      width: "100%",
      fontFamily: fonts.capLabel,
      fontSize: 12,
      color: "#E3E7DE",
      marginBottom: 8,
    },
    input:{
      width: "100%",
      height: 56,
      backgroundColor: "#1d201c",
      borderRadius: 12,
      fontFamily: fonts.title,
      fontSize: 16,
      color: "#E3E7DE",
      paddingHorizontal: 16,
      marginBottom: 10
    },

    buttonShadow: {
      height: 54,
      marginTop: 20,
      borderRadius: 16,
      ...Platform.select({
        ios: {
          shadowColor: '#FF8762',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 24,
        },
        android: {
          elevation: 8,
          shadowColor: '#FF8762',
        },
      }),
    },

    gradientBackground: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 16,
    },

    buttonText: {
      fontFamily: 'PlusJakartaSans-Bold', 
      fontSize: 18,
      fontWeight: '700',
      color: '#0d0f0c',
    },
  })
}