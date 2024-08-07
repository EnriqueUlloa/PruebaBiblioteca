using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BibliotecaAPI.Models;
using System.Security.Cryptography;
using Microsoft.Extensions.Configuration;

namespace BibliotecaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TokenController : ControllerBase
    {
        private readonly BibliotecaDbContext _context;
        private readonly IConfiguration _configuration;

        public TokenController(BibliotecaDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost]
        public IActionResult GetToken([FromBody] LoginRequest loginRequest)
        {
            var user = _context.Usuarios.FirstOrDefault(u => u.User == loginRequest.UserName);

            if (user == null)
            {
                return Unauthorized();
            }

            // Recupera la sal almacenada
            byte[] salt = Convert.FromBase64String(user.Salt);

            // Genera el hash de la contraseña proporcionada utilizando la sal almacenada
            string hashedPassword = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: loginRequest.Password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 10000,
                numBytesRequested: 256 / 8));

            // Depuración: Imprimir valores para comparación
            Console.WriteLine($"Stored Hash: {user.PasswordHash}");
            Console.WriteLine($"Generated Hash: {hashedPassword}");

            if (user.PasswordHash != hashedPassword)
            {
                return Unauthorized();
            }

            // Genera el token JWT si la contraseña es válida
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, loginRequest.UserName),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
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
                token = tokenString,
                expires = token.ValidTo
            });
        }


        [Route("api/token/validate")]
        [HttpPost("validate")]
        public IActionResult ValidateToken([FromBody] TokenRequest tokenRequest)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _configuration["Jwt:Issuer"],
                ValidAudience = _configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]))
            };

            try
            {
                var principal = tokenHandler.ValidateToken(tokenRequest.Token, validationParameters, out var validatedToken);
                return Ok(new { IsValid = true, Claims = principal.Claims.Select(c => new { c.Type, c.Value }) });
            }
            catch (Exception ex)
            {
                return BadRequest(new { IsValid = false, Message = ex.Message });
            }
        }
    }



    public class TokenRequest
    {
        public string Token { get; set; }
    }

}
