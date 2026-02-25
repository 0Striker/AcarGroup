using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Entities;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Services;

public class HistoryService : IHistoryService
{
    private readonly AcargroupDbContext _context;

    public HistoryService(AcargroupDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<HistoryDto>> GetAllAsync()
    {
        return await _context.Histories
            .OrderBy(h => h.Years) // Order by Years
            .Select(h => new HistoryDto
            {
                Id = h.Id,
                Years = h.Years,
                Title = h.Title,
                Description = h.Description,
                Icon = h.Icon,
                CreatedAt = h.CreatedAt,
                UpdatedAt = h.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<HistoryDto?> GetByIdAsync(int id)
    {
        var h = await _context.Histories.FindAsync(id);
        if (h == null) return null;

        return new HistoryDto
        {
            Id = h.Id,
            Years = h.Years,
            Title = h.Title,
            Description = h.Description,
            Icon = h.Icon,
            CreatedAt = h.CreatedAt,
            UpdatedAt = h.UpdatedAt
        };
    }

    public async Task<HistoryDto> AddAsync(HistoryCreateUpdateDto dto)
    {
        var entity = new History
        {
            Years = dto.Years,
            Title = dto.Title,
            Description = dto.Description,
            Icon = dto.Icon,
            CreatedAt = DateTime.UtcNow
        };

        _context.Histories.Add(entity);
        await _context.SaveChangesAsync();

        return new HistoryDto
        {
            Id = entity.Id,
            Years = entity.Years,
            Title = entity.Title,
            Description = entity.Description,
            Icon = entity.Icon,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }

    public async Task UpdateAsync(int id, HistoryCreateUpdateDto dto)
    {
        var entity = await _context.Histories.FindAsync(id);
        if (entity == null) throw new Exception("History not found");

        entity.Years = dto.Years;
        entity.Title = dto.Title;
        entity.Description = dto.Description;
        entity.Icon = dto.Icon;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _context.Histories.FindAsync(id);
        if (entity != null)
        {
            _context.Histories.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}
