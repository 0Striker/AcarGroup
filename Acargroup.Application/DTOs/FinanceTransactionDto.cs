using Acargroup.Domain.Enums;

namespace Acargroup.Application.DTOs;

public class FinanceTransactionDto
{
    public int Id { get; set; }
    public int? CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public int? JobId { get; set; }
    public string? JobTitle { get; set; }
    
    public string? ExternalCustomerName { get; set; }
    public string? ExternalJobTitle { get; set; }
    
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = null!;
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
    public decimal? VatRate { get; set; }
    public decimal? VatAmount { get; set; }
    public bool IsVatIncluded { get; set; }
    public string Currency { get; set; } = "TRY";
    public string? PaymentType { get; set; }
    public DateTime CreatedAt { get; set; }
}
