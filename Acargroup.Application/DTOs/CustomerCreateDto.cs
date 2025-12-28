namespace Acargroup.Application.DTOs;

public class CustomerCreateDto
{
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string? TC { get; set; }
    public string? VKN { get; set; }
    public string Password { get; set; } = null!; // Auto-generate or default
    
    // Optional address fields
    public string? AddressLabel { get; set; }
    public string? City { get; set; }
    public string? District { get; set; }
    public string? FullAddress { get; set; }
}
