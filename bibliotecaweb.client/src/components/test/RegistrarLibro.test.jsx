import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import RegistrarLibro from '../RegistrarLibro';
import axios from '../../config/axiosConfig';


vi.mock('../../config/axiosConfig');

describe('RegistrarLibro', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe registrar un libro correctamente y mostrar el modal de éxito', async () => {
        axios.post.mockResolvedValueOnce({ status: 200 });

        render(<RegistrarLibro />);
  
        fireEvent.change(screen.getByLabelText(/Título:/i), { target: { value: 'Nuevo Libro' } });
        fireEvent.change(screen.getByLabelText(/Autor:/i), { target: { value: 'Autor Ejemplo' } });
        fireEvent.change(screen.getByLabelText(/Cantidad:/i), { target: { value: 10 } });
        fireEvent.click(screen.getByLabelText(/Público:/i));
        
        fireEvent.click(screen.getByRole('button', { name: /Registrar/i }));

        await waitFor(() => {
            const modalContent = screen.getByTestId('ModalContent');
            expect(modalContent).toBeInTheDocument();
            expect(screen.getByText(/Registro Exitoso/i)).toBeInTheDocument();
            expect(screen.getByText(/Libro registrado exitosamente./i)).toBeInTheDocument();
        });
    });

    it('debe mostrar un mensaje de error si la API falla', async () => {
        axios.post.mockRejectedValueOnce(new Error('Error'));

        render(<RegistrarLibro />);

        fireEvent.change(screen.getByLabelText(/Título:/i), { target: { value: 'Nuevo Libro' } });
        fireEvent.change(screen.getByLabelText(/Autor:/i), { target: { value: 'Autor Ejemplo' } });
        fireEvent.change(screen.getByLabelText(/Cantidad:/i), { target: { value: 10 } });
        fireEvent.click(screen.getByLabelText(/Público:/i));
        
        fireEvent.click(screen.getByRole('button', { name: /Registrar/i }));

        await waitFor(() => {
            const modalContent = screen.getByTestId('ModalContent');
            expect(modalContent).toBeInTheDocument();

            expect(screen.getByRole('heading', { name: /Error/i })).toBeInTheDocument();
            expect(screen.getByText(/Error al registrar el libro/i)).toBeInTheDocument();
        });
    });
});
