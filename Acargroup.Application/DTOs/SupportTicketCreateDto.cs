namespace Acargroup.Application.DTOs;

public class SupportTicketCreateDto
{
    public int CustomerAddressId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? ProductName { get; set; }
    public string? SerialNumber { get; set; }
}
