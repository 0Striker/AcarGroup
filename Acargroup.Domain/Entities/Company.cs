using Acargroup.Domain.Common;

namespace Acargroup.Domain.Entities;

public class Company : BaseEntity
{
    public string Name { get; set; } = null!;
    public string? AuthorizedPerson { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? Email { get; set; }
    public string? Sector { get; set; } // İş alanı
    public string? Notes { get; set; }
    public string? StampNumber { get; set; } // Kaşe No
    
    // Login Details (for external system reference, stored as plain text per request)
    public string? LoginName { get; set; }
    public string? LoginCode { get; set; }
    public string? LoginPassword { get; set; } // Plain text password storage as requested

    // Shipping Company (Manual Text)
    public string? ShippingCompanyName { get; set; }
}
