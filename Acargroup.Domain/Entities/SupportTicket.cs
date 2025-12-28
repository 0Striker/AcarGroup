using Acargroup.Domain.Common;

namespace Acargroup.Domain.Entities;

public class SupportTicket : BaseEntity
{
    public int CustomerId { get; set; }
    public int? CustomerAddressId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Status { get; set; } = "Open"; // "Open", "InProgress", "Closed"
    public string? ProductName { get; set; }
    public string? SerialNumber { get; set; }
    public string? ImagePath { get; set; } // Relative path to uploaded image
    
    // Navigation property
    public Customer Customer { get; set; } = null!;
    public CustomerAddress? CustomerAddress { get; set; }
}
