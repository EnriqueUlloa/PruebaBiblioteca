import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import IniciarSesion from '../IniciarSesion';
import axios from '../../config/axiosConfig';
import { vi, describe, test, expect, afterEach } from 'vitest';

vi.mock('../../config/axiosConfig');

describe('IniciarSesion', () => {
    const mockOnClose = vi.fn();

    afterEach(() => {
        vi.clearAllMocks();
    });

    test('debe renderizar el formulario de inicio de sesión', () => {
        render(<IniciarSesion onClose={mockOnClose} />);
        
        expect(screen.getByLabelText(/Nombre de usuario:/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Contraseña:/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
    });

    test('debe manejar el inicio de sesión exitoso', async () => {
        axios.post.mockResolvedValue({
            data: {
                token: 'mockToken',
                userName: 'mockUserName',
                userRole: 'mockUserRole',
            },
        });

        render(<IniciarSesion onClose={mockOnClose} />);

        fireEvent.change(screen.getByLabelText(/Nombre de usuario:/i), { target: { value: 'user' } });
        fireEvent.change(screen.getByLabelText(/Contraseña:/i), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

        await waitFor(() => {
            expect(localStorage.getItem('token')).toBe('mockToken');
            expect(localStorage.getItem('userName')).toBe('mockUserName');
            expect(localStorage.getItem('userRole')).toBe('mockUserRole');
            expect(mockOnClose).toHaveBeenCalled();
            expect(window.location.href).toMatch(/http:\/\/localhost:/)
        });
    });

    test('debe manejar el error de inicio de sesión', async () => {
        axios.post.mockRejectedValue(new Error('Inicio de sesión fallido'));

        render(<IniciarSesion onClose={mockOnClose} />);

        fireEvent.change(screen.getByLabelText(/Nombre de usuario:/i), { target: { value: 'user' } });
        fireEvent.change(screen.getByLabelText(/Contraseña:/i), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

        await waitFor(() => {
            expect(screen.getByText(/Inicio de sesión fallido. Verifica tus credenciales./i)).toBeInTheDocument();
        });
    });
});
