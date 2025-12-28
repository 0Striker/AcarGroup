using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Services;

public class AdminService : IAdminService
{
    private readonly AcargroupDbContext _context;

    public AdminService(AcargroupDbContext context)
    {
        _context = context;
    }

    public async Task<AdminSummaryDto> GetSummaryAsync()
    {
        var totalProducts = await _context.Products.CountAsync();
        var totalCategories = await _context.Categories.CountAsync();
        var totalProjectRequests = await _context.ProjectRequests.CountAsync();
        var totalReferences = await _context.References.CountAsync();
        var totalBrands = await _context.Brands.CountAsync();
        var totalProjects = await _context.Projects.CountAsync();
        
        // Note: Customer entity doesn't exist yet, returning 0 for now
        var totalCustomers = 0;

        return new AdminSummaryDto
        {
            TotalProducts = totalProducts,
            TotalCategories = totalCategories,
            TotalProjectRequests = totalProjectRequests,
            TotalCustomers = totalCustomers,
            TotalReferences = totalReferences,
            TotalBrands = totalBrands,
            TotalProjects = totalProjects
        };
    }
}
