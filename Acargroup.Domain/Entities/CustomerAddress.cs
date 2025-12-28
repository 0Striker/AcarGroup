using Acargroup.Domain.Common;

namespace Acargroup.Domain.Entities;

public class CustomerAddress : BaseEntity
{
    public int CustomerId { get; set; }
    public string Label { get; set; } = null!; // "Ev", "İş", "Yazlık"
    public string City { get; set; } = null!;
    public string District { get; set; } = null!;
    public string FullAddress { get; set; } = null!;
    public string? PostalCode { get; set; }
    public string? Notes { get; set; }
    public bool IsDefault { get; set; } = false;
    
    // Navigation property
    public Customer Customer { get; set; } = null!;
}
