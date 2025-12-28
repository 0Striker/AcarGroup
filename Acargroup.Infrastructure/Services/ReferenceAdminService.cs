using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Entities;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Services;

public class ReferenceAdminService : IReferenceAdminService
{
    private readonly AcargroupDbContext _context;

    public ReferenceAdminService(AcargroupDbContext context)
    {
        _context = context;
    }

    public async Task<List<ReferenceAdminListDto>> GetAllAsync()
    {
        return await _context.References
            .OrderBy(r => r.DisplayOrder)
            .ThenByDescending(r => r.CreatedAt)
            .Select(r => new ReferenceAdminListDto
            {
                Id = r.Id,
                Name = r.Name,
                LogoUrl = r.LogoUrl,
                WebsiteUrl = r.WebsiteUrl,
                IsActive = r.IsActive,
                IsFeatured = r.IsFeatured,
                DisplayOrder = r.DisplayOrder,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<ReferenceDto?> GetByIdAsync(int id)
    {
        var reference = await _context.References.FindAsync(id);
        if (reference == null) return null;

        return new ReferenceDto
        {
            Id = reference.Id,
            Name = reference.Name,
            LogoUrl = reference.LogoUrl,
            WebsiteUrl = reference.WebsiteUrl,
            Description = reference.Description,
            DisplayOrder = reference.DisplayOrder,
            IsFeatured = reference.IsFeatured
        };
    }

    public async Task<int> CreateAsync(ReferenceAdminCreateUpdateDto dto)
    {
        var reference = new Reference
        {
            Name = dto.Name,
            LogoUrl = dto.LogoUrl,
            WebsiteUrl = dto.WebsiteUrl,
            Description = dto.Description,
            DisplayOrder = dto.DisplayOrder,
            IsActive = dto.IsActive,
            IsFeatured = dto.IsFeatured,
            CreatedAt = DateTime.UtcNow
        };

        _context.References.Add(reference);
        await _context.SaveChangesAsync();

        return reference.Id;
    }

    public async Task UpdateAsync(int id, ReferenceAdminCreateUpdateDto dto)
    {
        var reference = await _context.References.FindAsync(id);
        if (reference == null)
        {
            throw new KeyNotFoundException($"Reference with ID {id} not found.");
        }

        reference.Name = dto.Name;
        reference.LogoUrl = dto.LogoUrl;
        reference.WebsiteUrl = dto.WebsiteUrl;
        reference.Description = dto.Description;
        reference.DisplayOrder = dto.DisplayOrder;
        reference.IsActive = dto.IsActive;
        reference.IsFeatured = dto.IsFeatured;
        reference.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var reference = await _context.References.FindAsync(id);
        if (reference == null)
        {
            throw new KeyNotFoundException($"Reference with ID {id} not found.");
        }

        // Hard delete
        _context.References.Remove(reference);
        await _context.SaveChangesAsync();
    }
}
