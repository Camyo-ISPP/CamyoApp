import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
    const router = useRouter();
    const { user, userToken } = useAuth();

    if (!user) {
        router.replace("/forbidden");
        return null;
    }

    return children;
}
