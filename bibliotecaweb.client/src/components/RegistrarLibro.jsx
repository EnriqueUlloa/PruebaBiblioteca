// src/components/RegistrarLibro.jsx
import { useState } from 'react';
import axios from '../config/axiosConfig';
import { REGISTRAR_LIBRO_ENDPOINT } from '../config/apiEndpoints';
import Modal from './Modal';
import '../styles.css';

const RegistrarLibro = () => {
    const [libro, setLibro] = useState({ titulo: '', autor: '', cantidad: 1, publico: false });
    const [error, setError] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleChange = (e) => {
        setLibro({ ...libro, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(REGISTRAR_LIBRO_ENDPOINT, libro, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                }
            });
            setShowConfirmation(true);
        } catch (error) {
            setError('Error al registrar el libro');
            setShowConfirmation(true);
        }
    };

    const handleCloseConfirmation = () => {
        setShowConfirmation(false);
        setLibro({ titulo: '', autor: '', cantidad: 1, publico: false }); // Reinicia el formulario si es necesario
    };

    return (
        <div className="registrar-libro">
            <h2>Registrar Libro</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Título:
                    <input type="text" name="titulo" value={libro.titulo} onChange={handleChange} />
                </label>
                <br />
                <label>
                    Autor:
                    <input type="text" name="autor" value={libro.autor} onChange={handleChange} />
                </label>
                <br />
                <label>
                    Cantidad:
                    <input type="number" name="cantidad" value={libro.cantidad} onChange={handleChange} />
                </label>
                <br />
                <label>
                    Público:
                    <input type="checkbox" name="publico" checked={libro.publico} onChange={() => setLibro({ ...libro, publico: !libro.publico })} />
                </label>
                <br />
                <button type="submit">Registrar</button>
            </form>
            {showConfirmation && (
                <Modal show={true} onClose={handleCloseConfirmation}>
                    <h2>{error ? 'Error' : 'Registro Exitoso'}</h2>
                    <p>{error ? error : 'Libro registrado exitosamente.'}</p>
                    <button onClick={handleCloseConfirmation}>Aceptar</button>
                </Modal>
            )}
        </div>
    );
};

export default RegistrarLibro;
