using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Services;

public class CustomerPurchasedProductService : ICustomerPurchasedProductService
{
    private readonly AcargroupDbContext _context;

    public CustomerPurchasedProductService(AcargroupDbContext context)
    {
        _context = context;
    }

    public async Task<List<CustomerPurchasedProductDto>> GetByCustomerAsync(int customerId)
    {
        var products = await _context.CustomerPurchasedProducts
            .Where(p => p.CustomerId == customerId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return products.Select(p => new CustomerPurchasedProductDto
        {
            Id = p.Id,
            CustomerId = p.CustomerId,
            JobId = p.JobId,
            ProductId = p.ProductId,
            ProductName = p.ProductName,
            Quantity = p.Quantity,
            UnitPrice = p.UnitPrice,
            TotalPrice = p.TotalPrice,
            SerialNumber = p.SerialNumber,
            Notes = p.Notes,
            CreatedAt = p.CreatedAt // Assuming BaseEntity has CreatedAt, mapped in DbContext
        }).ToList();
    }

    public async Task<CustomerPurchasedProductDto> CreateAsync(int customerId, CustomerPurchasedProductCreateDto dto)
    {
        var product = new Domain.Entities.CustomerPurchasedProduct
        {
            CustomerId = customerId,
            JobId = dto.JobId,
            ProductId = dto.ProductId,
            ProductName = dto.ProductName,
            Quantity = dto.Quantity,
            UnitPrice = dto.UnitPrice,
            TotalPrice = dto.Quantity * dto.UnitPrice,
            SerialNumber = dto.SerialNumber,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };

        _context.CustomerPurchasedProducts.Add(product);
        await _context.SaveChangesAsync();

        return new CustomerPurchasedProductDto
        {
            Id = product.Id,
            CustomerId = product.CustomerId,
            JobId = product.JobId,
            ProductId = product.ProductId,
            ProductName = product.ProductName,
            Quantity = product.Quantity,
            UnitPrice = product.UnitPrice,
            TotalPrice = product.TotalPrice,
            SerialNumber = product.SerialNumber,
            Notes = product.Notes,
            CreatedAt = product.CreatedAt
        };
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var product = await _context.CustomerPurchasedProducts.FindAsync(id);
        if (product == null) return false;

        _context.CustomerPurchasedProducts.Remove(product);
        await _context.SaveChangesAsync();
        return true;
    }
}
