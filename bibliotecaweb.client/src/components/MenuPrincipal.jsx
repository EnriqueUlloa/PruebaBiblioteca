// src/components/MenuPrincipal.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles.css'; 

const MenuPrincipal = () => {
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const storedRole = localStorage.getItem('userRole');
        setUserRole(storedRole || ''); 
    }, []);

    return (
        <nav className="bg-gray-800 p-4">
            <ul className="flex space-x-4">
                <li><Link to="/">Pantalla Principal</Link></li>
                {userRole === 'Admin' && (
                    <>
                        <li><Link to="/listar-usuarios">Listar Usuarios</Link></li>
                        <li><Link to="/registrar-libro">Registrar Libro</Link></li>
                        <li><Link to="/eliminar-libro">Eliminar Libro</Link></li>
                        <li><Link to="/listar-prestamos">Listar Préstamos</Link></li>
                        <li><Link to="/devolver-libro">Devolver Libro</Link></li>
                    </>
                )}
                <li><Link to="/listar-libros">Listar Libros</Link></li>
                <li><Link to="/prestar-libro">Prestar Libro</Link></li>
                
                
            </ul>
        </nav>
    );
};

export default MenuPrincipal;
