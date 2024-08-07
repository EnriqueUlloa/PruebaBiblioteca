// src/components/IniciarSesion.jsx
import { useState } from 'react';
import axios from '../config/axiosConfig';
import { LOGIN_ENDPOINT } from '../config/apiEndpoints';
import PropTypes from 'prop-types';
import Modal from './Modal';
import '../styles.css'; 

const IniciarSesion = ({ onClose }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSuccessful, setIsSuccessful] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(LOGIN_ENDPOINT, {
                username,
                password,
            });
            // Almacena el token, el nombre de usuario y el rol en el almacenamiento local
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userName', response.data.userName);
            localStorage.setItem('userRole', response.data.userRole);
            setIsSuccessful(true);
            // Cierra el modal y redirige a la pantalla principal
            onClose();
            window.location.href = '/';
        } catch (err) {
            setError('Inicio de sesión fallido. Verifica tus credenciales.');
        }
    };

    return (
        <Modal show={true} onClose={onClose}>
            <h2>Iniciar Sesión</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Nombre de usuario:</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <label htmlFor="password">Contraseña:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Iniciar Sesión</button>
                {error && <p className="error-message">{error}</p>}
            </form>
        </Modal>
    );
};

IniciarSesion.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default IniciarSesion;
