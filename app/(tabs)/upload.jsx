import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  useColorScheme,
  Image,
  TextInput,
  ActivityIndicator,
  Pressable,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import placeholder from "../../assets/placeHolder.png";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import Constants from "expo-constants"

const foodMSUri = Constants.expoConfig.extra.foodMSUri
const GET_NAME_URL = `${foodMSUri}/detect`;

export default function uploadScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [placeHolderIMG, setPlaceHolderIMG] = useState(placeholder);
  const cameraRef = useRef(null);
  const [active, setActive] = useState(true);
  const [img, setImg] = useState(null);
  const router = useRouter();
  const [foodName, setName] = useState(null);
  const [nameLoading, setNameLoading] = useState(false);
  const [zoom, setZoom] = useState(0);
  const zoomInterval = useRef(null);

  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;
  const styles = createStyles(colors);

  useEffect(() => {
    async function fetcher() {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access media library is required!");
      } else {
        try {
          const newestImages = await MediaLibrary.getAssetsAsync({
            mediaType: "photo",
            first: 1,
          });

          if (newestImages.assets.length > 0) {
            const assetInfo = await MediaLibrary.getAssetInfoAsync(
              newestImages.assets[0].id
            );
            setPlaceHolderIMG({ uri: assetInfo.localUri || assetInfo.uri });
          }
        } catch (error) {
          console.log("Error loading placeholder image:", error);
        }
      }
    }
    fetcher();
  }, []);

  const getName = async (uri) => {
    setNameLoading(true);
    try {
      if (!uri) throw new Error("No image URI provided to getName");

      const fileInfo = await FileSystem.getInfoAsync(uri);
      const form = new FormData();
      form.append("frame", {
        uri: fileInfo.uri,
        name: "image.jpg",
        type: "image/jpeg",
      });

      const raw = await fetch(GET_NAME_URL, {
        method: "POST",
        body: form,
      });
      const response = await raw.json()

      if (!response.success) {
        throw new Error(`Name API returned ${response.status}`);
      }

      const detected =
        response?.class;

      if (detected && detected.trim().length > 0) {
        setName(detected.trim());
        return detected.trim();
      } else {
        setName("H");
        return "H";
      }
    } catch (error) {
      console.log("getName error:", error);
      setName("H");
      return "H";
    } finally {
      setNameLoading(false);
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const startZoomingIn = () => {
    if (zoomInterval.current) clearInterval(zoomInterval.current);
    zoomInterval.current = setInterval(() => {
      setZoom((prev) => {
        const next = prev + 0.01;
        return next < 1 ? next : 1;
      });
    }, 50);
  };

  const startZoomingOut = () => {
    if (zoomInterval.current) clearInterval(zoomInterval.current);
    zoomInterval.current = setInterval(() => {
      setZoom((prev) => {
        const next = prev - 0.01;
        return next > 0 ? next : 0;
      });
    }, 50);
  };

  const stopZooming = () => {
    if (zoomInterval.current) {
      clearInterval(zoomInterval.current);
      zoomInterval.current = null;
    }
  };

  async function takePhoto() {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setActive(false);
        await AsyncStorage.setItem("uploadImage", photo.uri);
        setImg(photo);
        await getName(photo.uri);
      } catch (error) {
        console.log("Error taking photo:", error);
        setActive(true);
        setImg(null);
        setName(null);
      }
    }
  }

  async function pickImage() {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const temp = result.assets[0];
        await AsyncStorage.setItem("uploadImage", temp.uri);
        setImg(temp);
        setActive(false);
        await getName(temp.uri);
      }
    } catch (error) {
      console.log("Error picking image:", error);
    }
  }

  const back = () => {
    setActive(true);
    setImg(null);
    setName(null);
    setNameLoading(false);
  };

  const acceptImg = () => {
    if (!foodName || foodName.trim() === "" || foodName === "H") {
      alert("Input Food Name");
      return;
    }
    AsyncStorage.setItem("foodName", foodName);
    router.push("../(comp)/ingredients");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <View style={styles.container}>
        <View style={styles.cameraWrapper}>
          {active ? (
            <>
              <Pressable
                style={[styles.zoomButton, { right: 20 }]}
                onPressIn={startZoomingIn}
                onPressOut={stopZooming}
              >
                <Text style={{ color: "black", fontSize: 22 }}>+</Text>
              </Pressable>

              <Pressable
                style={[styles.zoomButton, { right: 20, top: 70 }]}
                onPressIn={startZoomingOut}
                onPressOut={stopZooming}
              >
                <Text style={{ color: "black", fontSize: 22 }}>-</Text>
              </Pressable>

              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={"back"}
                animateShutter={true}
                flash={false}
                zoom={zoom}
              />
              <TouchableOpacity style={styles.button} onPress={takePhoto}>
                <View style={styles.photoClick} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.cameraRoll} onPress={pickImage}>
                <Image source={placeHolderIMG} style={{ width: "100%", height: "100%" }} />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.capturedContainer}>
              {nameLoading ? <ActivityIndicator style={styles.load} /> : null}
              {foodName !== null ? (
                <TextInput
                  style={styles.input}
                  onChangeText={(e) => {
                    setName(e);
                  }}
                  placeholderTextColor={colors.textColor}
                  placeholder={foodName === "H" ? "Enter Name" : foodName}
                  value={foodName === "H" ? "" : foodName}
                />
              ) : null}
              <View style={styles.captured}>
                <TouchableOpacity style={[styles.imgButton, { top: 20, left: 20 }]} onPress={back}>
                  <Text style={{ fontSize: 50, zIndex: 10, color: "white" }}>←</Text>
                </TouchableOpacity>

                {foodName !== null ? (
                  <TouchableOpacity style={[styles.imgButton, { bottom: 20, right: 25 }]} onPress={acceptImg}>
                    <Text style={{ fontSize: 50, zIndex: 10, color: "white" }}>✓</Text>
                  </TouchableOpacity>
                ) : null}
                <View style={{ borderRadius: 20, flex: 1, overflow: "hidden" }}>
                  {img ? <Image style={styles.image} source={{ uri: img.uri }} /> : null}
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    load: {
      position: "absolute",
      right: 10,
      top: 5,
      zIndex: 11,
    },
    capturedContainer: {
      flex: 1,
    },
    input: {
      width: "90%",
      alignSelf: "center",
      color: colors.textColor,
      fontSize: 16,
      paddingVertical: 8,
      paddingHorizontal: 5,
      borderBottomColor: colors.textColor,
      borderBottomWidth: 1.5,
      marginBottom: 10
    },
    cameraRoll: {
      position: "absolute",
      bottom: 30,
      right: 20,
      width: 50,
      height: 50,
    },
    imgButton: {
      position: "absolute",
      zIndex: 6,
    },
    image: {
      flex: 1,
      width: "100%",
      height: "100%",
      zIndex: 3,
    },
    captured: {
      flex: 1,
      position: "relative",
    },
    photoClick: {
      width: "100%",
      height: "100%",
      backgroundColor: "white",
    },
    cameraWrapper: {
      flex: 1,
      borderRadius: 20,
      overflow: "hidden",
    },
    container: {
      flex: 1,
      justifyContent: "center",
      padding: 20,
      paddingTop: 30,
      paddingBottom: 40,
      backgroundColor: colors.background,
      position: "relative",
    },
    message: {
      textAlign: "center",
      paddingBottom: 10,
    },
    camera: {
      flex: 1,
    },
    buttonContainer: {
      flex: 1,
      flexDirection: "row",
      backgroundColor: "transparent",
      margin: 64,
    },
    button: {
      position: "absolute",
      bottom: 30,
      left: "50%",
      transform: [{ translateX: -35 }],
      width: 70,
      height: 70,
      borderRadius: 35,
      overflow: "hidden",
    },
    zoomButton: {
      position: "absolute",
      top: 20,
      zIndex: 100,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: "white",
      justifyContent: "center",
      alignItems: "center",
    },
  });
}