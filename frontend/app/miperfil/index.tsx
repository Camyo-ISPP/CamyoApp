import { useAuth } from '../../contexts/AuthContext';
import PerfilCamionero from '../_components/PerfilCamionero';
import PerfilEmpresa from '../_components/PerfilEmpresa';
import WIP from '../_components/WIP';
import ProtectedRoute from '../../security/ProtectedRoute';
import { useRouter } from "expo-router";
import withNavigationGuard from '@/hoc/withNavigationGuard';

const Perfil = () => {
    const { user } = useAuth();
    const router = useRouter();

    if (!user || !user.rol) {
        router.replace("/login");
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