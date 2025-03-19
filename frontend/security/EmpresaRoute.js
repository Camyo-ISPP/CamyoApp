import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

export default function EmpresaRoute({ children }) {
    const router = useRouter();
    const { user } = useAuth();

    if (user == null) {
        router.replace("/login");
        return null;
    }

    if (user.rol !== "EMPRESA") {
        router.replace("/forbidden");
        return null;
    }

    return children;
}
