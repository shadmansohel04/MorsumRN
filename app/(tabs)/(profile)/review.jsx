import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { Colors } from "../../../constants/Colors";
import Constants from "expo-constants"

const backendURI = Constants.expoConfig.extra.backendURI
const UP = `${backendURI}/user/uploadAttempt`

export default function ReviewPage() {
    const data = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);
    const router = useRouter();
    const [loading, setLoading] = useState(false)
    const colors = colorScheme === "dark" ? Colors.dark : Colors.light;
    const styles = createStyles(colors);

    const [upload, setUpluad] = useState(false);
    const [uri, setUri] = useState(null);
    const [rating, setRating] = useState({
        taste: 1,
        accuracy: 1,
        ease: 1
    });

    async function takePhoto() {
        try {
            if (cameraRef.current) {
                const photo = await cameraRef.current.takePictureAsync();
                setUri(photo.uri);
                setUpluad(false)
            }
        } catch (error) {
            console.log("Error taking photo:", error);
        }
    }

    const stars = (attr) => {
        return [1, 2, 3, 4, 5].map((star) => (
            <Pressable key={star} onPress={() => setRating((prev) => ({ ...prev, [attr]: star }))}>
                <Text style={[styles.star, rating[attr] >= star ? styles.filled : styles.empty]}>★</Text>
            </Pressable>
        ));
    };

    const complete = async()=>{
        setLoading(true);
        try {
            const form = new FormData();
            const bodyLike = {
                recipeID: data.recipeID,
                taste: rating.taste,
                accuracy: rating.accuracy,
                ease: rating.ease
            }

            if(uri != null){
                const fileInfo = await FileSystem.getInfoAsync(uri);

                form.append("frame", {
                    uri: fileInfo.uri,
                    name: "image.jpg",
                    type: "image/jpeg"
                });
            }

            form.append("body", JSON.stringify(bodyLike))

            const jwt = await AsyncStorage.getItem("jwt");

            const response = await fetch(UP, {
                method: "POST",
                headers: {
                    "Authorization": jwt
                },
                body: form
            });

            const result = await response.json();
            console.log(result)
            if(result.success == true){
                return router.back()
            }
            else{
                alert("Didn't work please try again later");
                console.log(result.error)
                setLoading(false);
            }

        } 
        catch (error) {
            console.log(error)
            setLoading(false);
            router.back()
        }
    }

    if(loading){
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.pop} />
                <Text style={{ color: colors.textColor, marginTop: 10 }}>Uploading...</Text>
            </View>
        );
    }

    else if (upload) {
        if (!permission) return <View />;
        if (!permission.granted) {
            return (
                <View style={styles.container}>
                    <Text style={styles.message}>We need your permission to show the camera</Text>
                    <Button onPress={requestPermission} title="Grant Permission" />
                </View>
            );
        }

        return (
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <View style={styles.cameraWrapper}>
                    <CameraView
                        ref={cameraRef}
                        style={StyleSheet.absoluteFill}
                        facing="back"
                        enableTorch={false}
                        photo={true}
                    />

                    <TouchableOpacity style={[styles.imgButton, { top: 20, left: 20 }]} onPress={() => setUpluad(false)}>
                        <Text style={{ fontSize: 50, zIndex: 10, color: 'white' }}>←</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={takePhoto}>
                        <View style={styles.photoClick} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>How was it?</Text>
            <Text style={styles.header}>{data.recipeName}</Text>
            <View style={{ flexDirection: 'row', width: "90%", height: "30%", columnGap: 10, justifyContent: 'center' }}>
                <Image style={styles.image} source={{ uri: data.imgurl }} />
                {uri != null ? <Image style={styles.image} source={{ uri }} /> : null}
            </View>

            <Text style={styles.attr}>Taste</Text>
            <View style={styles.starContainer}>{stars("taste")}</View>

            <Text style={styles.attr}>Accuracy</Text>
            <View style={styles.starContainer}>{stars("accuracy")}</View>

            <Text style={styles.attr}>Ease</Text>
            <View style={styles.starContainer}>{stars("ease")}</View>

            <Pressable onPress={() => setUpluad(true)} style={[styles.imgButton, { bottom: 20 }]}>
                <Text style={styles.text}>Upload yours?</Text>
            </Pressable>

            <TouchableOpacity onPress={complete} style={[styles.imgButton, { bottom: 20, right: 25 }]}>
                <Text style={{ fontSize: 50, zIndex: 10, color: colors.textColor }}>✓</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.imgButton, { top: 20, left: 20 }]} onPress={() => router.back()}>
                <Text style={{ fontSize: 30, zIndex: 10, color: colors.textColor }}>←</Text>
            </TouchableOpacity>
        </View>
    );
}

function createStyles(colors) {
    return StyleSheet.create({
        photoClick: {
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
        },
        button: {
            position: 'absolute',
            bottom: 30,
            left: '50%',
            transform: [{ translateX: -35 }],
            width: 70,
            height: 70,
            borderRadius: 35,
            overflow: 'hidden',
        },
        cameraWrapper: {
            flex: 1,
            borderRadius: 20,
            overflow: 'hidden',
        },
        message: {
            textAlign: 'center',
            paddingBottom: 10,
        },
        imgButton: {
            position: 'absolute',
            zIndex: 6,
        },
        attr: {
            color: colors.textColor,
            fontSize: 25,
            fontWeight: '100',
        },
        container: {
            flex: 1,
            padding: 20,
            backgroundColor: colors.background,
            alignItems: "center",
        },
        text: {
            color: colors.textColor,
            fontSize: 20,
            marginBottom: 10,
            fontWeight: "600",
        },
        header: {
            color: colors.textColor,
            fontSize: 28,
            fontWeight: "bold",
            marginBottom: 20,
            textAlign: "center",
        },
        image: {
            width: '45%',
            borderRadius: 20,
            marginBottom: 15,
        },
        starContainer: {
            flexDirection: "row",
            justifyContent: "center",
            paddingVertical: 5,
            marginBottom: 10,
        },
        star: {
            fontSize: 36,
            marginHorizontal: 10,
        },
        filled: {
            color: "gold",
        },
        empty: {
            color: "#ccc",
        },
    });
}
