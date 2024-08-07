// src/components/test/RegistrarUsuario.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegistrarUsuario from '../RegistrarUsuario';
import axios from '../../config/axiosConfig';
import { vi, describe, test, expect, afterEach } from 'vitest';

// Mock de axios
vi.mock('../../config/axiosConfig');

describe('RegistrarUsuario', () => {
    const mockOnClose = vi.fn();

    afterEach(() => {
        vi.clearAllMocks();
    });

    test('debe renderizar el formulario de registro de usuario', () => {
        render(<RegistrarUsuario onClose={mockOnClose} />);

        expect(screen.getByLabelText(/Nombre de usuario:/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Contraseña:/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Registrar/i })).toBeInTheDocument();
    });

    test('debe manejar el registro exitoso', async () => {
        // Configura el mock para que devuelva una respuesta exitosa
        const mockOnClose = vi.fn();
        axios.post.mockResolvedValue({});
    
        render(<RegistrarUsuario onClose={mockOnClose} />);
    
        fireEvent.change(screen.getByLabelText(/Nombre de usuario:/i), { target: { value: 'newUser' } });
        fireEvent.change(screen.getByLabelText(/Contraseña:/i), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /Registrar/i }));
    
        // Esperar que se muestre el mensaje de éxito
        await waitFor(() => {
            expect(screen.getByText(/Usuario registrado exitosamente./i)).toBeInTheDocument();
        });

    });

    test('debe manejar el error de registro de usuario', async () => {
        axios.post.mockRejectedValue(new Error('Error al registrar usuario'));

        render(<RegistrarUsuario onClose={mockOnClose} />);

        fireEvent.change(screen.getByLabelText(/Nombre de usuario:/i), { target: { value: 'newUser' } });
        fireEvent.change(screen.getByLabelText(/Contraseña:/i), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /Registrar/i }));

        await waitFor(() => {
            expect(screen.getByText(/Error al registrar usuario/i)).toBeInTheDocument();
        });
    });
});
