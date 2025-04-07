import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
    const router = useRouter();
    const { user } = useAuth();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (user == null) {
                router.replace("/login");
            } else if (user.rol === "ADMIN") {
                router.replace("/admin");
            } else {
                setChecking(false);
            }
        }, 25); 

        return () => clearTimeout(timeout); 
    }, [user, router]);

    if (checking) {
        return null; 
    }

    return children;
}
