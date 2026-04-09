import React from "react";
import { View, StyleSheet, Dimensions, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    interpolateColor,
    Easing,
    runOnJS,
} from "react-native-reanimated";
import { Image } from "expo-image";

const { width: wWidth, height: wHeight } = Dimensions.get("window");
const CARD_WIDTH = wWidth * 0.82;
const CARD_HEIGHT = wHeight * 0.6;
const SWIPE_THRESHOLD = 150;

const TinderCard = ({ card, index, cardsLength, onSwipeComplete }) => {
    const x = useSharedValue(0);
    const y = useSharedValue(0);
    const rotation = useSharedValue(0);
    const isSwiped = useSharedValue(false);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            x.value = event.translationX;
            y.value = event.translationY;
            rotation.value = (x.value / wWidth) * 30;
        })
        .onEnd(() => {
            if (Math.abs(x.value) > SWIPE_THRESHOLD) {
                isSwiped.value = true;
                const swipeDirection = x.value > 0 ? 'like' : 'dislike';
                x.value = withTiming(wWidth * (x.value > 0 ? 1 : -1), {
                    duration: 300,
                    easing: Easing.out(Easing.ease),
                }, () => {
                    // call JS handler on the JS thread
                    if (onSwipeComplete) {
                        runOnJS(onSwipeComplete)(swipeDirection, card.recipeID);
                    }
                });
                y.value = withTiming(0, { duration: 300 });
                rotation.value = withTiming(0, { duration: 300 });
            } else {
                isSwiped.value = false;
                x.value = withSpring(0);
                y.value = withSpring(0);
                rotation.value = withSpring(0);
            }
        });

    const cardStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: x.value },
            { translateY: y.value },
            { rotate: `${rotation.value}deg` },
        ],
        opacity: isSwiped.value ? withTiming(0, { duration: 200 }) : 1,
        zIndex: cardsLength - index,
    }));

    const overlayStyle = useAnimatedStyle(() => {
        const tintColor = interpolateColor(
            x.value,
            [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
            ["rgba(255,0,0,0.2)", "rgba(0,0,0,0)", "rgba(0,255,0,0.2)"]
        );
        return { backgroundColor: tintColor };
    });

    return (
        <View style={styles.container} pointerEvents="box-none">
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.card, cardStyle]}>
                    <Text style={styles.recipeName}>{card.recipeName}</Text>
                    <Image
                        source={{ uri: card.imgurl }}
                        style={styles.image}
                        contentFit="cover"
                        cachePolicy={"memory-disk"}
                        recyclingKey={String(card?.recipeID ?? card?.__key ?? index)}
                        placeholder={{ blurhash: "LKO2?U%2Tw=w]~RBVZRi};RPxuwH" }}
                        priority={index === 0 ? "high": "normal"}
                    />
                    <Animated.View style={[styles.overlay, overlayStyle]} />
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

export default React.memo(TinderCard);

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center"
    },
    card: {
        borderRadius: 15,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        justifyContent: "flex-start",
        alignItems: "center",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 5
    },
    image: {
        height: "100%",
        width: "100%",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    recipeName: {
        position: 'absolute',
        width: '100%',
        top: 0,
        padding: 10,
        fontSize: 24,
        color: 'white',
        fontWeight: "bold",
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 10,
    },
});
