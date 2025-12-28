namespace Acargroup.Application.DTOs;

public class CompanyPaymentDto
{
    public int Id { get; set; }
    public string CompanyName { get; set; } = null!;
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public string Description { get; set; } = null!;
    public string? PaymentMethod { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
    public string? Category { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CompanyPaymentCreateDto
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

public class CompanyPaymentUpdateDto
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
