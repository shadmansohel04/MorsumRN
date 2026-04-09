import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import {
  Ionicons,
  MaterialIcons,
  Feather,
} from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";
const backendURI = Constants.expoConfig.extra.backendURI

const THEME = {
  bg: "#0d0f0c",
  accent: "#FF8762",
  surface: "#141612",
  bottom: "#1d201c",
  text: "#FFFFFF",
  textSoft: "#E3E7DE",
};

export default function PostMealScreen() {
  const [description, setDescription] = useState('');
  const [flavor, setFlavor] = useState('');
  const [rating, setRating] = useState(4);
  const [prepTime, setPrepTime] = useState('0');
  const [servings, setServings] = useState('1');
  const [isHomemade, setIsHomemade] = useState(true);
  const [imageURI, setImageUri] = useState(null);
  
  // Badge states
  const [badges, setBadges] = useState([]);
  const [currentBadge, setCurrentBadge] = useState('');
  
  const router = useRouter()

  const handleAddBadge = () => {
    const trimmed = currentBadge.trim();
    if (trimmed.length > 0 && trimmed.length <= 15 && !badges.includes(trimmed)) {
      setBadges([...badges, trimmed]);
      setCurrentBadge('');
    }
  };

  const removeBadge = (indexToRemove) => {
    setBadges(badges.filter((_, index) => index !== indexToRemove));
  };

  const handlePost = async () => {
    const jwt = await AsyncStorage.getItem("jwt");
    const form = new FormData();
    form.append("frame", {
        uri: imageURI,
        name: "image.jpg",
        type: "image/jpeg"
    });
    form.append("homemade", isHomemade);
    form.append("stars", rating);
    form.append("caption", description);
    form.append("flavor", flavor);
    form.append("quant", servings);
    form.append("time", prepTime);
    
    badges.forEach((badge) => {
      form.append("badges", badge);
    });
    
    fetch(`${backendURI}/Post/uploadPost`, {
      method: "POST",
      headers: {
        Authorization: jwt
      },
      body: form
    });
    
    router.replace("../../../");
  }

  useFocusEffect(
    useCallback(() => {
      const loadImage = async () => {
        const photoUri = await AsyncStorage.getItem("currentImage");
        setImageUri(photoUri)
      };
      loadImage();
    }, [])
  );

  return (
    <KeyboardAvoidingView 
      style={styles.safeArea} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity>
            <Ionicons name="arrow-back" size={24} color={THEME.accent} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post Meal</Text>
        </View>
        <TouchableOpacity style={styles.postButton} onPress={handlePost}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.imageCard}>
          <Image
            source={{ uri: imageURI }} 
            style={{width: "100%", height: "100%"}}
            resizeMode="cover"
          />
        </View>

        <Text style={styles.sectionTitle}>Describe your morsel</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="What's the story behind this dish?"
            placeholderTextColor="#4A4A4A"
            multiline={true}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.inputContainerSmall}>
          <TextInput
            style={styles.textInputSingle}
            placeholder="Flavor profile (e.g. Sweet & Sour)"
            placeholderTextColor="#4A4A4A"
            maxLength={30}
            value={flavor}
            onChangeText={setFlavor}
          />
        </View>

        <View style={styles.cardRow}>
          <View style={styles.ratingInfo}>
            <Text style={styles.cardTitle}>Taste Rating</Text>
            <Text style={styles.cardSubtitle}>How appetizing was it?</Text>
          </View>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                <MaterialIcons 
                  name="star" 
                  size={26} 
                  color={star <= rating ? THEME.accent : "#333"} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <MaterialIcons name={isHomemade ? "kitchen" : "access-time"} size={16} color={THEME.accent} />
              <Text style={styles.statTitle}>{isHomemade ? "PREP TIME" : "WAIT TIME"}</Text>
            </View>
            <View style={styles.statInputRow}>
              <TextInput
                style={styles.statInput}
                keyboardType="numeric"
                maxLength={3}
                onChangeText={setPrepTime}
                placeholder='15 mins'
                placeholderTextColor="#4A4A4A"
              />
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Feather name={isHomemade ? "users" : "dollar-sign"} size={16} color={THEME.accent} />
              <Text style={styles.statTitle}>{isHomemade ? "SERVINGS" : "PRICE"}</Text>
            </View>
            <View style={styles.statInputRow}>
              <TextInput
                style={styles.statInput}
                keyboardType="numeric"
                maxLength={2}
                onChangeText={setServings}
                placeholder={isHomemade ? '3 servings' : "$12"}
                placeholderTextColor="#4A4A4A"
              />
            </View>
          </View>
        </View>

        <View style={styles.toggleCard}>
          <View style={styles.toggleLeft}>
            <View style={styles.homeIconContainer}>
              <Ionicons name="home" size={20} color="#6dbd5b" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Homemade Dish</Text>
              <Text style={styles.cardSubtitle}>Toggle for home-cooked recipes</Text>
            </View>
          </View>
          <Switch
            trackColor={{ false: "#333", true: THEME.accent }}
            thumbColor={"#FFF"}
            ios_backgroundColor="#333"
            value={isHomemade}
            onValueChange={setIsHomemade}
          />
        </View>

        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.badgeInputContainer}>
          <TextInput
            style={styles.badgeTextInput}
            placeholder="Add badge (e.g. Spicy)"
            placeholderTextColor="#4A4A4A"
            maxLength={15}
            value={currentBadge}
            onChangeText={setCurrentBadge}
            onSubmitEditing={handleAddBadge}
          />
          <TouchableOpacity style={styles.addBadgeButton} onPress={handleAddBadge}>
            <Ionicons name="add" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.badgesWrapper}>
          {badges.map((badge, index) => (
            <View key={index} style={styles.badgeTag}>
              <Text style={styles.badgeText}>{badge}</Text>
              <TouchableOpacity onPress={() => removeBadge(index)}>
                <Ionicons name="close-circle" size={18} color="#000" style={{marginLeft: 4}} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: THEME.text,
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 15,
  },
  postButton: {
    backgroundColor: THEME.accent,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
  imageCard: {
    alignSelf: "center",
    overflow: "hidden",
    borderRadius: 24,
    marginTop: 10,
    marginBottom: 30,
    height: 300,
    width: "60%",
    position: 'relative',
  },
  sectionTitle: {
    color: THEME.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
  },
  inputContainer: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    height: 160,
    padding: 20,
    marginBottom: 15,
  },
  inputContainerSmall: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    height: 60,
    paddingHorizontal: 20,
    justifyContent: 'center',
    marginBottom: 15,
  },
  textInput: {
    color: THEME.text,
    fontSize: 16,
    height: '100%',
  },
  textInputSingle: {
    color: THEME.text,
    fontSize: 16,
  },
  cardRow: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingInfo: {
    flex: 1,
  },
  cardTitle: {
    color: THEME.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#666',
    fontSize: 13,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 20,
    width: '48%',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    color: THEME.accent,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  statInputRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statInput: {
    color: THEME.text,
    fontSize: 18,
    fontWeight: '600',
    padding: 0,
    margin: 0,
  },
  statUnit: {
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
  },
  toggleCard: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  homeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A2610',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  badgeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  badgeTextInput: {
    flex: 1,
    backgroundColor: THEME.surface,
    borderRadius: 20,
    height: 55,
    paddingHorizontal: 20,
    color: THEME.text,
    fontSize: 16,
  },
  addBadgeButton: {
    backgroundColor: THEME.accent,
    height: 55,
    width: 55,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  badgesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeTag: {
    backgroundColor: THEME.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
  },
  badgeText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  }
});