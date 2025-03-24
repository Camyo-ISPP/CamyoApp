import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

export default function EmpresaRoute({ children }) {
    const router = useRouter();
    const { user } = useAuth();
    
    useEffect(() => {
        if (user == null) {
            router.replace("/login");
        } else if (user.rol !== "EMPRESA") {
            router.replace("/forbidden");
        }
    }, [user, router]);

    if (user == null || user.rol !== "EMPRESA") {
        return null;
    }

    return children;
}