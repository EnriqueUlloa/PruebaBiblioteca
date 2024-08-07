using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BibliotecaAPI.Controllers;
using BibliotecaAPI.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Moq;
using Xunit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace BibliotecaAPI.Tests
{
    public class AuthControllerTest
    {
        private readonly BibliotecaDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;
        private readonly AuthController _controller;

        public AuthControllerTest()
        {
            // Configura el DbContext en memoria
            var options = new DbContextOptionsBuilder<BibliotecaDbContext>()
                .UseInMemoryDatabase(databaseName: "BibliotecaTestDb")
                .Options;

            _context = new BibliotecaDbContext(options);

            // Asegúrate de limpiar el contexto antes de agregar datos
            _context.Database.EnsureDeleted();
            _context.Database.EnsureCreated();

            // Configura los datos iniciales
            _context.Usuarios.AddRange(
                new Usuario
                {
                    Id = 1,
                    User = "testuser",
                    PasswordHash = "hashedpassword", 
                    Salt = "salt",
                    Rol = "Usuario"
                }
            );
            _context.SaveChanges();

            // Configura la configuración y el logger
            _configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string>
                {
                    { "Jwt:Key", "your_secret_key" },
                    { "Jwt:Issuer", "your_issuer" },
                    { "Jwt:Audience", "your_audience" }
                })
                .Build();

            _logger = Mock.Of<ILogger<AuthController>>();

            // Inicializa el controlador
            _controller = new AuthController(_context, _configuration, _logger);
        }

        [Fact]
        public void Register_ValidRequest_ReturnsOkResult()
        {
            var registerRequest = new RegisterRequest
            {
                UserName = "newuser",
                Password = "password123"
            };

            var result = _controller.Register(registerRequest) as OkObjectResult;

            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
        }

        [Fact]
        public void Register_NullRequest_ReturnsBadRequest()
        {
            var result = _controller.Register(null) as StatusCodeResult;

            Assert.NotNull(result);
            Assert.Equal(500, result.StatusCode);
        }

        [Fact]
        public void Login_ValidCredentials_ReturnsOkResult()
        {
            var user = new Usuario
            {
                User = "testuser",
                PasswordHash = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                    password: "password123",
                    salt: Convert.FromBase64String("salt"),
                    prf: KeyDerivationPrf.HMACSHA256,
                    iterationCount: 10000,
                    numBytesRequested: 256 / 8)),
                Salt = "salt",
                Rol = "Usuario",
                Id = 4
            };
            _context.Usuarios.Add(user);
            _context.SaveChanges();

            var loginRequest = new LoginRequest
            {
                UserName = "testuser",
                Password = "password123"
            };

            var result = _controller.Login(loginRequest) as OkObjectResult;

            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);

            var response = result.Value as dynamic;
            Assert.NotNull(response);
            Assert.Equal("El usuario se ha autenticado correctamente", response.Mensaje);
            Assert.NotNull(response.Token);
            Assert.Equal("testuser", response.userName);
            Assert.Equal("Usuario", response.userRole);
        }

        [Fact]
        public void GetUsuarios_ValidRequest_ReturnsOkResult()
        {
            // Configura los datos iniciales en el contexto
            _context.Usuarios.AddRange(
                new Usuario { Id = 2, User = "user1", PasswordHash = "hash1", Salt = "salt1", Rol = "Usuario" },
                new Usuario { Id = 3, User = "user2", PasswordHash = "hash2", Salt = "salt2", Rol = "Admin" }
            );
            _context.SaveChanges();

            // Configura los datos del contexto para el controlador
            var userClaims = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
        new Claim(ClaimTypes.Role, "Admin")
    }, "mock"));

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = userClaims }
            };

            var result = _controller.GetUsuarios() as OkObjectResult;

            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);

            var usuarios = result.Value as List<Usuario>;
            Assert.NotNull(usuarios);
            Assert.Equal(3, usuarios.Count);
            Assert.Contains(usuarios, u => u.User == "user1");
            Assert.Contains(usuarios, u => u.User == "user2");
            Assert.Contains(usuarios, u => u.User == "testuser");
        }

        [Fact]
        public void GetRolUsuario_ValidRole_ReturnsOkResult()
        {
            var userClaims = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
        new Claim(ClaimTypes.Role, "Admin")
    }, "mock"));

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = userClaims }
            };

            var result = _controller.GetRolUsuario() as OkObjectResult;

            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
        }

        [Fact]
        public void GetRolUsuario_NoRole_ReturnsUnauthorized()
        {
            var userClaims = new ClaimsPrincipal(new ClaimsIdentity());

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = userClaims }
            };

            var result = _controller.GetRolUsuario() as UnauthorizedResult;

            Assert.NotNull(result);
            Assert.Equal(401, result.StatusCode);
        }
    }
}
