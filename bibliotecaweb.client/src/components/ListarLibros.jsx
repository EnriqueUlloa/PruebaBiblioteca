// src/components/ListarLibros.jsx
import { useEffect, useState } from 'react';
import axios from 'axios'; 
import { LISTAR_LIBROS_ENDPOINT } from '../config/apiEndpoints'; 
import '../styles.css'; 

const ListarLibros = () => {
    const [libros, setLibros] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLibros = async () => {
            try {
                const response = await axios.get(LISTAR_LIBROS_ENDPOINT);
                setLibros(response.data);
            } catch (error) {
                console.error(error);
                setError('Error al obtener libros');
            }
        };
        fetchLibros();
    }, []);

    return (
        <div className="table-container">
            <div className="table-wrapper">
                <h2 className="text-xl font-bold">Lista de Libros</h2>
                {error && <p className="error-message">{error}</p>}
                <table className="table">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="p-2">ID</th>
                            <th className="p-2">Título</th>
                            <th className="p-2">Autor</th>
                            <th className="p-2">Cantidad</th>

                        </tr>
                    </thead>
                    <tbody>
                        {libros.map((libro) => (
                            <tr key={libro.id}>
                                <td className="p-2 border">{libro.id}</td>
                                <td className="p-2 border">{libro.titulo}</td>
                                <td className="p-2 border">{libro.autor}</td>
                                <td className="p-2 border">{libro.cantidad}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListarLibros;
