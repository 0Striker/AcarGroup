using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Entities;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Services;

public class InternetApplicationService : IInternetApplicationService
{
    private readonly AcargroupDbContext _context;

    public InternetApplicationService(AcargroupDbContext context)
    {
        _context = context;
    }

    public async Task<List<InternetApplicationDto>> GetAllAsync()
    {
        var apps = await _context.InternetApplications
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return apps.Select(MapToDto).ToList();
    }

    public async Task<InternetApplicationDto?> GetByIdAsync(int id)
    {
        var app = await _context.InternetApplications.FindAsync(id);
        return app == null ? null : MapToDto(app);
    }

    public async Task<InternetApplicationDto> CreateAsync(CreateInternetApplicationDto createDto)
    {
        var app = new InternetApplication
        {
            FullName = createDto.FullName,
            PhoneNumber = createDto.PhoneNumber,
            Address = createDto.Address,
            Status = 0, // Yeni
            CreatedAt = DateTime.UtcNow
        };

        _context.InternetApplications.Add(app);
        await _context.SaveChangesAsync();

        return MapToDto(app);
    }

    public async Task<bool> UpdateStatusAsync(int id, int status)
    {
        var app = await _context.InternetApplications.FindAsync(id);
        if (app == null) return false;

        app.Status = status;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var app = await _context.InternetApplications.FindAsync(id);
        if (app == null) return false;

        _context.InternetApplications.Remove(app);
        await _context.SaveChangesAsync();
        return true;
    }

    private static InternetApplicationDto MapToDto(InternetApplication app)
    {
        return new InternetApplicationDto
        {
            Id = app.Id,
            FullName = app.FullName,
            PhoneNumber = app.PhoneNumber,
            Address = app.Address,
            Status = app.Status,
            CreatedAt = app.CreatedAt
        };
    }
}
