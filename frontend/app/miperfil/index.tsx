import { useAuth } from '../../contexts/AuthContext';
import PerfilCamionero from '../_screens/PerfilCamionero';
import PerfilEmpresa from '../_screens/PerfilEmpresa';
import WIP from '../_components/WIP';
import ProtectedRoute from '../../security/ProtectedRoute';
import { useRouter } from "expo-router";
import withNavigationGuard from '@/hoc/withNavigationGuard';
import { useEffect } from "react";

const Perfil = () => {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user || !user.rol) {
            router.replace("/login");
        }
    }, [user, router]);

    if (!user || !user.rol) {
        return null;
    }

    return (
        <ProtectedRoute>
            {user.rol === "CAMIONERO" && <PerfilCamionero />}
            {user.rol === "EMPRESA" && <PerfilEmpresa />}
            {user.rol === "ADMIN" && <WIP />}
        </ProtectedRoute>
    );
};

export default withNavigationGuard(Perfil);