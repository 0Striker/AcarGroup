using Acargroup.Domain.Common;

namespace Acargroup.Domain.Entities;

public class Reference : BaseEntity
{
    public string Name { get; set; } = null!;
    public string? LogoUrl { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? Description { get; set; }
    public int DisplayOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; } = false;
}
