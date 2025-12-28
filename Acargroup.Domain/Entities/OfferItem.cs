using Acargroup.Domain.Common;

namespace Acargroup.Domain.Entities;

public class OfferItem : BaseEntity
{
    public int OfferId { get; set; }
    public Offer Offer { get; set; } = null!;

    public int? ProductId { get; set; }
    public Product? Product { get; set; }

    public string ProductName { get; set; } = null!;
    public string? Description { get; set; }
    
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = "Adet"; // Adet, Metre, etc.
    
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}
