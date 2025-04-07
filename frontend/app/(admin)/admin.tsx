import React from 'react';
import AdminRoute from '../../security/AdminRoute';
import AdminPanel from '../_screens/AdminPanel';
import withNavigationGuard from '@/hoc/withNavigationGuard';

const AdminScreen: React.FC = () => {
    return (
        <AdminRoute>
            <AdminPanel />
        </AdminRoute>
    );
};

export default withNavigationGuard(AdminScreen);