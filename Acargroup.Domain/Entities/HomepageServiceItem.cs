using Acargroup.Domain.Common;

namespace Acargroup.Domain.Entities;

public class HomepageServiceItem : BaseEntity
{
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string DetailedDescription { get; set; } = null!;
    public string Icon { get; set; } = null!; // Storing Emoji as string
    public int DisplayOrder { get; set; }
}
