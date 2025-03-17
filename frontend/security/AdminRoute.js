import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { useSegments, useRootNavigationState } from "expo-router";

export default function AdminRoute({ children }) {
    const router = useRouter();
    const { user, userToken } = useAuth();
    const segments = useSegments();

    const rootNavigationState = useRootNavigationState();
    if (!rootNavigationState?.key) return null;

    if (user == null) {
        router.replace("/login");
        return null;
    }

    if (user.rol !== "ADMIN") {
        router.replace("/forbidden");
        return null;
    }

    /*
    useEffect(() => {
        if (user.rol !== "ADMIN") {
            router.replace("/forbidden");
            return null;
        }
    }, [user, segments]);*/

    return children;
}
