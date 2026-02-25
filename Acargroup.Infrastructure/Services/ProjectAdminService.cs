using System.Text.Json;
using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Entities;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Services;

public class ProjectAdminService : IProjectAdminService
{
    private readonly AcargroupDbContext _context;

    public ProjectAdminService(AcargroupDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProjectAdminListDto>> GetAllAsync()
    {
        return await _context.Projects
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProjectAdminListDto
            {
                Id = p.Id,
                Title = p.Title,
                Slug = p.Slug,
                Status = p.Status,
                City = p.City,
                ClientName = p.ClientName,
                IsFeatured = p.IsFeatured,
                IsActive = p.IsActive,
                DisplayOrder = p.DisplayOrder,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<ProjectDetailDto?> GetByIdAsync(int id)
    {
        var project = await _context.Projects.FindAsync(id);
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

    public async Task<int> CreateAsync(ProjectAdminCreateUpdateDto dto)
    {
        // Check slug uniqueness
        if (await _context.Projects.AnyAsync(p => p.Slug == dto.Slug))
        {
            throw new InvalidOperationException($"Slug '{dto.Slug}' already exists.");
        }

        var project = new Project
        {
            Title = dto.Title,
            Slug = dto.Slug,
            Status = dto.Status,
            City = dto.City,
            District = dto.District,
            ClientName = dto.ClientName,
            StartDate = dto.StartDate.HasValue ? DateTime.SpecifyKind(dto.StartDate.Value, DateTimeKind.Utc) : null,
            EndDate = dto.EndDate.HasValue ? DateTime.SpecifyKind(dto.EndDate.Value, DateTimeKind.Utc) : null,
            ShortDescription = dto.ShortDescription,
            LongDescription = dto.LongDescription,
            HeroImageUrl = dto.HeroImageUrl,
            GalleryImageUrlsJson = dto.GalleryImageUrls != null 
                ? JsonSerializer.Serialize(dto.GalleryImageUrls) 
                : null,
            DisplayOrder = dto.DisplayOrder,
            IsFeatured = dto.IsFeatured,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        return project.Id;
    }

    public async Task UpdateAsync(int id, ProjectAdminCreateUpdateDto dto)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project == null)
        {
            throw new KeyNotFoundException($"Project with ID {id} not found.");
        }

        // Check slug uniqueness if changed
        if (project.Slug != dto.Slug && await _context.Projects.AnyAsync(p => p.Slug == dto.Slug))
        {
            throw new InvalidOperationException($"Slug '{dto.Slug}' already exists.");
        }

        project.Title = dto.Title;
        project.Slug = dto.Slug;
        project.Status = dto.Status;
        project.City = dto.City;
        project.District = dto.District;
        project.ClientName = dto.ClientName;
        project.StartDate = dto.StartDate.HasValue ? DateTime.SpecifyKind(dto.StartDate.Value, DateTimeKind.Utc) : null;
        project.EndDate = dto.EndDate.HasValue ? DateTime.SpecifyKind(dto.EndDate.Value, DateTimeKind.Utc) : null;
        project.ShortDescription = dto.ShortDescription;
        project.LongDescription = dto.LongDescription;
        project.HeroImageUrl = dto.HeroImageUrl;
        project.GalleryImageUrlsJson = dto.GalleryImageUrls != null 
            ? JsonSerializer.Serialize(dto.GalleryImageUrls) 
            : null;
        project.DisplayOrder = dto.DisplayOrder;
        project.IsFeatured = dto.IsFeatured;
        project.IsActive = dto.IsActive;
        project.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project == null)
        {
            throw new KeyNotFoundException($"Project with ID {id} not found.");
        }

        // Soft delete
        project.IsActive = false;
        project.UpdatedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
    }
}
