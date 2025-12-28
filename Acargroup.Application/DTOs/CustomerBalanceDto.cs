namespace Acargroup.Application.DTOs;

public class CustomerBalanceDto
{
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = null!;
    public decimal TotalBalance { get; set; }
    public decimal TotalIncome { get; set; }
    public decimal TotalExpense { get; set; }
    public DateTime LastUpdated { get; set; }
}
