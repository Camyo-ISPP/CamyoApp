import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

const MyProfile = () => {
    const { userToken, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        /*
        if (!userToken) {
            router.replace('/login');
            return;
        }*/

        switch (user?.rol) {
            case 'CAMIONERO':
                setTimeout(() => {
                    router.replace('/miperfilcamionero');
                  }, 100);
                break;
            case 'EMPRESA':
                setTimeout(() => {
                    router.replace('/miperfilempresa');
                  }, 100);
                break;
            case 'ADMIN':
                setTimeout(() => {
                    router.replace('/workinprogress');
                  }, 100);
                break;
            default:
                setTimeout(() => {
                    router.replace('/login');
                  }, 100);
        }
    }, [userToken, user]);

    return null;
};

export default MyProfile;
