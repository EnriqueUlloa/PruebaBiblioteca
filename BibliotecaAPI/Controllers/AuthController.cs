using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using BibliotecaAPI.Models;
using System.Security.Cryptography;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;



namespace BibliotecaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly BibliotecaDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;
        public AuthController(BibliotecaDbContext context, IConfiguration configuration, ILogger<AuthController> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest registerRequest)
        {
            try
            {

                byte[] salt = new byte[128 / 8];
                using (var rng = RandomNumberGenerator.Create())
                {
                    rng.GetBytes(salt);
                }

                string saltBase64 = Convert.ToBase64String(salt);

                // Genera el hash de la contraseña utilizando la sal
                string hashedPassword = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                    password: registerRequest.Password,
                    salt: salt,
                    prf: KeyDerivationPrf.HMACSHA256,
                    iterationCount: 10000,
                    numBytesRequested: 256 / 8));

                // Crea un nuevo usuario con la sal y el hash de la contraseña
                var user = new Usuario
                {
                    User = registerRequest.UserName,
                    PasswordHash = hashedPassword,
                    Salt = saltBase64,
                    Rol = "Usuario"
                };

                // Guarda el usuario en la base de datos
                _context.Usuarios.Add(user);
                _context.SaveChanges();

                return Ok(new { message = "Usuario registrado exitosamente" });

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al registrar el usuario");

                return StatusCode(500, "Ocurrió un error al registrar el usuario.");
            }
            
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest loginRequest)
        {
            try {
                var user = _context.Usuarios.FirstOrDefault(u => u.User == loginRequest.UserName);

                if (user == null || !VerifyPassword(loginRequest.Password, user.PasswordHash, user.Salt))
                {
                    return Unauthorized("Credenciales invalidas, por favor valide su usuario y contraseña");
                }

                // Generar token JWT
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new[]
                    {
                    //new Claim(JwtRegisteredClaimNames.Sub, user.User),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.User),
                    new  Claim(ClaimTypes.Role, user.Rol)

                }),
                    Expires = DateTime.UtcNow.AddMinutes(30),
                    Issuer = _configuration["Jwt:Issuer"],
                    Audience = _configuration["Jwt:Audience"],
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };

                var token = tokenHandler.CreateToken(tokenDescriptor);
                var tokenString = tokenHandler.WriteToken(token);

                return Ok(new
                {
                    Mensaje = "El usuario se ha autenticado correctamente",
                    Token = tokenString,
                    userName = user.User,
                    userRole = user.Rol,
                    Expiration = token.ValidTo
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al intentar autenticarse");

                return StatusCode(500, "Ocurrió un error al intentar autenticarse");
            }


        }

        private bool VerifyPassword(string password, string storedHash, string storedSalt)
        {
            var salt = Convert.FromBase64String(storedSalt);
            var hash = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 10000,
                numBytesRequested: 256 / 8));

            return hash == storedHash;
        }


        [HttpGet]
        [Authorize(Roles = "Admin")]
        public IActionResult GetUsuarios()
        {
            try {
                var usuarios = _context.Usuarios
                    .Select(u => new Usuario
                    {
                        Id = u.Id,
                        User = u.User,
                        PasswordHash = u.PasswordHash,
                        Salt = u.Salt,
                        Rol = u.Rol
                    })
                    .ToList();

                return Ok(usuarios);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener los usuarios registrados");

                return StatusCode(500, "Ocurrió un error al obtener los usuarios registrados");
            }


        }

        [HttpGet("rol")]
        public IActionResult GetRolUsuario()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole == null)
            {
                return Unauthorized();
            }

            return Ok(userRole);
        }
    }

    public class LoginRequest
    {
        public string UserName { get; set; }
        public string Password { get; set; }
    }

    public class RegisterRequest
    {
        public string UserName { get; set; }
        public string Password { get; set; }
    }
}
