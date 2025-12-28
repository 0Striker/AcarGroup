using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Entities;

namespace Acargroup.Application.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;

    public ProductService(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<List<ProductDto>> GetAllAsync()
    {
        var products = await _productRepository.GetAllAsync();
        return products.Select(MapToDto).ToList();
    }

    public async Task<ProductDto?> GetByIdAsync(int id)
    {
        var product = await _productRepository.GetByIdAsync(id);
        return product == null ? null : MapToDto(product);
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            IsActive = dto.IsActive,
            IsFeatured = dto.IsFeatured,
            ImageUrl = dto.ImageUrl,
            CategoryId = dto.CategoryId
        };

        await _productRepository.AddAsync(product);
        return MapToDto(product);
    }

    public async Task<ProductDto?> UpdateAsync(int id, UpdateProductDto dto)
    {
        var product = await _productRepository.GetByIdAsync(id);
        if (product == null)
            return null;

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.IsActive = dto.IsActive;
        product.IsFeatured = dto.IsFeatured;
        product.ImageUrl = dto.ImageUrl;
        product.CategoryId = dto.CategoryId;

        await _productRepository.UpdateAsync(product);
        return MapToDto(product);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var product = await _productRepository.GetByIdAsync(id);
        if (product == null)
            return false;

        await _productRepository.DeleteAsync(product);
        return true;
    }

    private static ProductDto MapToDto(Product product)
    {
        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            IsActive = product.IsActive,
            IsFeatured = product.IsFeatured,
            ImageUrl = product.ImageUrl,
            CategoryId = product.CategoryId,
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt
        };
    }
}
