using Acargroup.Domain.Enums;

namespace Acargroup.Application.DTOs;

public class AccountingExpenseDto
{
    public int Id { get; set; }
    public ExpenseCategory Category { get; set; }
    public string Description { get; set; } = null!;
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public bool IsRecurring { get; set; }
    public RecurringPeriod? RecurringPeriod { get; set; }
    public string? Notes { get; set; }
    public string? ReferenceNumber { get; set; }
    public DateTime CreatedAt { get; set; }
}
