using Acargroup.Domain.Common;

namespace Acargroup.Domain.Entities;

public class History : BaseEntity
{
    public string Years { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Icon { get; set; } = null!; // Storing icon name as string
}
