namespace Acargroup.Application.DTOs;

public class ProjectListDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string Status { get; set; } = null!;
    public string? City { get; set; }
    public string? District { get; set; }
    public string? ClientName { get; set; }
    public string? HeroImageUrl { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsFeatured { get; set; }
}

public class ProjectDetailDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string Status { get; set; } = null!;
    public string? City { get; set; }
    public string? District { get; set; }
    public string? ClientName { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? ShortDescription { get; set; }
    public string? LongDescription { get; set; }
    public string? HeroImageUrl { get; set; }
    public List<string> GalleryImageUrls { get; set; } = new();
    public bool IsFeatured { get; set; }
}

public class ProjectAdminCreateUpdateDto
{
    public string Title { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string Status { get; set; } = null!;
    public string? City { get; set; }
    public string? District { get; set; }
    public string? ClientName { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? ShortDescription { get; set; }
    public string? LongDescription { get; set; }
    public string? HeroImageUrl { get; set; }
    public List<string>? GalleryImageUrls { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; }
}

public class ProjectAdminListDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string Status { get; set; } = null!;
    public string? City { get; set; }
    public string? ClientName { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; }
}
