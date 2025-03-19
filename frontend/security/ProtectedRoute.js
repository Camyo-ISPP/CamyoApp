import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
    const router = useRouter();
    const { user } = useAuth();

    if (user == null) {
        router.replace("/login");
        return null;
    }

    if (user.rol == "ADMIN") {
        router.replace("/workinprogress");
        return null;
    }

    /*
    if (!user) {
        router.replace("/forbidden");
        return null;
    }*/

    return children;
}
