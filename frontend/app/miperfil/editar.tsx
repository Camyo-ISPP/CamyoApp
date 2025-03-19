import { useAuth } from '../../contexts/AuthContext';
import EditarPerfilCamionero from '../_components/EditarPerfilCamionero';
import EditarPerfilEmpresa from '../_components/EditarPerfilEmpresa';
import WIP from '../_components/WIP';
import ProtectedRoute from '../../security/ProtectedRoute';
import { useRouter } from "expo-router";
import withNavigationGuard from '@/hoc/withNavigationGuard';

const EditarPerfil = () => {
    const { user } = useAuth();
    const router = useRouter();

    if (!user || !user.rol) {
        router.replace("/login");
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