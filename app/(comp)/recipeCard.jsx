import React, { useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Pressable, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import ingICON from "../../assets/ingredient.png";
import listICON from "../../assets/to-do-list.png";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';

const RecipeCard = ({ user }) => {
  const ingBlur = useRef(new Animated.Value(0)).current;
  const [imgBlurVar, setIngBlurValue] = useState(0);
  const stepBlur = useRef(new Animated.Value(0)).current;
  const [stepBlurVar, setStepBlur] = useState(0);
  const router = useRouter();

  const fadeOut = (id) => {
    const blurValue = id === "ing" ? ingBlur : stepBlur;
    Animated.timing(blurValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const fadeIn = (id) => {
    const blurValue = id === "ing" ? ingBlur : stepBlur;
    Animated.timing(blurValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const background = (id) => {
    if (id === 'ing') {
      if (imgBlurVar === 1) {
        fadeOut('ing');
        setIngBlurValue(0);
      } else {
        fadeIn('ing');
        setIngBlurValue(1);
        fadeOut('step');
        setStepBlur(0);
      }
    } else if (id === 'step') {
      if (stepBlurVar === 1) {
        fadeOut('step');
        setStepBlur(0);
      } else {
        fadeIn('step');
        setStepBlur(1);
        fadeOut('ing');
        setIngBlurValue(0);
      }
    }
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: user.imgurl }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{user.recipeName}</Text>
      </View>

      <View style={styles.bottom} />

      <Pressable onPress={() => background('ing')} style={[styles.icon, { left: 20 }]}>
        <Image style={{ width: '100%', height: '100%' }} source={ingICON} />
      </Pressable>

      <Pressable 
        onPress={() => router.push({
          pathname: "./review",
          params: user
        })}
        style={[
          styles.icon, 
          { 
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            alignSelf: 'center', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: 30,
            width: 50,
            height: 50,
            bottom: 15
          }
        ]}
      >
        <MaterialCommunityIcons name="chef-hat" size={30} color='rgb(255, 255, 255)' />
      </Pressable>

      <Pressable onPress={() => background('step')} style={[styles.icon, { right: 20 }]}>
        <Image style={{ width: '100%', height: '100%' }} source={listICON} />
      </Pressable>

      <Animated.View 
        style={[styles.wrapped, { opacity: ingBlur }]}
        pointerEvents={imgBlurVar === 1 ? 'auto' : 'none'}
      >
        <BlurView style={styles.blurContainer} tint="light" intensity={100}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.subTitle}>Ingredients</Text>
            {user.ingredients.map((each, index) => (
              <Text style={styles.item} key={`ing-${index}`}>- {each}</Text>
            ))}
          </ScrollView>
        </BlurView>
      </Animated.View>

      <Animated.View 
        style={[styles.wrapped, { opacity: stepBlur }]}
        pointerEvents={stepBlurVar === 1 ? 'auto' : 'none'}
      >
        <BlurView style={styles.blurContainer} tint="dark" intensity={100}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={[styles.subTitle, { color: 'white' }]}>Steps</Text>
            {user.steps.map((each, index) => (
              <Text style={[styles.item, { color: 'white' }]} key={`step-${index}`}>- {each}</Text>
            ))}
          </ScrollView>
        </BlurView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottom:{
    position: 'absolute',
    bottom: 0,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    width: '100%',
    zIndex: 5
  },
  icon: {
    position: 'absolute',
    bottom: 23,
    zIndex: 6,
    width: 35,
    height: 35,
  },
  wrapped: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 4,
  },
  blurContainer: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  item: {
    fontSize: 20,
    marginBottom: 5,
  },
  subTitle: {
    fontWeight: '500',
    fontSize: 30,
    marginBottom: 10,
    marginTop: 50
  },
  card: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    position: 'relative',
    backgroundColor: 'black'
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  info: {
    position: 'absolute',
    top: 0,
    width: '100%',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  name: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  }
});

export default RecipeCard;
