import AsyncStorage from "@react-native-async-storage/async-storage"
import Constants from "expo-constants"

const backendURI = Constants.expoConfig.extra.backendURI

export const getProfileFunction = async()=>{
    console.log("running")
    try {
        const jwt = await AsyncStorage.getItem("jwt")
        if(!jwt){
            throw Error("No token")
        }
        const raw = await fetch(`${backendURI}/user/getProfile`,{
            method: "GET",
            headers:{
                "Authorization": jwt,
                "Content-Type": "application/json"
            }
        })
        const response = await raw.json()
        if(response && response.success){
            await AsyncStorage.setItem("profile", JSON.stringify(response.profile))
            return response.profile
        }
        return null
    } catch (error) {
        console.log(error)
        return null
    }
    finally{
        console.log("done")
    }
}

export const validateToken = async()=>{
    console.log("validate")
    try {
        // return true
        const jwt = await AsyncStorage.setItem("jwt", "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzU1OTg4NjI4LCJleHAiOjE3NTY1OTM0Mjh9.RCLmJPK1YN_TE0u-ph1VnU2yo-8MG5WOxuHHWQo1B14oalQqgGqtvUoNM2d6Akml39uDlw7k_Mk7IM1S1vXa2g")
        const raw = await fetch(`${backendURI}/user/authToken`,{
            method: "PUT",
            headers: {
                "Authorization": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzU1OTg4NjI4LCJleHAiOjE3NTY1OTM0Mjh9.RCLmJPK1YN_TE0u-ph1VnU2yo-8MG5WOxuHHWQo1B14oalQqgGqtvUoNM2d6Akml39uDlw7k_Mk7IM1S1vXa2g",
                "Content-Type": "application/json"
            }
        })
        const response = await raw.json()
        return (response && response.authorized)
    } catch (error) {
        console.log(error)
        return false
    }
}