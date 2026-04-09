import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
  Pressable
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Badge from "./badge";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image, ImageBackground } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import ReactionsGrid from "./mycomments";
import { useState } from "react";

const { height: H } = Dimensions.get("window");

const THEME = {
  bg: "#0d0f0c",
  accent: "#FF8762",
  surface: "#141612",
  bottom: "#1d201c",
  text: "#FFFFFF",
  textSoft: "#E3E7DE",
};

export default function SpotlightScreen() {
  const router = useRouter()
  let {data} = useLocalSearchParams()
  data = data? JSON.parse(data): null
  let quantityLabel = "PRICE"
  let timeLabel = "WAIT TIME"

  if (data.homemade){
      quantityLabel = "SERVINGS"
      timeLabel = "PREP TIME"
  }

  return (
    <View style={styles.safe}>
      <ScrollView>
      <View style={styles.heroWrap}>
          <ImageBackground cachePolicy={"disk"} source={{ uri: data.heroImage }} style={styles.hero} >
          <LinearGradient 
              style={styles.heroBottomFade}
              colors={[
                  'transparent',
                  THEME.bg,
              ]}
              locations={[0, 0.5]}
          />
          <View style={styles.header}>
              <TouchableOpacity activeOpacity={0.8} style={styles.headerIconBtn}>
                <Text style={[styles.headerIcon, { color: "#ff7a5c" }]}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{data.title? data.title: ""}</Text>

              <TouchableOpacity activeOpacity={0.8} style={styles.headerIconBtn}>
              <Text style={styles.headerIcon}>⤴</Text>
              </TouchableOpacity>
          </View>

          <View style={styles.chipsRow}>
              {data.badges?.map((b, index)=>(
                  <Badge key={index} label={b} textColor="#FF8762" bg="rgba(255, 135, 98, 0.2)" scale={2.5} />
              ))}
          </View>
          </ImageBackground>
      </View>


      <View style={styles.content}>
          <View style={styles.authorRow}>
          <View style={styles.authorLeft}>
              <View style={styles.avatarRing}>
              {data.avatar?<Image cachePolicy={"memory"} source={{ uri: data.avatar }} style={styles.avatar} />:(
                <View style={[styles.avatar, {backgroundColor: "rgba(255, 135, 98, 0.5)"}]}>
                  <Text style={{color: "white", fontSize: 25}}>{data.name[0].toUpperCase()}</Text>
                </View>
              )}
              </View>

              <View style={styles.authorText}>
              <Text style={styles.authorName}>{data.name}</Text>
              <Text style={styles.authorMeta}>{data.meta}</Text>
              </View>
          </View>
          </View>

          <Text style={styles.caption}>{data.caption}</Text>

          {/* UPDATED METRICS ROW */}
          <View style={styles.metricsRow}>
            <Pressable 
              style={styles.reactButtonFull}
              onPress={()=>{router.push("commentsPage")}}
            >
              <View style={styles.metricCircle}>
                <Text style={[styles.metricIcon, {fontSize: 30, color: THEME.accent}]}>⚡︎</Text>
              </View>
              <View style={styles.metricTextWrap}>
                <Text style={styles.metricValue}>React</Text>
                <Text style={styles.metricLabel}>DISH YOUR THOUGHTS</Text>
              </View>
            </Pressable>
          </View>


          <View style={styles.grid}>
            <View style={styles.card}>
              <Text style={styles.cardKicker}>FLAVOR</Text>
              <Text style={styles.cardMainOrange}>{data.individualData.flavor}</Text>
            </View>


            <View style={styles.card}>
              <Text style={styles.cardKicker}>RATING</Text>
              <View style={styles.levelRow}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <MaterialIcons
                    key={i}
                    name="star"
                    size={26}
                    color={i < data.individualData.rating ? "#FF8762" : "#333"}
                  />
                ))}
              </View>
            </View>


            <View style={styles.card}>
              <Text style={styles.cardKicker}>{timeLabel}</Text>
              <Text style={styles.cardMain}>{data.individualData.time}</Text>
            </View>


            <View style={styles.card}>
              <Text style={styles.cardKicker}>{quantityLabel}</Text>
              <Text style={styles.cardMainGreen}>{data.individualData.quantity}</Text>
            </View>
          </View>
      </View>

      {data.title? <ReactionsGrid />: null}
      </ScrollView>
      </View>
  );
}

const BG = "#0b0d0c";
const CARD = "rgba(255,255,255,0.06)";
const MUTED = "rgba(255,255,255,0.55)";
const MUTED2 = "rgba(255,255,255,0.35)";
const WHITE = "rgba(255,255,255,0.92)";
const ORANGE = "#ff7a5c";
const GREEN = "#62d27c";


const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  heroWrap: {
    width: "100%",
    height: Math.min(H * 0.52, 530),
    backgroundColor: "#111",
  },
  hero: {
    flex: 1,
    justifyContent: "flex-end",
  },
  heroBottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 220,
  },
  header: {
    position: "absolute",
    top: Platform.OS === "android" ? 28 : 8,
    left: 14,
    right: 14,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerIcon: {
    fontSize: 22,
    color: WHITE,
    fontWeight: "700",
  },
  headerTitle: {
    color: WHITE,
    fontSize: 20,
    letterSpacing: 3.8,
    fontWeight: "700",
  },

  chipsRow: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 20,
    backgroundColor: BG,
  },

  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  authorLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: ORANGE,
    padding: 3,
    marginRight: 12,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center"
  },
  authorText: {
    gap: 4,
  },
  authorName: {
    color: WHITE,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  authorMeta: {
    color: MUTED2,
    letterSpacing: 2.1,
    fontSize: 12,
    fontWeight: "700",
  },
  caption: {
    marginTop: 18,
    color: WHITE,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  // UPDATED STYLES FOR FULL-WIDTH METRIC BUTTON
  metricsRow: {
    marginTop: 20,
    width: "100%", 
  },
  reactButtonFull: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 12,
    width: "100%",
    gap: 16,
  },
  metricCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "rgba(255,255,255,0.06)", 
    alignItems: "center",
    justifyContent: "center",
  },
  metricIcon: {
    fontWeight: "800",
  },
  metricTextWrap: {
    gap: 2,
    flex: 1, 
  },
  metricValue: {
    color: WHITE,
    fontSize: 22,
    fontWeight: "900",
  },
  metricLabel: {
    color: MUTED2,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2.2,
    marginTop: 2,
  },
  // END UPDATED STYLES

  grid: {
    marginTop: 22,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 16,
    minHeight: 92,
    justifyContent: "space-between",
    marginBottom: 14,
  },
  cardKicker: {
    color: MUTED2,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2.6,
  },
  cardMain: {
    color: WHITE,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 10,
  },
  cardMainOrange: {
    color: ORANGE,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 10,
  },
  cardMainGreen: {
    color: GREEN,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 10,
  },
  levelRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
    alignItems: "center",
  },
});