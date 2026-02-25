namespace Acargroup.Application.DTOs;

public class SupportTicketDetailDto
{
    public int Id { get; set; }
    public int? CustomerAddressId { get; set; }
    public string? AddressLabel { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? ProductName { get; set; }
    public string? SerialNumber { get; set; }
    public string? ImageUrl { get; set; }
}
