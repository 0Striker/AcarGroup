namespace Acargroup.Application.DTOs;

public class OfferDto
{
    public int Id { get; set; }
    public string CustomerName { get; set; } = null!;
    public string? CustomerEmail { get; set; }
    public string? CustomerPhone { get; set; }
    public string? CustomerAddress { get; set; }
    public int? CustomerId { get; set; }
    
    public string OfferNumber { get; set; } = null!;
    public DateTime OfferDate { get; set; }
    public DateTime ValidUntil { get; set; }
    
    public string Currency { get; set; } = null!;
    public decimal ExchangeRate { get; set; }
    
    public decimal SubTotal { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal GrandTotal { get; set; }
    
    public string? Notes { get; set; }
    public string? GeneralConditions { get; set; }
    public string? DeliveryTime { get; set; }
    public string? BankDetails { get; set; }
    public string Status { get; set; } = null!;
    
    public List<OfferItemDto> Items { get; set; } = new();
    
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class OfferItemDto
{
    public int Id { get; set; }
    public int OfferId { get; set; }
    public int? ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public string? Description { get; set; }
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = null!;
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}

public class CreateOfferDto
{
    public string CustomerName { get; set; } = null!;
    public string? CustomerEmail { get; set; }
    public string? CustomerPhone { get; set; }
    public string? CustomerAddress { get; set; }
    public int? CustomerId { get; set; }
    
    public DateTime OfferDate { get; set; }
    public DateTime ValidUntil { get; set; }
    
    public string Currency { get; set; } = "USD";
    public decimal ExchangeRate { get; set; } = 1.0m;
    
    public decimal TaxRate { get; set; } = 20;
    
    public string? Notes { get; set; }
    public string? GeneralConditions { get; set; }
    
    public string? DeliveryTime { get; set; }
    public string? BankDetails { get; set; }
    
    public List<CreateOfferItemDto> Items { get; set; } = new();
}

public class CreateOfferItemDto
{
    public int? ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public string? Description { get; set; }
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = "Adet";
    public decimal UnitPrice { get; set; }
}

public class UpdateOfferDto : CreateOfferDto
{
    public string Status { get; set; } = null!;
}
