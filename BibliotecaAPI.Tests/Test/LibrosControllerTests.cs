using BibliotecaAPI.Controllers;
using BibliotecaAPI.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using Xunit;
using static BibliotecaAPI.Models.Prestamo;

namespace BibliotecaAPI.Tests
{
    public class LibrosControllerTest
    {
        private readonly BibliotecaDbContext _context;
        private readonly ILogger<LibrosController> _logger;
        private readonly LibrosController _controller;

        public LibrosControllerTest()
        {
            var options = new DbContextOptionsBuilder<BibliotecaDbContext>()
                .UseInMemoryDatabase(databaseName: "BibliotecaTestDb")
                .Options;

            _context = new BibliotecaDbContext(options);

            _context.Database.EnsureDeleted();
            _context.Database.EnsureCreated();

            _context.Libros.AddRange(
                new Libro { Id = 1, Titulo = "Libro1", Autor = "Autor1", Cantidad = 5, Publico = true },
                new Libro { Id = 2, Titulo = "Libro2", Autor = "Autor2", Cantidad = 3, Publico = false }
            );
            _context.SaveChanges();

            _logger = Mock.Of<ILogger<LibrosController>>();

            _controller = new LibrosController(_context, _logger);
        }

        [Fact]
        public void AgregarLibro_ValidLibro_ReturnsOkResult()
        {
            var libro = new Libro { Id = 3, Titulo = "Libro Test", Autor = "Autor Test", Cantidad = 5, Publico = true };

            var result = _controller.AgregarLibro(libro) as OkObjectResult;

            Assert.Equal(200, result.StatusCode);
            Assert.Equal("Libro agregado correctamente.", result.Value);
        }





        [Fact]
        public void AgregarLibro_NullLibro_ReturnsBadRequest()
        {
            var result = _controller.AgregarLibro(null) as BadRequestObjectResult;

            Assert.NotNull(result);
            Assert.Equal(400, result.StatusCode);
            Assert.Equal("Información del libro no valida.", result.Value);
        }

        [Fact]
        public void ListarLibros_ReturnsOkResultWithLibros()
        {
            var result = _controller.ListarLibros() as OkObjectResult;

            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
            Assert.Equal(_context.Libros.ToList(), result.Value);
        }

        [Fact]
        public void PrestarLibro_ValidRequest_ReturnsOkResult()
        {
            var libro = _context.Libros.SingleOrDefault(l => l.Id ==  2);

            if (libro == null)
            {
                throw new InvalidOperationException("El libro con Id 1 no se encontró en el contexto.");
            }

            var request = new PrestamoRequest { LibroId = 2 };

            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
        new Claim(ClaimTypes.NameIdentifier, "user-id"),
        new Claim(ClaimTypes.Name, "user-name")
    }, "mock"));

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            var result = _controller.PrestarLibro(request) as OkObjectResult;

            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
            Assert.Equal("Libro prestado exitosamente!", result.Value);

            var prestamo = _context.Prestamos.SingleOrDefault(p => p.LibroId == 1 && p.FechaDevolucion == null);
            Assert.NotNull(prestamo);
            Assert.Equal(1, prestamo.LibroId); 
        }


        [Fact]
        public void PrestarLibro_InvalidRequest_ReturnsBadRequest()
        {
            var result = _controller.PrestarLibro(null) as BadRequestObjectResult;

            Assert.NotNull(result);
            Assert.Equal(400, result.StatusCode);
            Assert.Equal("Solicitud invalida.", result.Value);
        }

        [Fact]
        public void EliminarLibro_ValidId_ReturnsOkResult()
        {
            var result = _controller.EliminarLibro(3) as OkObjectResult;

            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
            Assert.Equal("Libro Eliminado correctamente", result.Value);
        }




        public class AgregarLibroResponse
        {
            public string Message { get; set; }
        }

    }
}
