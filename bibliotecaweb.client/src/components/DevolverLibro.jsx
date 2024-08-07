import { useState } from 'react';
import axios from '../config/axiosConfig'; 
import { DEVOLVER_ENDPOINT } from '../config/apiEndpoints'; 
import Modal from './Modal'; 

const DevolverLibro = () => {
    const [prestamoId, setPrestamoId] = useState('');
    const [error, setError] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(DEVOLVER_ENDPOINT, { prestamoId }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 200) {
                setError(''); 
                setShowConfirmation(true);
            } else {
                setError('Error al devolver libro');
                setShowConfirmation(true);
            }
        } catch (error) {
            console.error(error);
            setError('Error al devolver libro');
            setShowConfirmation(true);
        }
    };

    const handleCloseConfirmation = () => {
        setShowConfirmation(false);
        setPrestamoId(''); 
    };

    return (
        <div>
            <h2>Devolver Libro</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    ID del Préstamo:
                    <input
                        type="text"
                        value={prestamoId}
                        onChange={(e) => setPrestamoId(e.target.value)}
                        placeholder="ID del préstamo"
                    />
                </label>
                <br />
                <button type="submit">Devolver</button>
            </form>
            {showConfirmation && (
                <Modal show={true} onClose={handleCloseConfirmation}>
                    <h2>{error ? 'Error' : 'Devolución Exitosa'}</h2>
                    <p>{error ? error : 'Libro devuelto exitosamente.'}</p>
                    <button onClick={handleCloseConfirmation}>Aceptar</button>
                </Modal>
            )}
        </div>
    );
};

export default DevolverLibro;
