using BibliotecaAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using System.Security.Cryptography;
using Serilog;
using Microsoft.Extensions.Configuration;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Debug()
    .WriteTo.Console()
    .WriteTo.File(
        path: "Logs/BibliotecaAPI-.txt", 
        rollingInterval: RollingInterval.Day, 
        fileSizeLimitBytes: 10485760, 
        retainedFileCountLimit: 30, 
        rollOnFileSizeLimit: true, 
        encoding: System.Text.Encoding.UTF8, 
        shared: true) 
    .CreateLogger();

builder.Host.UseSerilog();

// Configuración de Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "BibliotecaAPI", Version = "v1" });
});

// Configuración de CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowDynamicOrigins", policyBuilder =>
    {
        var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins:Dev").Get<string[]>();
        policyBuilder
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Configuración de JWT para validar la autenticación.
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"]))
        };
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine("Authentication failed.");
                Console.WriteLine($"Exception: {context.Exception.Message}");
                Console.WriteLine($"Token: {context.Request.Headers["Authorization"]}");
                System.Console.WriteLine(context.Exception);
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();


builder.Services.AddDbContext<BibliotecaDbContext>(options =>
    options.UseInMemoryDatabase("BibliotecaDb"));


var app = builder.Build();

// Configuración para el middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "BibliotecaAPI V1");
    });
}
app.UseCors("AllowDynamicOrigins");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

InitializeDatabase(app);

app.Run();

void InitializeDatabase(WebApplication app)
{
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<BibliotecaDbContext>();
        UsuarioDummy(dbContext);
    }
}

//Genera un admin dummy al inicializar la aplicación para poder hacer las pruebas.
void UsuarioDummy(BibliotecaDbContext dbContext)
{
    try
    {
        if (dbContext.Usuarios.Any())
        {
            return;
        }


        var salt = new byte[16];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(salt);
        }
        var saltBase64 = Convert.ToBase64String(salt);


        var password = "Admin1234";
        var hashedPassword = Convert.ToBase64String(KeyDerivation.Pbkdf2(
            password: password,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: 10000,
            numBytesRequested: 256 / 8));


        var adminUser = new Usuario
        {
            User = "admin",
            PasswordHash = hashedPassword,
            Salt = saltBase64,
            Rol = "Admin"
        };

        dbContext.Usuarios.Add(adminUser);
        dbContext.SaveChanges();
    }
    catch (Exception ex)
    {
    }
    
}

