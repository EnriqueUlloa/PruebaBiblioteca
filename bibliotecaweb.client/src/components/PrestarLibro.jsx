import { useState } from 'react';
import axios from '../config/axiosConfig'; 
import { PRESTAR_ENDPOINT } from '../config/apiEndpoints'; 
import Modal from './Modal'; 

const PrestarLibro = () => {
    const [libroId, setLibroId] = useState('');
    const [error, setError] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(PRESTAR_ENDPOINT, { libroId }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 200) {
                setError(''); // Limpiar el mensaje de error
                setShowConfirmation(true);
            } else {
                setError('Error al prestar libro');
                setShowConfirmation(true);
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error al prestar libro');
            setShowConfirmation(true);
        }
    };

    const handleCloseConfirmation = () => {
        setShowConfirmation(false);
        setLibroId(''); 
    };

    return (
        <div>
            <h2>Prestar Libro</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={libroId}
                    onChange={(e) => setLibroId(e.target.value)}
                    placeholder="ID del libro"
                />
                <button type="submit">Prestar</button>
            </form>
            {showConfirmation && (
                <Modal show={true} onClose={handleCloseConfirmation}>
                    <h2>{error ? 'Error' : 'Préstamo Exitoso'}</h2>
                    <p>{error ? error : 'Libro prestado exitosamente.'}</p>
                    <button onClick={handleCloseConfirmation}>Aceptar</button>
                </Modal>
            )}
        </div>
    );
};

export default PrestarLibro;
