import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from "react";
import { Dimensions, ActivityIndicator, Animated, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";
import MapView, { Callout, Marker } from 'react-native-maps';
import AvatarComp from "../(comp)/person";
import { Colors } from "../../constants/Colors";
import {deleteLocation} from "../../constants/func"
import { Image } from 'expo-image';

import Constants from "expo-constants"

const backendURI = Constants.expoConfig.extra.backendURI

export default function MapScreen(){    
    const { width } = Dimensions.get('window');

    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const styles = createStyles(colors);

    const mapRef = useRef(null)
    const [location, setLocation] = useState(null)
    const [freinds, setFreinds] = useState([])
    const [loading, setLoad] = useState(true)
    const [filter, setFilter] = useState("")
    const [selected, setSelected] = useState(null)
    const markRefs = useRef({})

    const slideAnim = useRef(new Animated.Value(1500)).current;
    const likeAnim = useRef(new Animated.Value(100)).current;
    const router = useRouter()
    const [update, setUpdate] = useState(false)

    // I HAVE BOOL LOGIC FOR NOW BUT MAY NOT NEED
    const toggleLike = (index) => {
        if(!freinds[index].imgurl.endsWith("null")){
            Animated.timing(likeAnim, {
                toValue: -width/2.6,       
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                setTimeout(() => {
                Animated.timing(likeAnim, {
                    toValue: 100,
                    duration: 500,
                    useNativeDriver: true,
                }).start();
                }, 7000);
            });
        }
        else{
            Animated.timing(likeAnim, {
                toValue: 100,        
                duration: 500,
                useNativeDriver: true,
            }).start()
        }

    };

    const toggleScrollView = (bool) => {
        const toVal = bool ? 0: 1500;
        Animated.timing(slideAnim, {
            toValue: toVal,
            duration: 500,
            useNativeDriver: true,
            }).start();
    };

    const selectPerson = (id)=>{
        const targetRegion = {
            latitude: id.latitude? id.latitude + 0.025: -15.0000 + 0.025,
            longitude: id.longitude? id.longitude: -140.0000,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        };

        Keyboard.dismiss();
        toggleScrollView(false);
        mapRef.current.animateToRegion(targetRegion, 1000);
        setSelected(id)

        setTimeout(() => {
            const marker = markRefs.current[id.username]
            if(marker){
                marker.showCallout();
            }
        }, 1200);
        
    }

    const addToLike = async() =>{
        // return
        try {
            const jwt = await AsyncStorage.getItem("jwt")
            await fetch(`${backendURI}/recipe/swipeUpdate`,{
                method: "PUT",
                headers:{
                    "Authorization": jwt,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    swipes: [
                        {
                            recipeID: selected.recipeID,
                            action: "like"
                        }
                    ]
                })

            })
        } catch (error) {
            console.log(error)
        }
        finally{
            alert("Liked!")
        }
    }

    const stars = (value) => {
        return [1, 2, 3, 4, 5].map((star) => (
            <View key={star}>
                <Text style={[styles.star, value >= star ? styles.filled : styles.empty]}>★</Text>
            </View>
        ));
    };

    const getFreinds = async()=>{
        setLoad(true)
        const jwt = await AsyncStorage.getItem("jwt")
        const freindRaw = await fetch(`${backendURI}/user/getFreinds`, {
            method: "GET",
            headers:{
                "Authorization": jwt,
                "Content-Type": "application/json"
            }
        })

        const freinds = await freindRaw.json()

        if(freinds && freinds.success){
            setFreinds(freinds.freinds)
            setLoad(false)
        }
        else if(freinds.message = "Failed Auth"){
            return router.replace("")
        }
        else{
            setLoad(false)
        }
    }

    const updateLocation = async()=>{
        try {
            const jwt = await AsyncStorage.getItem("jwt")
            const raw = await fetch(`${backendURI}/user/updateLocation`, {
                method: "PUT",
                headers: {
                    "Authorization": jwt,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    longitude: location?.coords.longitude,
                    latitude: location?.coords.latitude
                })
            })
            const response = await raw.json()
        } 
        catch (error) {
            console.log(error)
        }
    }

    const getCurrentLocation = async() => {
        setLoad(true)
        let location1;
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            alert("Location is required for map")
            setLoad(false)
            return;
        }
        try {
            location1 = await Location.getCurrentPositionAsync({});
            setLocation(location1);
            setLoad(false)
        } catch (error) {
            console.log(error)
            setLoad(false)
        }
    }
    
    const runner = ()=>{
        setLoad(true);
        getCurrentLocation();
        getFreinds();
        loader();
    }

    const loader = async()=>{
        try {
            const shown = await AsyncStorage.getItem("update")
            if(shown && shown == 'true'){
                setUpdate(true)
                updateLocation()
            }
        } catch (error) {
            console.log(error)
            setUpdate(false)
        }
    }
    
    useEffect(() => {
        runner()
    }, []);

    if(loading){
        return(
            <View style={styles.container}>
                <ActivityIndicator color={colors.pop}/>
            </View>
        )
    }

    return(
        <View style={styles.container}>
            <TouchableOpacity style={{position: 'absolute', zIndex: 2, left: 20, top: 20}}
                onPress={()=>{
                    runner()
                }}
            >
                <FontAwesome name="refresh" size={30} color="white" style={{
                    padding: 15
                }} />
            </TouchableOpacity>

            <TouchableOpacity style={{position: 'absolute', zIndex: 2, right: 20, top: 20}}
                onPress={()=>{
                    if(!update == true){
                        alert("Updating Location!")
                        updateLocation()
                    }
                    else{
                        deleteLocation()
                    }
                    const toString = `${!update}`
                    AsyncStorage.setItem("update", toString)
                    setUpdate((prev)=> !prev)
                }}
            >
                <FontAwesome name="location-arrow" size={30} color={update? 'rgba(0, 255, 72, 1)': 'red'} style={{
                    padding: 15
                }} />
            </TouchableOpacity>

            <Animated.View
                style={[styles.likeBtn, {transform:[{translateX: likeAnim}]}]}
            >
                <Pressable
                    onPress={addToLike}
                >
                    <Text style={{color: 'white', fontSize: 20, fontWeight: 200}}>Like</Text>
                </Pressable>
            </Animated.View>
            <Animated.View
                style={[styles.scrollViewContainer, {transform:[{translateY: slideAnim}]}]}
            >
                <Pressable 
                    onPress={()=>{
                        toggleScrollView(false)
                        Keyboard.dismiss()
                    }}
                    style={{paddingRight: 30, paddingLeft: 30, paddingBottom: 30}}
                >
                    <Entypo name="chevron-down" size={24} color={colors.textColor}/>
                </Pressable>
                <TextInput 
                    placeholder='Search' 
                    style={{color:colors.textColor, width: '90%', marginBottom: 30, borderColor: colors.textColor, borderWidth: 2, fontSize: 18, backgroundColor: colors.fillColor, padding: 15, borderRadius: 20}}
                    placeholderTextColor={colors.textColor}
                    onChangeText={(text)=>{setFilter(text)}}
                    autoCapitalize='none'
                />

                <ScrollView
                    style={{width: '90%'}}
                    contentContainerStyle={[styles.freindsSearch, {paddingBottom: 300, alignItems: 'center'}]}
                >
                {freinds
                    .filter((each) => each.username.includes(filter))
                    .map((each, index)=>{
                        return(
                            <Pressable
                                style={{width: '100%', marginBottom: 10}}
                                key={index}
                                onPress={()=>{
                                    selectPerson(each)
                                    toggleLike(index)
                                }}
                            >
                                <View style={styles.currentFreind}>
                                    <AvatarComp size={50} attributes={each.profile} streak={each.streak}/>
                                    <Text style={{fontWeight: 300, color: 'white', padding: 15, backgroundColor: 'rgba(39, 14, 179, 0.4)', borderRadius: 20}}>{each.username}</Text>
                                    <FontAwesome name="location-arrow" size={20} color={each.latitude && each.longitude? 'rgba(0, 255, 72, 1)': 'rgb(159, 11, 11)'} style={{
                                        padding: 15
                                    }} />
                                </View>
                            </Pressable>
                        )
                    })
                }

                </ScrollView>
            </Animated.View>
            
            <ScrollView
                horizontal={true}
                style={styles.scroll}
                contentContainerStyle={{alignItems: 'center', gap: 20}}
                
            >
                <TouchableOpacity onPress={()=>{toggleScrollView(true)}}>
                    <FontAwesome5 name="search"  size={35} color="white" />
                </TouchableOpacity>

                {freinds.map((each, index)=>{
                    return (
                        <Pressable key={index} onPress={()=>{
                            selectPerson(each)
                            toggleLike(index)
                        }}>
                            <AvatarComp size={50} attributes={each.profile} streak={each.streak}/>
                        </Pressable>
                    )
                })}
            </ScrollView>

            <MapView
                style={styles.map}
                showsUserLocation={true}
                showsMyLocationButton={true}
                zoomControlEnabled={true}
                zoomEnabled={true}
                showsCompass={true}
                initialRegion={{
                    latitude: location?.coords?.latitude || 37.78825,
                    longitude: location?.coords?.longitude || -122.4324,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                }}
                showsScale={true}
                loadingEnabled={true}
                loadingIndicatorColor={colors.pop}
                loadingBackgroundColor={colors.background}
                moveOnMarkerPress={false}
                ref={mapRef}
            >

                {freinds.map((each, index)=>{
                    return(
                        <Marker
                            ref={(ref) => markRefs.current[each.username] = ref}
                            key={index}
                            coordinate={{
                                latitude: each.latitude? each.latitude: -15.0000,
                                longitude: each.longitude? each.longitude: -140.0000,
                            }}
                        >
                            {each.latitude && each.longitude? 
                            <View
                                onPress={()=>{
                                    selectPerson(each)
                                    toggleLike(index)
                                }}
                            >
                                <AvatarComp size={50} attributes={each.profile} streak={each.streak}/>
                            </View>:
                            <Text style={{color: 'white'}}>No location found</Text>}
                            
                            <Callout
                                style={styles.callout}
                                onPress={()=>{
                                    const userRef = markRefs.current[each.username]
                                    userRef?.hideCallout()
                                }}
                            >
                            <View style={styles.callout}>
                                <Text style={styles.calloutUsername}>{each.username}</Text>
                                <View
                                    style={{flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'}}
                                >
                                    <View style={styles.recentCard}>
                                        <Text style={styles.recipeTitle}>{each.recipename}</Text>

                                        {(!each.attemptimg.endsWith("null"))?(
                                            <>
                                            <View style={styles.imageRow}>
                                                <Image
                                                    contentFit="cover"
                                                    style={[styles.attemptIMG, {
                                                        width: each.imgurl != each.attemptimg? 130: 250,
                                                        height: each.imgurl != each.attemptimg? 200: 330
                                                    }]}
                                                    source={{ uri: each.imgurl }}
                                                    cachePolicy={"memory-disk"}
                                                />
                                                
                                                {(!each.attemptimg.endsWith("default") && (each.attemptimg != each.imgurl))?(
                                                    <>
                                                        <Text style={styles.arrow}>→</Text>
                                                        <Image
                                                            resizeMode="cover"
                                                            style={styles.attemptIMG}
                                                            source={{ uri: each.attemptimg }}
                                                        />
                                                    </>
                                                ):(null)}
                                            </View>
                                            {(each.imgurl != each.attemptimg) && each.taste && each.accuracy && each.ease &&(
                                                <View style={{marginTop: 20, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '85%'}}> 
                                                    <View style={{alignItems: 'center'}}>
                                                        <Text style={styles.attr}>Taste</Text>
                                                        <View style={styles.starContainer}>{stars(each.taste)}</View>

                                                        <Text style={styles.attr}>Accuracy</Text>
                                                        <View style={styles.starContainer}>{stars(each.accuracy)}</View>

                                                        <Text style={styles.attr}>Ease</Text>
                                                        <View style={styles.starContainer}>{stars(each.ease)}</View>
                                                    </View>
                                                </View>
                                            )}
                                            </>
                                        ):(
                                            <Text>Nothing here</Text>
                                        )}

                                    </View>
                                </View>
                            </View>
                            </Callout>

                        </Marker>
                    )
                })}

            </MapView>

        </View>
    )
}

function createStyles(colors) {
  return(
    StyleSheet.create({
        starContainer: {
            flexDirection: "row",
            justifyContent: "center",
            paddingVertical: 5,
            marginBottom: 10,
        },
        attr: {
            color: "black",
            fontSize: 15,
            fontWeight: 500,
        },
        star: {
            fontSize: 20,
            marginHorizontal: 3,
        },
        recentCard: {
            borderRadius: 12,
            alignItems: 'center',
            width: 350,
            justifyContent: 'flex-start'
        },
        recipeTitle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: 'black',
            marginBottom: 6,
            textAlign: 'center',
        },
        imageRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        arrow: {
            fontSize: 25,
            color: 'black',
            marginHorizontal: 8,
        },
        likeBtn: {
            position: 'absolute',
            top: 20,
            right: 15,
            zIndex: 10,
            backgroundColor: 'rgb(13, 132, 53)',
            borderRadius: 20,
            padding: 14,
            justifyContent: 'center',
            alignItems: 'center',
        },
        calloutUsername: {
            fontWeight: 300,
            fontSize: 20,
            color: 'black',
            marginBottom: 8,
        },
        attemptIMG: {
            height: 200,
            width: 130,
            borderRadius: 8,
        },
        currentFreind:{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.pop,
            padding: 5,
            borderRadius: 20
        },
        freindsSearch:{
            alignItems: 'flex-start',  
        },
        callout:{
            width: 350,
            height: 500,
            backgroundColor: 'transparent',
            justifyContent: 'center',
            alignItems: 'center'
        },
        text:{
            color: colors.textColor
        },
        scroll:{
            position: 'absolute',
            bottom: 0,
            width: 50,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            paddingLeft: 20,
            zIndex: 3,
            height: 75,
            width: '100%',
            borderTopLeftRadius: 14,
            borderTopRightRadius: 14,
        },
        container: {
            flex: 1,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
        },
          map: {
            width: '100%',
            height: '100%',
            zIndex: 1
        },
        scrollViewContainer: {
            position: 'absolute',
            bottom: 0,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: 10,
            zIndex:5,
            height: '90%',
            left: 0,
            right: 0,
            backgroundColor: colors.background,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
        },
        filled: {
            color: "rgb(216, 189, 34)"
        },
        empty: {
            color: "rgb(112, 104, 104)",
        },
    })
  )
}