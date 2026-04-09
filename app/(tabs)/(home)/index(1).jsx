import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import HomeScreen from "./homeScreen";
import { useRouter } from "expo-router";

export default function App() {
  const router = useRouter()

  useEffect(()=>{
    setTimeout(() => {
      router.prefetch("../(profile)")
      router.prefetch("/map")
    }, 1000);
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HomeScreen />
    </GestureHandlerRootView>
  );
}
