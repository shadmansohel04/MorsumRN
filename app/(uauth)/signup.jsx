import { 
  Pressable, 
  KeyboardAvoidingView, 
  ScrollView,
  useColorScheme,
  StyleSheet,
  View,
  Image,
  Text,
  Platform,
  useWindowDimensions,
  TextInput,
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { theme } from "../../constants/Colors";
import newLogo from "../../assets/images/newLogo.png";
import Constants from "expo-constants";
const backendURI = Constants.expoConfig.extra.backendURI;

export default function SignUpScreen() {
  const [username, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? theme.dark : theme.dark; // Inherited from your LoginScreen logic
  const fonts = theme.font;
  const { width: screenWidth } = useWindowDimensions();
  const router = useRouter();
  const styles = createStyles(colors, fonts, screenWidth);

  const isValidEmail = (v) => /\S+@\S+\.\S+/.test(v);
  
  const validate = () => {
    if (!username.trim()) return 'Please enter a username';
    if (!email.trim() || !isValidEmail(email)) return 'Please enter a valid email';
    if (!password) return 'Please enter a password';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return null;
  };

  const handleSignUp = async () => {
    const error = validate();
    if (error) {
      Alert.alert('Invalid Input', error);
      return;
    }

    try {
      setLoading(true);
      const raw = await fetch(`${backendURI}/account/createAccount`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          username: username.trim()
        }),
      });

      const res = await raw.json();
      if (res && res.success) {
        return router.back();
      }
      throw new Error('Signup failed');
    } catch (e) {
      console.log(e);
      Alert.alert('Sign Up Failed', 'Please try again.');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return(
    <KeyboardAvoidingView
      style={{ flex: 1, width: '100%', backgroundColor: colors.background}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
          <Text style={{marginBottom: 15, color: colors.boldText, fontWeight: '700', fontSize: 22, fontFamily: fonts.title}}>Join the table</Text>
          <Text style={{textAlign: "center", width: 280, color: colors.subtleText, fontWeight: '400', fontSize: 17, fontFamily: fonts.subText}}>
            Create an account to start sharing your daily morsels with those who matter.
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.labelText}>USERNAME</Text>
            <TextInput 
              style={styles.input} 
              placeholder='johnsmith' 
              placeholderTextColor={"rgba(227, 231, 222, 0.3)"}
              value={username}
              onChangeText={setUserName}
              autoCapitalize="none"
            />

            <Text style={styles.labelText}>EMAIL</Text>
            <TextInput 
              style={styles.input} 
              placeholder='johnSmith@morsum.com' 
              placeholderTextColor={"rgba(227, 231, 222, 0.3)"}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <Text style={styles.labelText}>PASSWORD</Text>
            <TextInput 
              style={styles.input} 
              placeholder='********' 
              placeholderTextColor={"rgba(227, 231, 222, 0.3)"} 
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
            />
            
            <Pressable style={styles.buttonShadow} onPress={handleSignUp} disabled={loading}>
              <LinearGradient
                colors={['#FF8762', '#FE6F42']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBackground}
              >
                {loading ? (
                  <ActivityIndicator color="#0d0f0c" />
                ) : (
                  <Text style={styles.buttonText}>Sign Up</Text>
                )}
              </LinearGradient>
            </Pressable>
            
            <Pressable
              onPress={()=>{router.back()}}
              style={{marginTop: 15, alignItems: "center"}}
            >
              <Text style={{ color: "#FF8762" }}>
                <Text style={{ color: "#FFFFFF" }}>
                  Already have an account?{" "}
                </Text>
                Log in
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

function createStyles(colors, fonts, width) {
  return StyleSheet.create({
    scrollContent: {
      alignItems: "center",
      flexGrow: 1,
      marginTop: 20,
      paddingBottom: 40
    },
    inputContainer:{
      width: width - 68,
      marginTop: 40,
    },
    labelText: {
      width: "100%",
      fontFamily: fonts?.capLabel,
      fontSize: 12,
      color: "#E3E7DE",
      marginBottom: 8,
    },
    input:{
      width: "100%",
      height: 56,
      backgroundColor: "#1d201c",
      borderRadius: 12,
      fontFamily: fonts?.title,
      fontSize: 16,
      color: "#E3E7DE",
      paddingHorizontal: 16,
      marginBottom: 20
    },
    buttonShadow: {
      height: 54,
      marginTop: 10,
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