import { useState } from 'react';
import axios from '../config/axiosConfig';
import { REGISTRAR_ENDPOINT } from '../config/apiEndpoints';
import PropTypes from 'prop-types';
import Modal from './Modal';
import '../styles.css'; 

const RegistrarUsuario = ({ onClose }) => {
    const [usuario, setUsuario] = useState({
        userName: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleChange = (e) => {
        setUsuario({ ...usuario, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(REGISTRAR_ENDPOINT, usuario);
            setShowConfirmation(true);
        } catch (error) {
            setError('Error al registrar usuario');
            console.error(error);
        }
    };

    const handleCloseConfirmation = () => {
        setShowConfirmation(false);
        onClose();
    };

    return (
        <Modal show={true} onClose={onClose}>
            {showConfirmation ? (
                <div>
                    <h2>Registro Exitoso</h2>
                    <p>Usuario registrado exitosamente.</p>
                    <button onClick={handleCloseConfirmation}>Aceptar</button>
                </div>
            ) : (
                <div>
                    <h2>Registrar Usuario</h2>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="username">Nombre de usuario:</label>
                        <input
                            type="text"
                            name="userName"
                            id="username"
                            value={usuario.userName}
                            onChange={handleChange}
                            placeholder="Nombre de usuario"
                            required
                        />
                        <label htmlFor="password">Contraseña:</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={usuario.password}
                            onChange={handleChange}
                            placeholder="Contraseña"
                            required
                        />
                        <button type="submit">Registrar</button>
                        {error && <p className="error-message">{error}</p>}
                    </form>
                </div>
            )}
        </Modal>
    );
};

RegistrarUsuario.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default RegistrarUsuario;
