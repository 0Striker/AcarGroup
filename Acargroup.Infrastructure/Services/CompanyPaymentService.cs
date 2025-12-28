using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Entities;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Services;

public class CompanyPaymentService : ICompanyPaymentService
{
    private readonly AcargroupDbContext _context;

    public CompanyPaymentService(AcargroupDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CompanyPaymentDto>> GetAllAsync()
    {
        return await _context.CompanyPayments
            .OrderByDescending(cp => cp.PaymentDate)
            .Select(cp => new CompanyPaymentDto
            {
                Id = cp.Id,
                CompanyName = cp.CompanyName,
                Amount = cp.Amount,
                PaymentDate = cp.PaymentDate,
                Description = cp.Description,
                PaymentMethod = cp.PaymentMethod,
                ReferenceNumber = cp.ReferenceNumber,
                Notes = cp.Notes,
                Category = cp.Category,
                CreatedAt = cp.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<CompanyPaymentDto?> GetByIdAsync(int id)
    {
        var payment = await _context.CompanyPayments.FindAsync(id);
        if (payment == null) return null;

        return new CompanyPaymentDto
        {
            Id = payment.Id,
            CompanyName = payment.CompanyName,
            Amount = payment.Amount,
            PaymentDate = payment.PaymentDate,
            Description = payment.Description,
            PaymentMethod = payment.PaymentMethod,
            ReferenceNumber = payment.ReferenceNumber,
            Notes = payment.Notes,
            Category = payment.Category,
            CreatedAt = payment.CreatedAt
        };
    }

    public async Task<CompanyPaymentDto> CreateAsync(CompanyPaymentCreateDto dto)
    {
        var payment = new CompanyPayment
        {
            CompanyName = dto.CompanyName,
            Amount = dto.Amount,
            PaymentDate = dto.PaymentDate,
            Description = dto.Description,
            PaymentMethod = dto.PaymentMethod,
            ReferenceNumber = dto.ReferenceNumber,
            Notes = dto.Notes,
            Category = dto.Category,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.CompanyPayments.Add(payment);
        await _context.SaveChangesAsync();

        return new CompanyPaymentDto
        {
            Id = payment.Id,
            CompanyName = payment.CompanyName,
            Amount = payment.Amount,
            PaymentDate = payment.PaymentDate,
            Description = payment.Description,
            PaymentMethod = payment.PaymentMethod,
            ReferenceNumber = payment.ReferenceNumber,
            Notes = payment.Notes,
            Category = payment.Category,
            CreatedAt = payment.CreatedAt
        };
    }

    public async Task<CompanyPaymentDto?> UpdateAsync(int id, CompanyPaymentUpdateDto dto)
    {
        var payment = await _context.CompanyPayments.FindAsync(id);
        if (payment == null) return null;

        payment.CompanyName = dto.CompanyName;
        payment.Amount = dto.Amount;
        payment.PaymentDate = dto.PaymentDate;
        payment.Description = dto.Description;
        payment.PaymentMethod = dto.PaymentMethod;
        payment.ReferenceNumber = dto.ReferenceNumber;
        payment.Notes = dto.Notes;
        payment.Category = dto.Category;
        payment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new CompanyPaymentDto
        {
            Id = payment.Id,
            CompanyName = payment.CompanyName,
            Amount = payment.Amount,
            PaymentDate = payment.PaymentDate,
            Description = payment.Description,
            PaymentMethod = payment.PaymentMethod,
            ReferenceNumber = payment.ReferenceNumber,
            Notes = payment.Notes,
            Category = payment.Category,
            CreatedAt = payment.CreatedAt
        };
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var payment = await _context.CompanyPayments.FindAsync(id);
        if (payment == null) return false;

        _context.CompanyPayments.Remove(payment);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<decimal> GetTotalAmountAsync()
    {
        return await _context.CompanyPayments.SumAsync(cp => cp.Amount);
    }
}
