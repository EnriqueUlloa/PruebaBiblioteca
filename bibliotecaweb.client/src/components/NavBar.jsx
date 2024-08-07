// src/components/NavBar.jsx
import { useState, useEffect } from 'react';
import IniciarSesion from './IniciarSesion';
import RegistrarUsuario from './RegistrarUsuario';
import './Navbar.css';

const Navbar = ({ onLogout }) => {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUserName = localStorage.getItem('userName');
        const storedUserRole = localStorage.getItem('userRole');

        if (storedToken) {
            setIsAuthenticated(true);
            setUserName(storedUserName || '');
            setUserRole(storedUserRole || '');
        } else {
            setIsAuthenticated(false);
            setUserName('');
            setUserRole('');
        }
    }, [isAuthenticated]);

    const handleLoginClick = () => setShowLoginModal(true);
    const handleRegisterClick = () => setShowRegisterModal(true);
    const handleModalClose = () => {
        setShowLoginModal(false);
        setShowRegisterModal(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        setIsAuthenticated(false);
        setUserName('');
        setUserRole('');
        if (onLogout) {
            onLogout();
        }
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-brand">
                    <a href="/">Inicio</a>
                </div>
                <div className="navbar-links">
                    {isAuthenticated ? (
                        <>
                            <span className="navbar-username">Hola, {userName}!</span>
                            <button onClick={handleLogout}>Cerrar Sesión</button>
                        </>
                    ) : (
                        <>
                            <button onClick={handleLoginClick}>Iniciar Sesión</button>
                            <button onClick={handleRegisterClick}>Registrar Usuario</button>
                        </>
                    )}
                </div>
                {showLoginModal && <IniciarSesion onClose={handleModalClose} />}
                {showRegisterModal && <RegistrarUsuario onClose={handleModalClose} />}
            </nav>
        </>
    );
};

export default Navbar;
