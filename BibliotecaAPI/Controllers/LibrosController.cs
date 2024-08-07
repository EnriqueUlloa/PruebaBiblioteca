using BibliotecaAPI.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using static BibliotecaAPI.Models.Prestamo;

namespace BibliotecaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LibrosController : ControllerBase
    {
        private readonly BibliotecaDbContext _context;
        private readonly ILogger<LibrosController> _logger;

        public LibrosController(BibliotecaDbContext context, ILogger<LibrosController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public IActionResult AgregarLibro([FromBody] Libro libro)
        {
            try
            {
                if (libro == null)
                {
                    return BadRequest("Información del libro no valida.");
                }

                _context.Libros.Add(libro);
                _context.SaveChanges();

                return Ok("Libro agregado correctamente." );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al agregar un libro");

                return StatusCode(500, "Ocurrió un error al agregar un libro");
            }

        }

        [HttpGet]
        public IActionResult ListarLibros()
        {
            try
            {
                var libros = _context.Libros.ToList();
                return Ok(libros);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al consultar los libros");

                return StatusCode(500, "Ocurrió un error al consultar los libros");
            }
        }

        [HttpPost("prestar")]
        public IActionResult PrestarLibro([FromBody] PrestamoRequest request)
        {
            try
            {
                if (request == null || request.LibroId <= 0)
                {
                    return BadRequest("Solicitud invalida.");
                }

                var libro = _context.Libros.SingleOrDefault(l => l.Id == request.LibroId);
                if (libro == null)
                {
                    return NotFound("Libro no encontrado.");
                }

                if (libro.Cantidad <= 0)
                {
                    return BadRequest("No hay copias disponibles.");
                }

                bool isPublic = libro.Publico;
                if (!isPublic)
                {
                    if (!User.Identity.IsAuthenticated)
                    {
                        return Unauthorized("Debes de estar registrado para solicitar este libro.");
                    }


                    var prestamo = GetUserInfo(libro);
                    _context.Prestamos.Add(prestamo);
                    libro.Cantidad--;
                }
                else
                {
                    var prestamo = new Prestamo();

                    if (!User.Identity.IsAuthenticated)
                    {
                        // Libros públicos no requieren autenticación, solo registra al usuario como "No registrado"
                        prestamo = new Prestamo
                        {
                            UsuarioId = "No registrado",
                            NombreUsuario = "No registrado",
                            NombreLibro = libro.Titulo,
                            LibroId = request.LibroId,
                            FechaPrestamo = DateTime.Now
                        };
                    }
                    else
                    {
                        //Registra al usuario si este ya se encuentra autenticado
                        prestamo = GetUserInfo(libro);
                    }

                    _context.Prestamos.Add(prestamo);
                    libro.Cantidad--;
                }

                _context.SaveChanges();
                return Ok("Libro prestado exitosamente!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al prestar un libro");

                return StatusCode(500, "Ocurrió un error al prestar un libro");
            }
           
        }

        private Prestamo GetUserInfo(Libro libro)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var nombreUsuario = User.FindFirstValue(ClaimTypes.Name);

                if (string.IsNullOrEmpty(userId))
                {
                    throw new UnauthorizedAccessException("ID de usuario no encontrado.");
                }

                return new Prestamo
                {
                    LibroId = libro.Id,
                    UsuarioId = userId,
                    NombreUsuario = nombreUsuario,
                    NombreLibro = libro.Titulo,
                    FechaPrestamo = DateTime.Now
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener la información del usuario");

                return new Prestamo{ };
            }


            
        }

        [HttpGet("prestamos")]
        [Authorize(Roles = "Admin")]
        public IActionResult ListarPrestamos()
        {
            try {
                var prestamos = _context.Prestamos.ToList();
                return Ok(prestamos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al listar los prestamos");

                return StatusCode(500, "Ocurrió un error al listar los prestamos");
            }
            
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult EliminarLibro(int id)
        {
            try
            {
                var libro = _context.Libros.SingleOrDefault(l => l.Id == id);

                if (libro == null)
                {
                    return NotFound("Libro no encontrado.");
                }

                _context.Libros.Remove(libro);
                _context.SaveChanges();

                return Ok("Libro Eliminado correctamente");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar un libro");

                return StatusCode(500, "Ocurrió un error al eliminar un libro");
            }
            
        }

        [HttpPost("devolver")]
        public IActionResult DevolverLibro([FromBody] DevolucionRequest request)
        {
            try
            {
                if (request == null || request.PrestamoId <= 0)
                {
                    return BadRequest("Solicitud invalida.");
                }

                var prestamo = _context.Prestamos
                 .SingleOrDefault(p => p.Id == request.PrestamoId);

                if (prestamo == null)
                {
                    return NotFound("Prestamo no encontrado");
                }

                var libro = _context.Libros.SingleOrDefault(l => l.Id == prestamo.LibroId);
                if (libro == null)
                {
                    return NotFound("El libro no se encuentra");
                }

                libro.Cantidad++;

                prestamo.FechaDevolucion = DateTime.Now;

                _context.SaveChanges();

                return Ok("El libro se ha devuelto correctamente");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al hacer una devolución");

                return StatusCode(500, "Ocurrió un error al hacer una devolución");
            }
            
        }

    }

}
