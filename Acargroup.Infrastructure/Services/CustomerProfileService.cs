using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Services;

public class CustomerProfileService : ICustomerProfileService
{
    private readonly AcargroupDbContext _context;

    public CustomerProfileService(AcargroupDbContext context)
    {
        _context = context;
    }

    public async Task<CustomerProfileDto?> GetProfileAsync(int customerId)
    {
        var customer = await _context.Customers.FindAsync(customerId);
        if (customer == null)
        {
            return null;
        }

        return new CustomerProfileDto
        {
            Id = customer.Id,
            FullName = customer.FullName,
            Email = customer.Email,
            Phone = customer.Phone
        };
    }

    public async Task<CustomerProfileDto?> UpdateProfileAsync(int customerId, CustomerProfileUpdateDto dto)
    {
        var customer = await _context.Customers.FindAsync(customerId);
        if (customer == null)
        {
            return null;
        }

        customer.FullName = dto.FullName;
        if (!string.IsNullOrWhiteSpace(dto.Phone))
        {
            customer.Phone = dto.Phone;
        }
        customer.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new CustomerProfileDto
        {
            Id = customer.Id,
            FullName = customer.FullName,
            Email = customer.Email,
            Phone = customer.Phone
        };
    }
}
