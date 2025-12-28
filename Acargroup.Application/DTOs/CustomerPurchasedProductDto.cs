namespace Acargroup.Application.DTOs;

public class CustomerPurchasedProductDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public int? JobId { get; set; }
    public int? ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public string? SerialNumber { get; set; }
    public string? Notes { get; set; }
    public DateTime PurchaseDate { get; set; }
    public DateTime CreatedAt { get; set; }
}
