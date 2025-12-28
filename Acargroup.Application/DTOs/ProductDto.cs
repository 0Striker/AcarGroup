namespace Acargroup.Application.DTOs;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; }
    public bool IsFeatured { get; set; }
    public string? ImageUrl { get; set; } // Cloudinary image URL
    public int CategoryId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
