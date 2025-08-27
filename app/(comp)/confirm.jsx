import { useEffect, useState } from "react";
import { Image, Text, View, TouchableOpacity, ScrollView, StyleSheet, useColorScheme, ActivityIndicator } from "react-native";
import { Colors } from "../../constants/Colors";
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from 'expo-file-system';
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants"

const backendURI = Constants.expoConfig.extra.backendURI

export default function Ingredients() {
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const styles = createStyles(colors);
    const [ingredients, setIngredients] = useState([]);
    const [steps, setSteps] = useState([]);
    const [img, setIMG] = useState(null);
    const [loading, setLoading] = useState(false);
    const [foodName, setFoodname] = useState("")
    const router = useRouter()

    const upload = async () => {
        if (!img) return;
        setLoading(true);
        try {
            const newIng = ingredients.map((each)=>{
                return `${each.quantity} ${each.unit} of ${each.name}`
            })
            const jwt = await AsyncStorage.getItem("jwt")
            const fileInfo = await FileSystem.getInfoAsync(img);
            const form = new FormData();
            const bodyLike = {
                recipeName: foodName,
                ingredients: newIng,
                steps: steps
            }

            form.append("frame", {
                uri: fileInfo.uri,
                name: "image.jpg",
                type: "image/jpeg"
            });
            form.append("body", JSON.stringify(bodyLike))            
            const response = await fetch(`${backendURI}/recipe/uploadRecipe`, {
                method: "POST",
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": jwt
                },
                body: form,
            });

            const result = await response.json();
            console.log(result)
            if(result && result.success == true){
                return router.replace("/(tabs)")
            }
            throw Error("Failed to upload")
        } catch (error) {
            console.error("Upload error:", error);
            return router.replace("/")
        }
    };

    useEffect(() => {
        const fetch = async () => {
            try {
                const image = await AsyncStorage.getItem("uploadImage");
                const stepsString = await AsyncStorage.getItem("steps");
                const ingredientsString = await AsyncStorage.getItem("ingredients");
                const nameFood = await AsyncStorage.getItem("foodName")

                setFoodname(nameFood)
                setIMG(image);
                setIngredients(JSON.parse(ingredientsString));
                setSteps(JSON.parse(stepsString));
            } catch (error) {
                console.log(error);
            }
        };
        fetch();
    }, []);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.pop} />
                <Text style={{ color: colors.textColor, marginTop: 10 }}>Uploading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Confirmation</Text>
                <TouchableOpacity
                    onPress={() => router.replace("./steps")}
                    style={{position: 'absolute', top: 20, left: 20}}
                >
                <Ionicons name="chevron-back" size={28} color={colors.textColor} />
            </TouchableOpacity>

            <View style={styles.horView}>
                <ScrollView style={[styles.list, { flex: 1 }]}>
                    <Text style={styles.subTitle}>Ingredients</Text>
                    {ingredients.map((item, index) => (
                        <Text key={index} style={styles.itemText}>
                            - {item.name}
                        </Text>
                    ))}
                </ScrollView>
                <ScrollView style={[styles.list, { flex: 1.5 }]}>
                    <Text style={styles.subTitle}>Steps</Text>
                    {steps.map((item, index) => (
                        <Text key={index} style={styles.itemText}>
                            {index + 1}. {item}
                        </Text>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.imageContainer}>
                <Image style={styles.image} source={{ uri: img }} />
            </View>
            <TouchableOpacity style={styles.button} onPress={upload}>
                <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
        </View>
    );
}

function createStyles(colors) {
    return StyleSheet.create({
        image: {
            width: '100%',
            height: '100%'
        },
        imageContainer: {
            height: '40%',
            backgroundColor: colors.fillColor,
            borderRadius: 20,
            overflow: 'hidden',
            marginBottom: 25
        },
        subTitle: {
            fontSize: 20,
            textAlign: 'center',
            fontWeight: '500',
            color: colors.textColor,
            marginBottom: 15
        },
        list: {
            padding: 10,
            backgroundColor: colors.fillColor,
            borderRadius: 20
        },
        horView: {
            flexDirection: 'row',
            gap: 20,
            height: '35%',
            marginBottom: 30
        },
        container: {
            padding: 20,
            flex: 1,
            backgroundColor: colors.background
        },
        heading: {
            fontSize: 30,
            fontWeight: "bold",
            marginBottom: 25,
            color: colors.textColor,
            textAlign: 'right'
        },
        button: {
            backgroundColor: colors.pop,
            padding: 10,
            borderRadius: 6,
            alignItems: "center",
            marginBottom: 20
        },
        buttonText: {
            color: colors.textColor,
            fontWeight: "bold",
            fontSize: 20
        },
        itemText: {
            fontSize: 18,
            color: colors.textColor,
            fontWeight: '200'
        }
    });
}
