// src/components/test/PrestarLibro.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, test, expect } from 'vitest';
import PrestarLibro from '../PrestarLibro';
import axios from '../../config/axiosConfig';
import '@testing-library/jest-dom';

vi.mock('../../config/axiosConfig');

describe('PrestarLibro', () => {
  test('debe prestar un libro correctamente y mostrar el modal de éxito', async () => {

    axios.post.mockResolvedValue({ status: 200 });

    render(<PrestarLibro />);

    fireEvent.change(screen.getByPlaceholderText(/ID del libro/i), { target: { value: '123' } });

    fireEvent.click(screen.getByRole('button', { name: /Prestar/i }));

    await waitFor(() => {
      const modalContent = screen.getByTestId('ModalContent');
      expect(modalContent).toBeInTheDocument();

      expect(screen.getByRole('heading', { name: /Préstamo Exitoso/i })).toBeInTheDocument();
      expect(screen.getByText(/Libro prestado exitosamente/i)).toBeInTheDocument();
    });
  });

  test('debe mostrar un mensaje de error si la API falla', async () => {

    axios.post.mockRejectedValue(new Error('Error al prestar libro'));

    render(<PrestarLibro />);

    fireEvent.change(screen.getByPlaceholderText(/ID del libro/i), { target: { value: '123' } });

    fireEvent.click(screen.getByRole('button', { name: /Prestar/i }));

    await waitFor(() => {
      const modalContent = screen.getByTestId('ModalContent');
      expect(modalContent).toBeInTheDocument();

      expect(screen.getByRole('heading', { name: /Error/i })).toBeInTheDocument();
      expect(screen.getByText(/Error al prestar libro/i)).toBeInTheDocument();
    });
  });
});
