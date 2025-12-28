using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Entities;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Services;

public class CustomerAddressService : ICustomerAddressService
{
    private readonly AcargroupDbContext _context;

    public CustomerAddressService(AcargroupDbContext context)
    {
        _context = context;
    }

    public async Task<List<CustomerAddressDto>> GetByCustomerAsync(int customerId)
    {
        var addresses = await _context.CustomerAddresses
            .Where(a => a.CustomerId == customerId)
            .OrderByDescending(a => a.IsDefault)
            .ThenByDescending(a => a.CreatedAt)
            .ToListAsync();

        return addresses.Select(MapToDto).ToList();
    }

    public async Task<CustomerAddressDto> CreateAsync(int customerId, CustomerAddressCreateUpdateDto dto)
    {
        // If this is default, unset other defaults
        if (dto.IsDefault)
        {
            await UnsetDefaultAddresses(customerId);
        }

        var address = new CustomerAddress
        {
            CustomerId = customerId,
            Label = dto.Label,
            City = dto.City,
            District = dto.District,
            FullAddress = dto.FullAddress,
            PostalCode = dto.PostalCode,
            IsDefault = dto.IsDefault,
            CreatedAt = DateTime.UtcNow
        };

        _context.CustomerAddresses.Add(address);
        await _context.SaveChangesAsync();

        return MapToDto(address);
    }

    public async Task<CustomerAddressDto> UpdateAsync(int customerId, int addressId, CustomerAddressCreateUpdateDto dto)
    {
        var address = await _context.CustomerAddresses
            .FirstOrDefaultAsync(a => a.Id == addressId && a.CustomerId == customerId);

        if (address == null)
        {
            throw new InvalidOperationException("Adres bulunamadı veya bu müşteriye ait değil.");
        }

        // If this is being set as default, unset other defaults
        if (dto.IsDefault && !address.IsDefault)
        {
            await UnsetDefaultAddresses(customerId);
        }

        address.Label = dto.Label;
        address.City = dto.City;
        address.District = dto.District;
        address.FullAddress = dto.FullAddress;
        address.PostalCode = dto.PostalCode;
        address.IsDefault = dto.IsDefault;
        address.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDto(address);
    }

    public async Task DeleteAsync(int customerId, int addressId)
    {
        var address = await _context.CustomerAddresses
            .FirstOrDefaultAsync(a => a.Id == addressId && a.CustomerId == customerId);

        if (address == null)
        {
            throw new InvalidOperationException("Adres bulunamadı veya bu müşteriye ait değil.");
        }

        _context.CustomerAddresses.Remove(address);
        await _context.SaveChangesAsync();
    }

    private async Task UnsetDefaultAddresses(int customerId)
    {
        var defaultAddresses = await _context.CustomerAddresses
            .Where(a => a.CustomerId == customerId && a.IsDefault)
            .ToListAsync();

        foreach (var addr in defaultAddresses)
        {
            addr.IsDefault = false;
        }
    }

    private static CustomerAddressDto MapToDto(CustomerAddress address)
    {
        return new CustomerAddressDto
        {
            Id = address.Id,
            Label = address.Label,
            City = address.City,
            District = address.District,
            FullAddress = address.FullAddress,
            PostalCode = address.PostalCode,
            IsDefault = address.IsDefault
        };
    }
}
