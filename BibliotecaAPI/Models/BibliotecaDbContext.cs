using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace BibliotecaAPI.Models
{

    public class BibliotecaDbContext : DbContext
    {
        public BibliotecaDbContext(DbContextOptions<BibliotecaDbContext> options)
            : base(options)
        {
        }

        public DbSet<Libro> Libros { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Prestamo> Prestamos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Libro>().HasKey(l => l.Id);
            modelBuilder.Entity<Usuario>().HasKey(u => u.Id);
            modelBuilder.Entity<Prestamo>().HasKey(p => p.Id);

            base.OnModelCreating(modelBuilder);

        }

    }
    public class Libro
    {
        public Libro()
        {
            Cantidad = 0;
        }
        [Key]
        public int Id { get; set; }
        [Required]
        public string Titulo { get; set; }
        [Required]
        public string Autor { get; set; }
        [Required]
        public int Cantidad { get; set; }
        [Required]
        public bool Publico { get; set; }
    }

    public class Usuario
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string User{ get; set; }
        [Required]
        public string PasswordHash { get; set; }
        [Required]

        public string Salt { get; set; }
        [Required]
        public string Rol { get; set; }
    }

    public class Prestamo
    {
        public int Id { get; set; }
        public int LibroId { get; set; }
        public string? UsuarioId { get; set; }
        public string? NombreUsuario { get; set; }
        public string? NombreLibro { get; set; }
        public DateTime FechaPrestamo { get; set; }

        public DateTime? FechaDevolucion { get; set; }

        public class PrestamoRequest
    {
        public int LibroId { get; set; }
    }

        public class DevolucionRequest
        {
            public int PrestamoId { get; set; } 
        }

    }
}
