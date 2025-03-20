import { useAuth } from '../../contexts/AuthContext';
import MiPerfilCamionero from '../_screens/MiPerfilCamionero';
import MiPerfilEmpresa from '../_screens/MiPerfilEmpresa';
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
            {user.rol === "CAMIONERO" && <MiPerfilCamionero />}
            {user.rol === "EMPRESA" && <MiPerfilEmpresa />}
            {user.rol === "ADMIN" && <WIP />}
        </ProtectedRoute>
    );
};

export default withNavigationGuard(Perfil);