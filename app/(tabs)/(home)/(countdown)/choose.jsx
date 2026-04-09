import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";
import { Image, ImageBackground } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
const backendURI = Constants.expoConfig.extra.backendURI

const { width } = Dimensions.get('window');

const THEME = {
  bg: "#0d0f0c",
  accent: "#FF8762",
  accentGreen: "#7EDC84",
  surface: "#141612",
  bottom: "#1d201c",
  text: "#FFFFFF",
  textSoft: "#E3E7DE",
};

const DUMMY_SHOTS = [
  {imgurl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'},
  {imgurl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38'},
  {imgurl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591'},
  {imgurl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd'},
  {imgurl: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856'},
  {imgurl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad'},
];

// HAVE SOME SORT OF FLAG HERE, IF DATE != TD THEN DO A LOADER AND PULL NEW STUFF, ELSE SHOW CACHED (IDK WHAT THIS MEANS)
// FOR THE REFRESH JUST DO A GET REQUEST WITH TOKEN, FIND ALL POSTS WITH CREATED AT DATE AS THE CURRENT DAY

export default function ChangeSpotlightScreen() {
  const router = useRouter()
  const [selected, setSelected] = useState(0)
  const [todaysImages, setTodaysImages] = useState([])
  const [original, setOriginal] = useState(null)

  const handleUpdate = async () => {
    if (todaysImages[selected].userpostid !== original) {
      try {
        const jwt = await AsyncStorage.getItem("jwt");

        fetch(`${backendURI}/Post/changeSpotlight`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': jwt
          },
          body: JSON.stringify({
            postID: todaysImages[selected].userpostid
          })
        });
        router.back();
      } catch (error) {
        router.back();
        console.error("Failed to update spotlight post:", error);
      }
    }
  };

  const refresh = async() => {
    try{
      const jwt = await AsyncStorage.getItem("jwt");

      const raw = await fetch(`${backendURI}/Post/getChoosePosts`, {
        method: "GET",
        headers: {
          Authorization: jwt
        }
      });

      const response = await raw.json();
      
      if(response.specialPost >= 0){
        setSelected(response.specialPost)
        setOriginal(response.allPosts[response.specialPost].userpostid)
      }
      setTodaysImages(response.allPosts)
    }
    catch(error){
      console.log(error)
    }
  }

  useFocusEffect(
    useCallback(() => {
      refresh()
      return () => {};
    }, []),
  );

  const renderShot = ({ item, index }) => {
    return(
      <TouchableOpacity
        style={[
          styles.shotContainer, 
          index === selected && { borderWidth: 5, borderColor: THEME.accent }
        ]}
        onPress={()=>{setSelected(index)}}
      >
        <Image 
          cachePolicy={"memory-disk"}
          source={{ uri: item.imgurl }} 
          style={styles.shotImage} 
        />
      </TouchableOpacity>
    )
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {router.back()}}>
          <Ionicons
            name="arrow-back" size={24} color={THEME.text} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Spotlight</Text>
        <TouchableOpacity onPress={handleUpdate}>
          <Ionicons
              name="checkmark" size={24} color={THEME.text} 
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={todaysImages}
        keyExtractor={(item, index) => index}
        numColumns={3}
        ListHeaderComponent={() => (
          <View style={{ paddingHorizontal: 20, alignItems: "center" }}>
            <ImageBackground
              source={{ uri: todaysImages.length > 0? todaysImages[selected].imgurl: null }}
              style={styles.spotlightCard}
              imageStyle={{ borderRadius: 20}}
              cachePolicy={"memory-disk"}
            >
              <View style={styles.currentBadge}>
                <Ionicons name="star" size={14} color={THEME.bg} />
                <Text style={styles.currentBadgeText}>CURRENT SPOTLIGHT</Text>
              </View>
              
              <View style={styles.spotlightTextContainer}>
                <Text style={styles.spotlightTitle}>{todaysImages.length > 0? todaysImages[selected].caption: ""}</Text>
              </View>
            </ImageBackground>

            <View style={styles.shotsHeader}>
              <Text style={styles.shotsTitle}>TODAY'S SHOTS</Text>
            </View>
          </View>
        )}
        renderItem={renderShot}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={() => (
          <View style={styles.footerInfo}>
            <Text style={styles.footerText}>
              Choose your best shot to highlight for your friends. Your spotlight resets at the end of the day.
            </Text>
            
            <TouchableOpacity
              style={styles.floatingCamera}
              onPress={()=>{router.push("newupload")}}
            >
              <MaterialCommunityIcons name="camera-plus" size={24} color={THEME.bg} />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-between",
    padding: 20,
    marginTop: 10,
  },
  headerTitle: {
    color: THEME.text,
    fontSize: 20,
    fontWeight: '700'
  },
  spotlightCard: {
    height: 380,
    width: '100%',
    marginTop: 10,
  },
  currentBadge: {
    backgroundColor: THEME.accent,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    marginLeft: 10
  },
  currentBadgeText: {
    color: THEME.bg,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 5,
  },
  spotlightTextContainer: {
    paddingBottom: 10,
    marginLeft: 10
  },
  spotlightTitle: {
    color: THEME.text,
    fontSize: 28,
    fontWeight: '800',
  },
  shotsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 40,
    marginBottom: 20,
  },
  shotsTitle: {
    color: THEME.text,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  shotsCount: {
    color: THEME.textSoft,
    fontSize: 12,
    opacity: 0.5,
  },
  listContent: {
    paddingBottom: 30,
  },
  shotContainer: {
    width: (width - 60) / 3,
    height: (width - 60) / 3,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: THEME.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shotImage: {
    width: '100%',
    height: '100%',
  },
  checkmarkBadge: {
    position: 'absolute',
    backgroundColor: THEME.accent,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerInfo: {
    paddingHorizontal: 20,
    marginTop: 30,
    alignItems: 'center',
    position: "relative"
  },
  footerText: {
    color: THEME.textSoft,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.7,
    marginBottom: 30
  },
  floatingCamera: {
    backgroundColor: THEME.accent,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: "flex-end",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: THEME.bottom,
    height: 80,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 15,
  },
  mainCameraBtn: {
    backgroundColor: THEME.accent,
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20, // Elevates the button slightly
  }
});