// src/components/EliminarLibro.jsx
import { useState } from 'react';
import axios from '../config/axiosConfig'; 
import { ELIMINAR_LIBRO_ENDPOINT } from '../config/apiEndpoints';
import '../styles.css'; 

const EliminarLibro = () => {
    const [libroId, setLibroId] = useState('');

    const handleChange = (e) => {
        setLibroId(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.delete(`${ELIMINAR_LIBRO_ENDPOINT}/${libroId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                }
            });
            if (response.status === 200) {
                alert('Libro eliminado exitosamente');
                setLibroId(''); 
            } else {
                alert('Error al eliminar el libro');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar el libro');
        }
    };

    return (
        <div>
            <h1>Eliminar Libro</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    ID del Libro:
                    <input type="text" value={libroId} onChange={handleChange} />
                </label>
                <br />
                <button type="submit">Eliminar</button>
            </form>
        </div>
    );
};

export default EliminarLibro;
