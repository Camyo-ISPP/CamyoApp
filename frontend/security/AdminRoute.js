import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { useSegments } from "expo-router";

export default function AdminRoute({ children }) {
    const router = useRouter();
    const { user, userToken } = useAuth();
    const segments = useSegments();
    if (user == null) {
        router.replace("/login");
        return null;
    }

    if (user.rol !== "ADMIN") {
        router.replace("/forbidden");
        return null;
    }

    return children;
}
