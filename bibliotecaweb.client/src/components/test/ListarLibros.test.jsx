import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import ListarLibros from '../ListarLibros';
import { LISTAR_LIBROS_ENDPOINT } from '../../config/apiEndpoints';


vi.mock('axios');

describe('ListarLibros', () => {
  it('debe mostrar la lista de libros correctamente', async () => {
    const librosMock = [
      { id: 1, titulo: 'Libro 1', autor: 'Autor 1', cantidad: 5 },
      { id: 2, titulo: 'Libro 2', autor: 'Autor 2', cantidad: 3 },
    ];

    axios.get.mockResolvedValue({ data: librosMock });

    render(<ListarLibros />);

    await waitFor(() => {
      expect(screen.getByText('Lista de Libros')).toBeInTheDocument();
      expect(screen.getByText('Libro 1')).toBeInTheDocument();
      expect(screen.getByText('Autor 1')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Libro 2')).toBeInTheDocument();
      expect(screen.getByText('Autor 2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('debe mostrar un mensaje de error si falla la solicitud', async () => {
    axios.get.mockRejectedValue(new Error('Error al obtener libros'));

    render(<ListarLibros />);

    await waitFor(() => {
      expect(screen.getByText('Error al obtener libros')).toBeInTheDocument();
    });
  });
});
