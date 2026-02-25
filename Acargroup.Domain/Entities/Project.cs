using Acargroup.Domain.Common;

namespace Acargroup.Domain.Entities;

public class Project : BaseEntity
{
    public string Title { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string Status { get; set; } = "Active"; // "Active", "Completed"
    public string? City { get; set; }
    public string? District { get; set; }
    public string? ClientName { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? ShortDescription { get; set; }
    public string? LongDescription { get; set; }
    public string? HeroImageUrl { get; set; }
    public string? GalleryImageUrlsJson { get; set; } // JSON string for gallery images
    public int DisplayOrder { get; set; } = 0;
    public bool IsFeatured { get; set; } = false;
    public bool IsActive { get; set; } = true;
}
