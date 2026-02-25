using Acargroup.Domain.Common;

namespace Acargroup.Domain.Entities;

public class Offer : BaseEntity
{
    public string CustomerName { get; set; } = null!;
    public string? CustomerEmail { get; set; }
    public string? CustomerPhone { get; set; }
    public string? CustomerAddress { get; set; }
    
    public int? CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public string OfferNumber { get; set; } = null!; // e.g. TKL-2024-001
    public DateTime OfferDate { get; set; }
    public DateTime ValidUntil { get; set; }
    
    public string Currency { get; set; } = "USD";
    public decimal ExchangeRate { get; set; } = 1.0m;
    
    public decimal SubTotal { get; set; }
    public decimal TaxRate { get; set; } = 20; // %20 default
    public decimal TaxAmount { get; set; }
    public decimal GrandTotal { get; set; }
    
    public string? Notes { get; set; }
    public string? GeneralConditions { get; set; }
    
    public string? DeliveryTime { get; set; }
    public string? BankDetails { get; set; } // JSON string or formatted text
    
    public string Status { get; set; } = "Draft"; // Draft, Sent, Accepted, Rejected

    public ICollection<OfferItem> Items { get; set; } = new List<OfferItem>();
}
