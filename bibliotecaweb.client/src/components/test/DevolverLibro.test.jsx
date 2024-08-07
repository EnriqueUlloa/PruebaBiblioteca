import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, test, expect } from 'vitest';
import DevolverLibro from '../DevolverLibro';
import axios from '../../config/axiosConfig';
import '@testing-library/jest-dom';

vi.mock('../../config/axiosConfig');

describe('DevolverLibro', () => {
  test('debe devolver un libro correctamente y mostrar el modal de éxito', async () => {

    axios.post.mockResolvedValue({ status: 200 });

    render(<DevolverLibro />);

    fireEvent.change(screen.getByPlaceholderText(/ID del préstamo/i), { target: { value: '123' } });

    fireEvent.click(screen.getByRole('button', { name: /Devolver/i }));

    await waitFor(() => {
      expect(screen.getByTestId('ModalContent')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Devolución Exitosa/i })).toBeInTheDocument();
      expect(screen.getByText(/Libro devuelto exitosamente./i)).toBeInTheDocument();
    });
  });

  test('debe mostrar un mensaje de error si la API falla', async () => {
    axios.post.mockRejectedValue(new Error('Error al devolver libro'));

    render(<DevolverLibro />);

    fireEvent.change(screen.getByPlaceholderText(/ID del préstamo/i), { target: { value: '123' } });

    fireEvent.click(screen.getByRole('button', { name: /Devolver/i }));

    await waitFor(() => {
      expect(screen.getByTestId('ModalContent')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Error/i })).toBeInTheDocument();
      expect(screen.getByText(/Error al devolver libro/i)).toBeInTheDocument();
    });
  });
});
