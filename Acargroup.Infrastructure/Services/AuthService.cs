using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Acargroup.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AcargroupDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(AcargroupDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto dto)
    {
        var identifier = dto.UsernameOrEmail?.Trim();

        if (string.IsNullOrWhiteSpace(identifier))
        {
            throw new UnauthorizedAccessException("Email veya kullanıcı adı zorunludur.");
        }

        if (string.IsNullOrWhiteSpace(dto.Password))
        {
            throw new UnauthorizedAccessException("Şifre zorunludur.");
        }

        var normalized = identifier.ToLowerInvariant();

        // Find customer by email (default) or, if needed, by phone/full name for future username support
        var customer = await _context.Customers.FirstOrDefaultAsync(c =>
            c.Email.ToLower() == normalized ||
            c.Phone.ToLower() == normalized ||
            c.FullName.ToLower() == normalized);

        if (customer == null)
        {
            throw new UnauthorizedAccessException("Email veya şifre hatalı.");
        }

        // Verify password
        if (!CustomerService.VerifyPasswordHash(dto.Password, customer.PasswordHash, customer.PasswordSalt))
        {
            throw new UnauthorizedAccessException("Email veya şifre hatalı.");
        }

        // Check if customer is active
        if (!customer.IsActive)
        {
            throw new UnauthorizedAccessException("Hesabınız aktif değil.");
        }

        // Generate JWT token
        var token = GenerateJwtToken(customer);

        var customerDto = new CustomerDto
        {
            Id = customer.Id,
            FullName = customer.FullName,
            Email = customer.Email,
            Phone = customer.Phone,
            CreatedAt = customer.CreatedAt,
            IsActive = customer.IsActive,
            IsAdmin = customer.IsAdmin
        };

        return new LoginResponseDto
        {
            Success = true,
            Token = token,
            Customer = customerDto,
            IsAdmin = customer.IsAdmin,
            Message = "Giriş başarılı."
        };
    }

    private string GenerateJwtToken(Domain.Entities.Customer customer)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var role = customer.IsAdmin ? "Admin" : "Customer";
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, customer.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, customer.Email),
            new Claim(JwtRegisteredClaimNames.Name, customer.FullName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, customer.Id.ToString()),
            new Claim(ClaimTypes.Email, customer.Email),
            new Claim(ClaimTypes.Role, role),
            new Claim("role", role),
            new Claim("IsAdmin", customer.IsAdmin ? "true" : "false")
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<PersonnelLoginResponseDto> LoginPersonnelAsync(PersonnelLoginRequestDto dto)
    {
        var identifier = dto.UsernameOrEmailOrPhone.Trim().ToLower();
        
        var personnel = await _context.Personnel
            .FirstOrDefaultAsync(x =>
                x.Email.ToLower() == identifier ||
                (x.Phone != null && x.Phone.ToLower() == identifier));

        if (personnel == null)
            throw new UnauthorizedAccessException("Bilgiler hatalı.");

        if (!CustomerService.VerifyPasswordHash(dto.Password, personnel.PasswordHash, personnel.PasswordSalt))
            throw new UnauthorizedAccessException("Bilgiler hatalı.");

        if (!personnel.IsActive)
            throw new UnauthorizedAccessException("Hesabınız aktif değil.");

        var token = GeneratePersonnelJwtToken(personnel);

        return new PersonnelLoginResponseDto
        {
            Success = true,
            Token = token,
            Message = "Giriş başarılı.",
            Personnel = new PersonnelDto
            {
                Id = personnel.Id,
                FullName = personnel.FullName,
                Email = personnel.Email,
                Phone = personnel.Phone,
                IsActive = personnel.IsActive
            }
        };
    }

    private string GeneratePersonnelJwtToken(Domain.Entities.Personnel personnel)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, personnel.Id.ToString()),
            new Claim(ClaimTypes.Email, personnel.Email),
            new Claim(ClaimTypes.Role, "Personnel"),
            new Claim("IsPersonnel", "true"),
            new Claim("PersonnelId", personnel.Id.ToString()) // Added for easier access in controllers
        };

        return new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!)),
                SecurityAlgorithms.HmacSha256)
        ));
    }
}
