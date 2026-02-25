using System.Security.Cryptography;
using System.Text;
using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Entities;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Services;

public class CustomerService : ICustomerService
{
    private readonly AcargroupDbContext _context;

    public CustomerService(AcargroupDbContext context)
    {
        _context = context;
    }

    public async Task<CustomerDto> RegisterAsync(CustomerRegisterDto dto)
    {
        // Check if email already exists
        var existingCustomer = await _context.Customers
            .FirstOrDefaultAsync(c => c.Email == dto.Email);

        if (existingCustomer != null)
        {
            throw new InvalidOperationException("Bu email adresi zaten kayıtlı.");
        }

        // Create password hash
        CreatePasswordHash(dto.Password, out byte[] passwordHash, out byte[] passwordSalt);

        // Create customer entity
        var customer = new Customer
        {
            FullName = dto.FullName,
            Email = dto.Email,
            Phone = dto.Phone,
            TC = dto.TC,
            VKN = dto.VKN,
            PasswordHash = passwordHash,
            PasswordSalt = passwordSalt,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            IsAdmin = dto.IsAdmin
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        return MapToDto(customer);
    }

    public async Task<CustomerDto?> GetByEmailAsync(string email)
    {
        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.Email == email);

        return customer != null ? MapToDto(customer) : null;
    }

    public async Task<List<CustomerDto>> GetAllAsync()
    {
        var customers = await _context.Customers
            .Include(c => c.Addresses)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return customers.Select(MapToDto).ToList();
    }

    public async Task<List<CustomerDto>> GetActiveAsync()
    {
        var customers = await _context.Customers
            .Include(c => c.Addresses)
            .Where(c => c.IsActive == true)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return customers.Select(MapToDto).ToList();
    }

    public async Task<List<CustomerDto>> GetInactiveAsync()
    {
        var customers = await _context.Customers
            .Include(c => c.Addresses)
            .Where(c => c.IsActive == false)
            .OrderByDescending(c => c.UpdatedAt ?? c.CreatedAt)
            .ToListAsync();

        return customers.Select(MapToDto).ToList();
    }

    public async Task<CustomerDto> CreateAsync(CustomerCreateDto dto)
    {
        // Check if email already exists
        var existingCustomer = await _context.Customers
            .FirstOrDefaultAsync(c => c.Email == dto.Email);

        if (existingCustomer != null)
        {
            throw new InvalidOperationException("Bu email adresi zaten kayıtlı.");
        }

        // Create password hash (use provided password or auto-generate)
        CreatePasswordHash(dto.Password, out byte[] passwordHash, out byte[] passwordSalt);

        // Create customer entity
        var customer = new Customer
        {
            FullName = dto.FullName,
            Email = dto.Email,
            Phone = dto.Phone,
            TC = dto.TC,
            VKN = dto.VKN,
            PasswordHash = passwordHash,
            PasswordSalt = passwordSalt,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            IsAdmin = false // Default to non-admin
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        // Create address if provided
        if (!string.IsNullOrWhiteSpace(dto.City) || !string.IsNullOrWhiteSpace(dto.FullAddress))
        {
            var address = new CustomerAddress
            {
                CustomerId = customer.Id,
                Label = dto.AddressLabel ?? "Ev",
                City = dto.City ?? "",
                District = dto.District ?? "",
                FullAddress = dto.FullAddress ?? "",
                IsDefault = true,
                CreatedAt = DateTime.UtcNow
            };
            _context.CustomerAddresses.Add(address);
            await _context.SaveChangesAsync();
        }

        return MapToDto(customer);
    }

    public async Task<CustomerDto> UpdateAsync(int id, CustomerUpdateDto dto)
    {
        var customer = await _context.Customers.FindAsync(id);
        if (customer == null)
        {
            throw new KeyNotFoundException("Müşteri bulunamadı.");
        }

        customer.FullName = dto.FullName;
        customer.Email = dto.Email;
        customer.Phone = dto.Phone;
        customer.TC = dto.TC;
        customer.VKN = dto.VKN;
        customer.IsActive = dto.IsActive;
        customer.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(customer);
    }

    public async Task DeleteAsync(int id)
    {
        var customer = await _context.Customers.FindAsync(id);
        if (customer == null)
        {
            throw new KeyNotFoundException("Müşteri bulunamadı.");
        }

        // Soft delete - just deactivate
        customer.IsActive = false;
        customer.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    public async Task ChangePasswordAsync(int customerId, ChangePasswordDto dto)
    {
        var customer = await _context.Customers.FindAsync(customerId);
        if (customer == null)
        {
            throw new KeyNotFoundException("Kullanıcı bulunamadı.");
        }

        if (!VerifyPasswordHash(dto.OldPassword, customer.PasswordHash, customer.PasswordSalt))
        {
            throw new UnauthorizedAccessException("Mevcut şifre hatalı.");
        }

        CreatePasswordHash(dto.NewPassword, out byte[] passwordHash, out byte[] passwordSalt);

        customer.PasswordHash = passwordHash;
        customer.PasswordSalt = passwordSalt;
        customer.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    private static void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
    {
        using var hmac = new HMACSHA512();
        passwordSalt = hmac.Key;
        passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
    }

    public static bool VerifyPasswordHash(string password, byte[] storedHash, byte[] storedSalt)
    {
        using var hmac = new HMACSHA512(storedSalt);
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        return computedHash.SequenceEqual(storedHash);
    }

    private static CustomerDto MapToDto(Customer customer)
    {
        return new CustomerDto
        {
            Id = customer.Id,
            FullName = customer.FullName,
            Email = customer.Email,
            Phone = customer.Phone,
            TC = customer.TC,
            VKN = customer.VKN,
            CreatedAt = customer.CreatedAt,
            IsActive = customer.IsActive,
            IsAdmin = customer.IsAdmin,
            DefaultAddress = customer.Addresses.FirstOrDefault(a => a.IsDefault)?.FullAddress 
                           ?? customer.Addresses.FirstOrDefault()?.FullAddress
        };
    }
}
