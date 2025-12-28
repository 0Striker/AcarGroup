using Acargroup.Domain.Common;
using Acargroup.Domain.Enums;

namespace Acargroup.Domain.Entities;

public class ServiceItem : BaseEntity
{
    public int CustomerId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Status { get; set; } = ServiceItemStatus.Pending.ToString();
    public string? AdminNote { get; set; }
    public string? PhotoPath { get; set; }
    
    public Customer Customer { get; set; } = null!;
    public ICollection<ServiceItemStatusHistory> StatusHistories { get; set; } = new List<ServiceItemStatusHistory>();
}
