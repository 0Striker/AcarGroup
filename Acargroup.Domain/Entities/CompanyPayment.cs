using Acargroup.Domain.Common;

namespace Acargroup.Domain.Entities;

public class CompanyPayment : BaseEntity
{
    public string CompanyName { get; set; } = null!;
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public string Description { get; set; } = null!;
    public string? PaymentMethod { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
    public string? Category { get; set; }
}
