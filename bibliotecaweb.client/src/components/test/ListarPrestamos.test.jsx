// src/components/test/ListarPrestamos.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, test, expect } from 'vitest';
import ListarPrestamos from '../ListarPrestamos';
import axios from '../../config/axiosConfig';
import '@testing-library/jest-dom';

// Mocks de las funciones globales
const originalAlert = window.alert;
beforeEach(() => {
  window.alert = vi.fn();
});
afterEach(() => {
  window.alert = originalAlert;
});

vi.mock('../../config/axiosConfig');

describe('ListarPrestamos', () => {
    test('debe listar los préstamos correctamente', async () => {
        // Mock de la respuesta de la API
        const prestamosMock = [
          {
            id: '1',
            nombreUsuario: 'Usuario1',
            nombreLibro: 'Libro1',
            fechaPrestamo: '2024-06-28', // Ajusta la fecha aquí
            fechaDevolucion: '2024-06-29', // Ajusta la fecha aquí
          },
          {
            id: '2',
            nombreUsuario: 'Usuario2',
            nombreLibro: 'Libro2',
            fechaPrestamo: '2024-07-12', // Ajusta la fecha aquí
            fechaDevolucion: null,
          },
        ];
        
        axios.get.mockResolvedValue({ data: prestamosMock });
      
        // Renderiza el componente
        render(<ListarPrestamos />);
      
        // Espera que la tabla de préstamos esté en el documento
        await waitFor(() => {
          expect(screen.getByText(/Lista de Préstamos/i)).toBeInTheDocument();
        });
      
        // Verifica que se muestran los datos de los préstamos
        await waitFor(() => {
          expect(screen.getByText(/Usuario1/i)).toBeInTheDocument();
          expect(screen.getByText(/Libro1/i)).toBeInTheDocument();
          expect(screen.getByText('27/6/2024')).toBeInTheDocument(); // Ajusta el formato aquí
          expect(screen.getByText('28/6/2024')).toBeInTheDocument(); // Ajusta el formato aquí
          
          expect(screen.getByText(/Usuario2/i)).toBeInTheDocument();
          expect(screen.getByText(/Libro2/i)).toBeInTheDocument();
          expect(screen.getByText('11/7/2024')).toBeInTheDocument(); // Ajusta el formato aquí
          expect(screen.getByText(/-/i)).toBeInTheDocument(); // Fecha de devolución nula
        });
      });
      
      

  test('debe mostrar un mensaje de error si la API falla', async () => {
    // Mock de la respuesta de la API
    axios.get.mockRejectedValue(new Error('Error al obtener préstamos'));

    // Renderiza el componente
    render(<ListarPrestamos />);

    // Verifica que se muestra una alerta con el mensaje de error
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error al obtener préstamos');
    });
  });
});
