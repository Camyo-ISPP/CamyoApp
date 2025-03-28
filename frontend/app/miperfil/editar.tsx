import { useAuth } from '../../contexts/AuthContext';
import EditarPerfilCamionero from '../_screens/EditarPerfilCamionero';
import EditarPerfilEmpresa from '../_screens/EditarPerfilEmpresa';
import WIP from '../_screens/WIP';
import ProtectedRoute from '../../security/ProtectedRoute';
import { useRouter } from "expo-router";
import withNavigationGuard from '@/hoc/withNavigationGuard';
import { useEffect } from "react";

const EditarPerfil = () => {
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
            {user.rol === "CAMIONERO" && <EditarPerfilCamionero />}
            {user.rol === "EMPRESA" && <EditarPerfilEmpresa />}
            {user.rol === "ADMIN" && <WIP />}
        </ProtectedRoute>
    );
};

export default withNavigationGuard(EditarPerfil);