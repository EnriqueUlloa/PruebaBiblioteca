// src/App.jsx
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MenuPrincipal from './components/MenuPrincipal';
import PantallaPrincipal from './components/PantallaPrincipal';
import ListarUsuarios from './components/ListarUsuarios';
import RegistrarLibro from './components/RegistrarLibro';
import ListarLibros from './components/ListarLibros';
import EliminarLibro from './components/EliminarLibro';
import PrestarLibro from './components/PrestarLibro';
import DevolverLibro from './components/DevolverLibro';
import ListarPrestamos from './components/ListarPrestamos';
import Navbar from './components/NavBar';
import { useState, useEffect } from 'react';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const [userRole, setUserRole] = useState('');

    if (!isAuthenticated) {
        localStorage.clear();
    }


    useEffect(() => {

        const token = localStorage.getItem('token');
        const role = localStorage.getItem('userRole');
        setIsAuthenticated(!!token);
        setUserRole(role || '');
    }, []);

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUserRole('');
    };

    return (
        <Router>
            <Navbar onLogout={handleLogout} />
            <div className="App">
                {isAuthenticated && <MenuPrincipal userRole={userRole} />}
                <div className="p-4">
                    <Routes>
                        <Route path="/" element={<PantallaPrincipal />} />
                        {isAuthenticated && (
                            <>
                                <Route path="/listar-usuarios" element={<ListarUsuarios />} />
                                <Route path="/registrar-libro" element={<RegistrarLibro />} />
                                <Route path="/eliminar-libro" element={<EliminarLibro />} />
                                <Route path="/devolver-libro" element={<DevolverLibro />} />
                                <Route path="/listar-prestamos" element={<ListarPrestamos />} />
                            </>
                        )}
                        <Route path="/listar-libros" element={<ListarLibros />} />
                        <Route path="/prestar-libro" element={<PrestarLibro />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
