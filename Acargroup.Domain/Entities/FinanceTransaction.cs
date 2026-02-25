using Acargroup.Domain.Common;
using Acargroup.Domain.Enums;

namespace Acargroup.Domain.Entities;

public class FinanceTransaction : BaseEntity
{
    public int? CustomerId { get; set; }
    public int? JobId { get; set; } // Optional: can be null for manual transactions
    
    // External/Manual Transaction Fields
    public string? ExternalCustomerName { get; set; }
    public string? ExternalJobTitle { get; set; }
    
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = null!;
    public string? ReferenceNumber { get; set; } // Invoice/receipt number
    public string? Notes { get; set; }
    
    // VAT/KDV fields
    public decimal? VatRate { get; set; } // VAT rate as decimal (e.g., 0.20 for 20%)
    public decimal? VatAmount { get; set; } // Calculated VAT amount
    public bool IsVatIncluded { get; set; } // true = VAT included in amount, false = VAT added on top
    
    // Currency and Payment
    public string Currency { get; set; } = "TRY"; // TRY, USD, EUR, GBP
    public string? PaymentType { get; set; } // Mail Order, Havale-EFT, POS, Nakit
    
    // Navigation properties
    public Customer? Customer { get; set; }
    public Job? Job { get; set; }
}
