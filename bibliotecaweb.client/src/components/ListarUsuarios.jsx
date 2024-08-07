// src/components/ListarUsuarios.jsx
import { useState, useEffect } from 'react';
import axios from '../config/axiosConfig'; 
import { LISTAR_USUARIOS_ENDPOINT } from '../config/apiEndpoints'; 
import '../styles.css'; 

const ListarUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const obtenerUsuarios = async () => {
            try {
                const response = await axios.get(LISTAR_USUARIOS_ENDPOINT, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setUsuarios(response.data);
            } catch (error) {
                console.error('Error:', error);
                setError('Error al obtener usuarios');
            }
        };

        obtenerUsuarios();
    }, []);

    return (
        <div className="table-container">
            <div className="table-wrapper">
                <h2 className="text-xl font-bold">Lista de Usuarios</h2>
                {error && <p className="error-message">{error}</p>}
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Rol</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map((usuario) => (
                            <tr key={usuario.id}>
                                <td>{usuario.id}</td>
                                <td>{usuario.user}</td>
                                <td>{usuario.rol}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListarUsuarios;
