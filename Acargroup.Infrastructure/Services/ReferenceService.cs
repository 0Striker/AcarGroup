using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Services;

public class ReferenceService : IReferenceService
{
    private readonly AcargroupDbContext _context;

    public ReferenceService(AcargroupDbContext context)
    {
        _context = context;
    }

    public async Task<List<ReferenceDto>> GetAllActiveAsync()
    {
        return await _context.References
            .Where(r => r.IsActive)
            .OrderBy(r => r.DisplayOrder)
            .ThenByDescending(r => r.CreatedAt)
            .Select(r => new ReferenceDto
            {
                Id = r.Id,
                Name = r.Name,
                LogoUrl = r.LogoUrl,
                WebsiteUrl = r.WebsiteUrl,
                Description = r.Description,
                DisplayOrder = r.DisplayOrder,
                IsFeatured = r.IsFeatured
            })
            .ToListAsync();
    }
}
