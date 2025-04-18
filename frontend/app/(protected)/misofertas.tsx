import { useAuth } from '../../contexts/AuthContext';
import MisOfertasCamionero from '../_screens/MisOfertasCamionero';
import MisOfertasEmpresa from '../_screens/MisOfertasEmpresa';
import WIP from '../_screens/WIP';
import ProtectedRoute from '../../security/ProtectedRoute';
import { useRouter } from "expo-router";
import withNavigationGuard from '@/hoc/withNavigationGuard';
import { useEffect } from "react";

const MisOfertas = () => {
    const { user } = useAuth();
    const router = useRouter();

    /*
    useEffect(() => {
        if (!user || !user.rol) {
            router.replace("/login");
        }
    }, [user, router]);
    */

    if (!user || !user.rol) {
        return null;
    }

    return (
        <ProtectedRoute>
            {user.rol === "CAMIONERO" && <MisOfertasCamionero />}
            {user.rol === "EMPRESA" && <MisOfertasEmpresa />}
            {user.rol === "ADMIN" && <WIP />}
        </ProtectedRoute>
    );
};

export default withNavigationGuard(MisOfertas);