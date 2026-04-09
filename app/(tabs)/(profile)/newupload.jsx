import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

const backendURI = Constants.expoConfig.extra.backendURI;

export default function UploadScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [zoom, setZoom] = useState(0);
  const [facing, setFacing] = useState("back");
  const savedZoom = useRef(0);
  const isFocused = useIsFocused();
  const router = useRouter();

  if (!isFocused) {
    return <View />;
  }

  const pinchGesture = Gesture.Pinch()
    .runOnJS(true)
    .onStart(() => {
      savedZoom.current = zoom;
    })
    .onChange((e) => {
      let newZoom = savedZoom.current + (e.scale - 1) * 0.5;
      newZoom = Math.min(Math.max(newZoom, 0), 1);
      setZoom(newZoom);
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .runOnJS(true)
    .onEnd(() => {
      setFacing((prev) => (prev === "back" ? "front" : "back"));
    });

  const gestures = Gesture.Race(doubleTap, pinchGesture);

  const confirmPicture = async () => {
    try {
      const jwt = await AsyncStorage.getItem("jwt");
      const form = new FormData();
      form.append("frame", {
        uri: photo,
        name: "image.jpg",
        type: "image/jpeg",
      });

      const raw = await fetch(`${backendURI}/account/updateProfilePic`, {
        method: "PUT",
        body: form,
        headers: {
          Authorization: jwt,
        },
      });

      const response = await raw.json();
      console.log(response);

      if (response && response.url) {
        await AsyncStorage.setItem("avatarUrl", response.url);
      } else {
        await AsyncStorage.setItem("avatarUrl", photo);
      }

      router.back();
    } catch (error) {
      console.log("whoops", error);
    }
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const capturedPhoto = await cameraRef.current.takePictureAsync({
          quality: 1,
        });
        setPhoto(capturedPhoto.uri);
      } catch (error) {
        console.error("Error taking photo:", error);
      }
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const resetCamera = () => {
    setPhoto(null);
    setZoom(0);
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          We need your permission to use the camera.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (photo) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photo }} style={styles.profileImage} />
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={resetCamera} style={styles.actionButton}>
              <Text style={styles.actionText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmPicture} style={styles.actionButton}>
              <Text style={styles.actionTextBlue}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Pressable style={{
          position: "absolute",
          top: 20,
          left: 30,
          zIndex: 10,
          justifyContent: "center",
          alignItems: "center"
        }} onPress={()=>{router.back()}}>
          <Text style={{
            color: "white",
            fontSize: 30
          }}>←</Text>
        </Pressable>
        <StatusBar barStyle="light-content" />

        <GestureDetector gesture={gestures}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            zoom={zoom}
            animateShutter={true}
          />
        </GestureDetector>

        <View style={styles.controlsContainer} pointerEvents="box-none">
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={pickImageFromGallery}
            >
              <View style={styles.galleryIconPlaceholder} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.shutterOuter} onPress={takePhoto}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>

            <View style={styles.spacer} />
          </View>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  profileImage: {
    width: 250,
    height: 250,
    borderRadius: 125,
    alignSelf: "center",
    marginTop: 100,
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  actionButton: {
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 8,
  },
  actionText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
  actionTextBlue: {
    color: "#0A84FF",
    fontSize: 18,
    fontWeight: "bold",
  },
  controlsContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingBottom: 40,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "white",
  },
  galleryButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryIconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderWidth: 1.5,
    borderColor: "white",
  },
  spacer: {
    width: 50,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  permissionText: {
    color: "white",
    fontSize: 16,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#0A84FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});