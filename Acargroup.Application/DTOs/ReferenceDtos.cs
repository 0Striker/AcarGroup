namespace Acargroup.Application.DTOs;

public class ReferenceDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? LogoUrl { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? Description { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsFeatured { get; set; }
}

public class ReferenceAdminCreateUpdateDto
{
    public string Name { get; set; } = null!;
    public string? LogoUrl { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? Description { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public bool IsFeatured { get; set; }
}

public class ReferenceAdminListDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? LogoUrl { get; set; }
    public string? WebsiteUrl { get; set; }
    public bool IsActive { get; set; }
    public bool IsFeatured { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; }
}
