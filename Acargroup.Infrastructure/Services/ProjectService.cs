using System.Text.Json;
using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Services;

public class ProjectService : IProjectService
{
    private readonly AcargroupDbContext _context;

    public ProjectService(AcargroupDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProjectListDto>> GetByStatusAsync(string status)
    {
        return await _context.Projects
            .Where(p => p.Status == status && p.IsActive)
            .OrderBy(p => p.DisplayOrder)
            .ThenByDescending(p => p.CreatedAt)
            .Select(p => new ProjectListDto
            {
                Id = p.Id,
                Title = p.Title,
                Slug = p.Slug,
                Status = p.Status,
                City = p.City,
                District = p.District,
                ClientName = p.ClientName,
                HeroImageUrl = p.HeroImageUrl,
                DisplayOrder = p.DisplayOrder,
                IsFeatured = p.IsFeatured
            })
            .ToListAsync();
    }

    public async Task<List<ProjectListDto>> GetFeaturedAsync(int take)
    {
        return await _context.Projects
            .Where(p => p.IsFeatured && p.IsActive)
            .OrderBy(p => p.DisplayOrder)
            .ThenByDescending(p => p.CreatedAt)
            .Take(take)
            .Select(p => new ProjectListDto
            {
                Id = p.Id,
                Title = p.Title,
                Slug = p.Slug,
                Status = p.Status,
                City = p.City,
                District = p.District,
                ClientName = p.ClientName,
                HeroImageUrl = p.HeroImageUrl,
                DisplayOrder = p.DisplayOrder,
                IsFeatured = p.IsFeatured
            })
            .ToListAsync();
    }

    public async Task<ProjectDetailDto?> GetBySlugAsync(string slug)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Slug == slug && p.IsActive);

        if (project == null) return null;

        var galleryImages = !string.IsNullOrEmpty(project.GalleryImageUrlsJson)
            ? JsonSerializer.Deserialize<List<string>>(project.GalleryImageUrlsJson) ?? new List<string>()
            : new List<string>();

        return new ProjectDetailDto
        {
            Id = project.Id,
            Title = project.Title,
            Slug = project.Slug,
            Status = project.Status,
            City = project.City,
            District = project.District,
            ClientName = project.ClientName,
            StartDate = project.StartDate,
            EndDate = project.EndDate,
            ShortDescription = project.ShortDescription,
            LongDescription = project.LongDescription,
            HeroImageUrl = project.HeroImageUrl,
            GalleryImageUrls = galleryImages,
            IsFeatured = project.IsFeatured
        };
    }
}
