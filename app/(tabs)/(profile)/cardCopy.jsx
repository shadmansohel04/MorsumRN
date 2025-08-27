import Entypo from '@expo/vector-icons/Entypo';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";
import { Colors } from "../../../constants/Colors";
import RecipeCard from "../../(comp)/recipeCard";
import Constants from "expo-constants"

const backendURI = Constants.expoConfig.extra.backendURI

export default function oneCard(){
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const styles = createStyles(colors);
    const { data } = useLocalSearchParams();
    const [item, setItem] = useState(null)
    const router = useRouter();

    useEffect(()=>{
        if(data){
            const parsed = JSON.parse(data)
            setItem(parsed)
        }

    }, [])

    const deleter = async()=>{
        try {
            const url = `${backendURI}/profile/deleteLiked`
            const jwt = await AsyncStorage.getItem("jwt")
            const response = await axios.delete(url,{
                data:{
                    recipeID: item.recipeID
                },
                headers:{
                    Authorization: jwt
                }
            })
        }
        catch (error) {
            console.log(error)
            alert("Failed to remove, please try again later")
        }
        router.back()
    }

    if(item == null){
        return(
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading Recipe...</Text>
                <ActivityIndicator size="large" color="#4B9CD3" style={styles.spinner} />
            </View>
        )
    }

    return(
        <View style={styles.container}>
            <Pressable style={[styles.imgButton, {top: 10, left: 10}]} onPress={()=>{router.back()}}>
                <Text style={{fontSize: 40, zIndex: 10, color: colors.textColor}}>←</Text>
            </Pressable>
            <RecipeCard user={item}/>


                <View style={styles.bottom}>
                    {!item.liked ? (
                        <Pressable 
                            style={styles.button}
                            onPress={deleter}
                        >
                            <Entypo name="circle-with-cross" size={60} color="red" />
                        </Pressable>
                    ):(
                        <Text style={{
                            color: colors.textColor,
                            fontSize: 28,
                            fontWeight: 100,
                            textAlignVertical: 'center',
                            textDecorationLine: 'underline',                            
                            textDecorationColor: colors.pop,
                        }}>{item.liked}</Text>
                    )}
                </View>


        </View>
    )
}

function createStyles(colors) {
    return StyleSheet.create({
        imgButton:{
            position: 'absolute',
            zIndex: 6
        },
        button:{
            width: 60,
            height: 60,
            justifyContent: 'center',
            alignItems: 'center'
        },
        bottom:{
            width: '100%',
            height: '10%',
            marginTop: '4%',
            flexDirection: 'row',
            justifyContent: 'center'
        },
        image:{
            width: '100%',
            height: '100%',
            resizeMode: 'cover'
        },
        imageWrapper:{
            height: '95%',
            width: '100%',
            borderRadius: 30,
            overflow: 'hidden'
        },
        loadingText: {
            fontSize: 20,
            fontWeight: '600',
            marginBottom: 16,
            color: 'white',
        },
        spinner: {
            padding: 10,
        },
        container: {
            flex: 1,
            paddingTop: '18%',
            padding: '4%',
            backgroundColor: colors.background,
            paddingBottom: '4%',
            justifyContent: 'space-around'
        },
    });
}