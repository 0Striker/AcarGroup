using Acargroup.Domain.Common;

namespace Acargroup.Domain.Entities;

public class CustomerPurchasedProduct : BaseEntity
{
    public int CustomerId { get; set; }
    public int? JobId { get; set; } // Optional: product may be sold independently
    public int? ProductId { get; set; } // Reference to Product entity if exists
    public string ProductName { get; set; } = null!;
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public string? SerialNumber { get; set; }
    public string? Notes { get; set; }
    public DateTime PurchaseDate { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Customer Customer { get; set; } = null!;
    public Job? Job { get; set; }
    public Product? Product { get; set; }
}
