import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { useRootNavigationState } from "expo-router";

export default function CamioneroRoute({ children }) {
    const router = useRouter();
    const { user } = useAuth();

    const rootNavigationState = useRootNavigationState();
    if (!rootNavigationState?.key) return null;
    
    if (user == null) {
        router.replace("/login");
        return null;
    }

    if (user.rol !== "CAMIONERO") {
        router.replace("/forbidden");
        return null;
    }

    return children;
}
