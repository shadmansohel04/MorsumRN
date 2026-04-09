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
import Badge from "../../(home)/(post)/badge";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image, ImageBackground } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import ReactionsGrid from "../../(home)/(post)/mycomments";

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
  const router = useRouter();
  const params = useLocalSearchParams();

  let data = null;

  try {
    if (params?.data && params.data !== "undefined") {
      data = JSON.parse(params.data);
    }
  } catch (e) {
    console.log("Parse error:", e);
  }

  if (!data) {
    return (
      <View style={[styles.safe, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: "white" }}>Loading...</Text>
      </View>
    );
  }

  const {
    heroImage,
    caption,
    badges = [],
    avatar,
    name,
    meta,
    homemade,
    individualData = {},
    title
  } = data;

  let quantityLabel = "PRICE";
  let timeLabel = "WAIT TIME";

  if (homemade) {
    quantityLabel = "SERVINGS";
    timeLabel = "PREP TIME";
  }

  return (
    <View style={styles.safe}>
      <ScrollView>
        <View style={styles.heroWrap}>
          <ImageBackground
            cachePolicy={"disk"}
            source={{ uri: heroImage }}
            style={styles.hero}
          >
            <LinearGradient
              style={styles.heroBottomFade}
              colors={["transparent", THEME.bg]}
              locations={[0, 0.5]}
            />

            <View style={styles.header}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.headerIconBtn}
                onPress={() => router.back()}
              >
                <Text style={[styles.headerIcon, { color: "#ff7a5c" }]}>←</Text>
              </TouchableOpacity>

              <Text style={styles.headerTitle}>{title ? title : ""}</Text>

              <TouchableOpacity activeOpacity={0.8} style={styles.headerIconBtn}>
                <Text style={styles.headerIcon}>⤴</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.chipsRow}>
              {badges.map((b, index) => (
                <Badge
                  key={index}
                  label={b}
                  textColor="#FF8762"
                  bg="rgba(255, 135, 98, 0.2)"
                  scale={2.5}
                />
              ))}
            </View>
          </ImageBackground>
        </View>

        <View style={styles.content}>
          <View style={styles.authorRow}>
            <View style={styles.authorLeft}>
              <View style={styles.avatarRing}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatar} />
                ) : (
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: "rgba(255, 135, 98, 0.5)" }
                    ]}
                  >
                    <Text style={{ color: "white", fontSize: 25 }}>
                      {name ? name[0].toUpperCase() : ""}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.authorText}>
                <Text style={styles.authorName}>{name}</Text>
                <Text style={styles.authorMeta}>{meta}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.caption}>{caption}</Text>

          <View style={styles.metricsRow}>
            <Pressable
              style={styles.reactButtonFull}
              onPress={() => router.push("commentsPage")}
            >
              <View style={styles.metricCircle}>
                <Text
                  style={{
                    fontSize: 30,
                    color: THEME.accent,
                    fontWeight: "800"
                  }}
                >
                  ⚡︎
                </Text>
              </View>

              <View style={styles.metricTextWrap}>
                <Text style={styles.metricValue}>React</Text>
                <Text style={styles.metricLabel}>
                  DISH YOUR THOUGHTS
                </Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.grid}>
            <View style={styles.card}>
              <Text style={styles.cardKicker}>FLAVOR</Text>
              <Text style={styles.cardMainOrange}>
                {individualData?.flavor}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardKicker}>RATING</Text>
              <View style={styles.levelRow}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <MaterialIcons
                    key={i}
                    name="star"
                    size={26}
                    color={
                      i < (individualData?.rating || 0)
                        ? "#FF8762"
                        : "#333"
                    }
                  />
                ))}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardKicker}>{timeLabel}</Text>
              <Text style={styles.cardMain}>
                {individualData?.time}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardKicker}>{quantityLabel}</Text>
              <Text style={styles.cardMainGreen}>
                {individualData?.quantity}
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const BG = "#0b0d0c";
const CARD = "rgba(255,255,255,0.06)";
const MUTED2 = "rgba(255,255,255,0.35)";
const WHITE = "rgba(255,255,255,0.92)";
const ORANGE = "#ff7a5c";
const GREEN = "#62d27c";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  heroWrap: {
    width: "100%",
    height: Math.min(H * 0.52, 530),
    backgroundColor: "#111",
  },
  hero: { flex: 1, justifyContent: "flex-end" },

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
    gap: 10,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 20,
  },

  authorRow: {
    flexDirection: "row",
    alignItems: "center",
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
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  authorText: { gap: 4 },

  authorName: {
    color: WHITE,
    fontSize: 22,
    fontWeight: "800",
  },

  authorMeta: {
    color: MUTED2,
    fontSize: 12,
    fontWeight: "700",
  },

  caption: {
    marginTop: 18,
    color: WHITE,
    fontSize: 30,
    fontWeight: "800",
  },

  metricsRow: { marginTop: 20 },

  reactButtonFull: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 12,
    gap: 16,
  },

  metricCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
  },

  metricTextWrap: { flex: 1 },

  metricValue: {
    color: WHITE,
    fontSize: 22,
    fontWeight: "900",
  },

  metricLabel: {
    color: MUTED2,
    fontSize: 12,
    fontWeight: "800",
  },

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
    marginBottom: 14,
  },

  cardKicker: {
    color: MUTED2,
    fontSize: 12,
    fontWeight: "900",
  },

  cardMain: {
    color: WHITE,
    fontSize: 22,
    fontWeight: "900",
  },

  cardMainOrange: {
    color: ORANGE,
    fontSize: 22,
    fontWeight: "900",
  },

  cardMainGreen: {
    color: GREEN,
    fontSize: 22,
    fontWeight: "900",
  },

  levelRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
  },
});