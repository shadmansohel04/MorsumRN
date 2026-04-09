import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { useState } from 'react';
import { Colors } from '../../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Constants from "expo-constants"

WebBrowser.maybeCompleteAuthSession();

const backendURI = Constants.expoConfig.extra.backendURI

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(colors);
  const router = useRouter();

  const CLIENT_ID = '258505425894-6bpi9hta29e58t1ee7bv44535en6sic7.apps.googleusercontent.com';
  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  };

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
      scopes: ['openid', 'profile', 'email'],
      responseType: 'id_token',
    },
    discovery
  );

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      alert('Please enter email and password');
      return;
    }
    try {
      setLoading(true);
      const raw = await fetch(`${backendURI}/user/loginAccount`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const res = await raw.json();
      if (res && res.token) {
        await AsyncStorage.setItem("jwt", res.token);
        return router.replace("../(tabs)");
      }
      throw new Error("Login failed");
    } catch (error) {
      console.log(error);
      alert("Login failed, please try again");
      setEmail("");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        locations={[0, 0.2, 0.7]}
        colors={[colors.background, colors.pop, colors.background]}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.title}>Morsum</Text>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Login</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={colors.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={colors.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                {!loading ? (
                  <>
                    <TouchableOpacity style={styles.button} onPress={handleLogin}>
                      <Text style={styles.buttonText}>Log In</Text>
                    </TouchableOpacity>

                    {/* <TouchableOpacity
                      style={[
                        styles.button,
                        { backgroundColor: 'white', borderColor: colors.textColor, borderWidth: 1, borderStyle: 'solid' },
                      ]}
                      onPress={() => promptAsync()}
                      disabled={!request}
                    >
                      <Text style={[styles.buttonText, { color: colors.pop }]}>Log In With Google</Text>
                    </TouchableOpacity> */}

                    <TouchableOpacity onPress={() => router.push("signup")}>
                      <Text style={{ color: colors.textColor, marginTop: 10 }}>Sign up</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <ActivityIndicator color={colors.pop} size={30} />
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </LinearGradient>
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 40,
    },
    title: {
      fontSize: 55,
      fontWeight: '100',
      color: 'white',
      marginTop: '15%',
      marginBottom: 20,
    },
    card: {
      width: '90%',
      backgroundColor: colors.background,
      padding: 30,
      borderRadius: 30,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    cardTitle: {
      color: colors.textColor,
      fontSize: 20,
      fontWeight: '300',
      marginBottom: 20,
      width: '100%',
      textAlign: 'left',
    },
    input: {
      width: '100%',
      padding: 12,
      marginBottom: 15,
      borderWidth: 1.5,
      borderColor: colors.textColor,
      borderRadius: 12,
      color: colors.textColor,
      backgroundColor: colors.fillColor || 'transparent',
    },
    button: {
      backgroundColor: colors.halfBackground,
      paddingVertical: 12,
      borderRadius: 12,
      width: '100%',
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 10,
    },
    buttonText: {
      color: colors.textColor,
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
}