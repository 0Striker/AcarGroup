using Acargroup.Domain.Common;

namespace Acargroup.Domain.Entities;

public class ServiceItemStatusHistory : BaseEntity
{
    public int ServiceItemId { get; set; }
    public string Status { get; set; } = null!;
    public string? Note { get; set; }
    public string ChangedBy { get; set; } = null!;

    public ServiceItem ServiceItem { get; set; } = null!;
}
