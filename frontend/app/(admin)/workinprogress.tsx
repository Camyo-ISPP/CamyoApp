import React from 'react';
import AdminRoute from '../../security/AdminRoute';
import WIP from '../_screens/WIP';

const WorkInProgressScreen: React.FC = () => {

    return (
        <AdminRoute>
            <WIP />
        </AdminRoute>
    );
};

export default WorkInProgressScreen;