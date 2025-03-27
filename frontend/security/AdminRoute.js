import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { useSegments } from "expo-router";

export default function AdminRoute({ children }) {
    const router = useRouter();
    const { user, userToken } = useAuth();
    const segments = useSegments();
    
    useEffect(() => {
        if (user == null) {
            router.replace("/login");
        } else if (user.rol !== "ADMIN") {
            router.replace("/forbidden");
        }
    }, [user, router]);

    if (user == null || user.rol !== "ADMIN") {
        return null;
    }


    return children;
}
