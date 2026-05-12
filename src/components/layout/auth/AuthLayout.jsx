import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
    return (
        <div className="auth-layout">
            <main className="auth-main">
                <Outlet />
            </main>
        </div>
    );
};

export default AuthLayout;