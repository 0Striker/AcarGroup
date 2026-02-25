using Acargroup.Domain.Common;

namespace Acargroup.Domain.Entities;

public class CustomerBalance : BaseEntity
{
    public int CustomerId { get; set; }
    public decimal TotalBalance { get; set; } = 0; // Positive = customer owes, Negative = credit
    public decimal TotalIncome { get; set; } = 0;
    public decimal TotalExpense { get; set; } = 0;
    
    // Navigation property
    public Customer Customer { get; set; } = null!;
}
