using Acargroup.Domain.Common;

namespace Acargroup.Domain.Entities;

public class ShippingCompany : BaseEntity
{
    public string Name { get; set; } = null!;
    public string? Address { get; set; }
    public string? Phone { get; set; }

    // Navigation property for companies that use this shipping company
    public ICollection<Company> Companies { get; set; } = new List<Company>();
}
