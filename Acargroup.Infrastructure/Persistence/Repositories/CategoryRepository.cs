using Acargroup.Application.Interfaces;
using Acargroup.Domain.Entities;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Persistence.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly AcargroupDbContext _context;

    public CategoryRepository(AcargroupDbContext context)
    {
        _context = context;
    }

    public async Task<List<Category>> GetAllAsync()
    {
        return await _context.Categories.ToListAsync();
    }

    public async Task<Category?> GetByIdAsync(int id)
    {
        return await _context.Categories.FindAsync(id);
    }

    public async Task AddAsync(Category category)
    {
        category.CreatedAt = DateTime.UtcNow;
        await _context.Categories.AddAsync(category);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Category category)
    {
        category.UpdatedAt = DateTime.UtcNow;
        _context.Categories.Update(category);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Category category)
    {
        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
    }
}
