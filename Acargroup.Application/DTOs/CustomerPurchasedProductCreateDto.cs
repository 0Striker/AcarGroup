namespace Acargroup.Application.DTOs;

public class CustomerPurchasedProductCreateDto
{
    public int? JobId { get; set; }
    public int? ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public string? SerialNumber { get; set; }
    public string? Notes { get; set; }
    public DateTime PurchaseDate { get; set; } = DateTime.UtcNow;
}
