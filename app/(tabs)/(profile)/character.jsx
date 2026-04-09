import { View, Text, Pressable, Image, StyleSheet, useColorScheme, TouchableOpacity, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Colors, person } from "../../../constants/Colors";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import nose from "../../../assets/nose.png"
import Fontisto from '@expo/vector-icons/Fontisto';
import AsyncStorage from "@react-native-async-storage/async-storage";
import AvatarComp from "../../(comp)/person";
import Constants from "expo-constants"

const backendURI = Constants.expoConfig.extra.backendURI

export default function CharacterScreen(){
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const styles = createStyles(colors);
    const router = useRouter()    
    const [attributes, setAttributes] = useState({
        skinColor: 0,
        ear: "big",
        hairColor: 0,
        hairStyle: 0,
        hatStyle: 0,
        hatColor: 0,
        eyeStyle: 0,
        glassesStyle: 0,
        noseStyle: 0,
        mouthStyle: 0,
        shirtStyle: 0,
        shirtColor: 0,
        bgColor: 0,
    })

    const incremenet = (value)=>{
        setAttributes((prev)=>{
            if(prev[value] < person[value].length - 1){
                return {
                    ...prev, 
                    [value] : prev[value] +1
                }
            }
            else{
                return({
                    ...prev,
                    [value] : 0
                })
            }
        })
    }

    const changes = async() =>{
        try {
            const jwt = await AsyncStorage.getItem("jwt")
            const profileString = await AsyncStorage.getItem("profile")
            let profile = await JSON.parse(profileString)
            profile.profile = attributes
            const stringed = JSON.stringify(profile)
            await AsyncStorage.setItem("profile", stringed)
            router.replace({pathname:"/"})
            
            const raw = await fetch(`${backendURI}/user/updateProfile`,{
                method: "PUT",
                headers:{
                    "Authorization": jwt,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(attributes)
            })
            // const response = await raw.json()

        } catch (error) {
            console.log(error)
        }
    }

    useEffect(()=>{
        const fetcher = async () => {
            try {
                const profilePicture = await AsyncStorage.getItem("profile")
                if(profilePicture){
                    const parsed = JSON.parse(profilePicture)
                    if(!parsed.profile){
                        throw Error("unable to parse")
                    }
                    setAttributes(parsed.profile)
                }
            } catch (error) {
                console.log(error)
            }
        }
        fetcher();
    }, [])

    return(
        <View style={styles.container}>
            <Pressable style={[styles.imgButton, {top: 10, left: 10}]} onPress={()=>{router.replace("/")}}>
                <Text style={{fontSize: 40, zIndex: 10, color: colors.textColor}}>←</Text>
            </Pressable>

            <Pressable style={[styles.imgButton, { bottom: 20, right: 25 }]} onPress={changes}>
                <Text style={{ fontSize: 50, zIndex: 10, color: colors.textColor }}>✓</Text>
            </Pressable>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
            <AvatarComp size={250} attributes={attributes}/>
            <View style={styles.horizontal}>
                <TouchableOpacity style={styles.item} onPress={()=>{incremenet("skinColor")}}>
                    <FontAwesome6 name="face-meh-blank" size={50} color={colors.textColor} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.item} onPress={()=>{incremenet("hairStyle")}}>
                    <MaterialCommunityIcons name="hair-dryer" size={50} color={colors.textColor} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.item} onPress={()=>{incremenet("hairColor")}}>
                    <Ionicons name="color-fill-sharp" size={50} color={colors.textColor} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.item} onPress={()=>{
                    incremenet("hatStyle")
                }}>
                    <FontAwesome5 name="redhat" size={50} color={colors.textColor} />
                </TouchableOpacity>

                {attributes["hatStyle"] != 0 && (<TouchableOpacity style={styles.item} onPress={()=>{incremenet("hatColor")}}>
                    <MaterialIcons name="colorize" size={50} color={colors.textColor} />
                </TouchableOpacity>)}
                
                <TouchableOpacity style={styles.item} onPress={()=>{incremenet("eyeStyle")}}>
                    <AntDesign name="eye" size={50} color={colors.textColor} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.item} onPress={()=>{incremenet("glassesStyle")}}>
                    <FontAwesome5 name="glasses" size={50} color={colors.textColor} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.item} onPress={()=>{incremenet("noseStyle")}}>
                    <Image style={{width: 50, height: 50, tintColor: colors.textColor}} source={nose}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.item} onPress={()=>{incremenet("mouthStyle")}}>
                    <Ionicons name="happy" size={50} color={colors.textColor} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.item} onPress={()=>{setAttributes((prev)=>{
                    return({
                        ...prev,
                        ear: prev.ear === "big"? "small": "big"
                    })
                })}}>
                    <FontAwesome name="hard-of-hearing" size={50} color={colors.textColor} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.item} onPress={()=>{incremenet("shirtStyle")}}>
                    <FontAwesome5 name="tshirt" size={50} color={colors.textColor} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.item} onPress={()=>{incremenet("shirtColor")}}>
                    <MaterialIcons name="color-lens" size={50} color={colors.textColor} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.item} onPress={()=>{incremenet("bgColor")}}>
                    <Fontisto name="picture" size={50} color={colors.textColor} />
                </TouchableOpacity>

            </View>
            </ScrollView>
        </View>
    )
}

function createStyles(colors) {
    return StyleSheet.create({
        imgButton:{
            position: 'absolute',
            zIndex: 6
        },
        scrollContainer: {
            marginTop:100,
            marginBottom: 20,
            alignItems: 'center',
            justifyContent: 'center',
        },
        container: {
            flex: 1,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
        },
        item:{
            margin: 10
        },
        horizontal:{
            width: '95%',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            gap: 4,
            marginBottom: 20
        }
    });
}