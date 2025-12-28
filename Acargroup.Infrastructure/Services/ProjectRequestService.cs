using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Entities;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Services;

public class ProjectRequestService : IProjectRequestService
{
    private readonly AcargroupDbContext _context;

    public ProjectRequestService(AcargroupDbContext context)
    {
        _context = context;
    }

    public async Task<ProjectRequest> CreateAsync(ProjectRequestCreateDto dto)
    {
        var projectRequest = new ProjectRequest
        {
            ProjectType = dto.ServiceType,
            City = dto.City,
            District = dto.District,
            Phone = dto.Phone,
            FullName = dto.FullName,
            Address = dto.Address,
            CreatedAt = DateTime.UtcNow
        };

        _context.ProjectRequests.Add(projectRequest);
        await _context.SaveChangesAsync();

        return projectRequest;
    }

    public async Task<List<ProjectRequest>> GetAllAsync()
    {
        return await _context.ProjectRequests
            .OrderByDescending(pr => pr.CreatedAt)
            .ToListAsync();
    }
}
