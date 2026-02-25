using Acargroup.Domain.Common;

namespace Acargroup.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; }
    public bool IsFeatured { get; set; } = false;
    public string? ImageUrl { get; set; } // Cloudinary image URL
    
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
}
