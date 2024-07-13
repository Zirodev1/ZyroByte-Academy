import React from "react";
import { Outlet, Navigate} from 'react-router-dom';

function PrivateRoute({ component: Component, ...rest}) {
        const isAuthenticated = !!localStorage.getItem('token');
        return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}

export default PrivateRoute;