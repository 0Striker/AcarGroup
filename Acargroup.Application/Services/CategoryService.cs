using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Entities;

namespace Acargroup.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;

    public CategoryService(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<List<CategoryDto>> GetAllAsync()
    {
        var categories = await _categoryRepository.GetAllAsync();
        return categories.Select(MapToDto).ToList();
    }

    public async Task<CategoryDto?> GetByIdAsync(int id)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        return category == null ? null : MapToDto(category);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
    {
        var category = new Category
        {
            Name = dto.Name,
            Description = dto.Description
        };

        await _categoryRepository.AddAsync(category);
        return MapToDto(category);
    }

    public async Task<CategoryDto?> UpdateAsync(int id, UpdateCategoryDto dto)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        if (category == null)
            return null;

        category.Name = dto.Name;
        category.Description = dto.Description;

        await _categoryRepository.UpdateAsync(category);
        return MapToDto(category);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        if (category == null)
            return false;

        await _categoryRepository.DeleteAsync(category);
        return true;
    }

    private static CategoryDto MapToDto(Category category)
    {
        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            CreatedAt = category.CreatedAt,
            UpdatedAt = category.UpdatedAt
        };
    }
}
