using System.ComponentModel.DataAnnotations;

namespace Acargroup.Application.DTOs;

public class CreateProductDto
{
    [Required]
    public string Name { get; set; } = null!;
    
    public string? Description { get; set; }
    
    [Required]
    public decimal Price { get; set; }
    
    public bool IsActive { get; set; } = true;

    public bool IsFeatured { get; set; }

    public string? ImageUrl { get; set; } // Cloudinary image URL
    
    [Required]
    public int CategoryId { get; set; }
}
