namespace Acargroup.Application.DTOs;

public class SupportTicketListDto
{
    public int Id { get; set; }
    public int? CustomerAddressId { get; set; }
    public string? AddressLabel { get; set; }
    public string Title { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public string? ProductName { get; set; }
    public string? SerialNumber { get; set; }
}
