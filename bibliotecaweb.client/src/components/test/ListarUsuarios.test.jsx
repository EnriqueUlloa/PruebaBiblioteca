import { render, screen, waitFor } from '@testing-library/react';
import ListarUsuarios from '../ListarUsuarios';
import axios from '../../config/axiosConfig';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../../config/axiosConfig');

test('debe mostrar la lista de usuarios correctamente', async () => {
    const usuariosMock = [
        { id: 1, user: 'usuario1', rol: 'admin' },
        { id: 2, user: 'usuario2', rol: 'user' },
    ];

    axios.get.mockResolvedValue({ data: usuariosMock });

    render(<ListarUsuarios />);

    await waitFor(() => {
        expect(screen.getByText(/Lista de Usuarios/i)).toBeInTheDocument();
        expect(screen.getByText(/usuario1/i)).toBeInTheDocument();
        expect(screen.getByText(/usuario2/i)).toBeInTheDocument();
        expect(screen.getByText(/admin/i)).toBeInTheDocument();
        expect(screen.getByText(/user/i)).toBeInTheDocument();
    });
});

test('debe mostrar un mensaje de error cuando ocurre un error al obtener usuarios', async () => {
    axios.get.mockRejectedValue(new Error('Error al obtener usuarios'));

    render(<ListarUsuarios />);

    await waitFor(() => {
        expect(screen.getByText(/Error al obtener usuarios/i)).toBeInTheDocument();
    });
});
