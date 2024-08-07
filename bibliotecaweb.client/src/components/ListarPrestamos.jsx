// src/components/ListarPrestamos.jsx
import { useEffect, useState } from 'react';
import axios from '../config/axiosConfig'; 
import { LISTAR_PRESTAMOS_ENDPOINT } from '../config/apiEndpoints'; 
import '../styles.css'; 

const ListarPrestamos = () => {
    const [prestamos, setPrestamos] = useState([]);

    useEffect(() => {
        const fetchPrestamos = async () => {
            try {
                const response = await axios.get(LISTAR_PRESTAMOS_ENDPOINT, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setPrestamos(response.data);
            } catch (error) {
                console.error(error);
                alert('Error al obtener préstamos');
            }
        };
        fetchPrestamos();
    }, []);

    return (
        <div className="table-container">
            <div className="table-wrapper">
                <h2 className="text-xl font-bold">Lista de Préstamos</h2>
                <table className="table">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="p-2">ID del Préstamo</th>
                            <th className="p-2">Libro</th>
                            <th className="p-2">Usuario</th>
                            <th className="p-2">Fecha de Préstamo</th>
                            <th className="p-2">Fecha de Devolución</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prestamos.map((prestamo) => (
                            <tr key={prestamo.id}>
                                <td className="p-2 border">{prestamo.id}</td>
                                <td className="p-2 border">{prestamo.nombreUsuario}</td>
                                <td className="p-2 border">{prestamo.nombreLibro}</td>
                                <td className="p-2 border">{new Date(prestamo.fechaPrestamo).toLocaleDateString('es-MX')}</td>
                                <td className="p-2 border">{prestamo.fechaDevolucion
                                    ? new Date(prestamo.fechaDevolucion).toLocaleDateString('es-MX')
                                    : '-'
                                }</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListarPrestamos;
