import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EliminarLibro from '../EliminarLibro';
import axios from '../../config/axiosConfig';
import { vi } from 'vitest';
import '@testing-library/jest-dom';


vi.mock('../../config/axiosConfig');

beforeEach(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
});

test('debe eliminar un libro correctamente', async () => {
    axios.delete.mockResolvedValue({ status: 200 });

    render(<EliminarLibro />);

    fireEvent.change(screen.getByLabelText(/ID del Libro:/i), { target: { value: '123' } });

    fireEvent.click(screen.getByRole('button', { name: /Eliminar/i }));

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Libro eliminado exitosamente');
    });
});

test('debe manejar errores al eliminar un libro', async () => {
    axios.delete.mockRejectedValue(new Error('Error al eliminar el libro'));

    render(<EliminarLibro />);

    fireEvent.change(screen.getByLabelText(/ID del Libro:/i), { target: { value: '123' } });

    fireEvent.click(screen.getByRole('button', { name: /Eliminar/i }));

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Error al eliminar el libro');
    });
});
