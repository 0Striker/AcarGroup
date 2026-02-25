namespace Acargroup.Application.DTOs;

public class CustomerRegisterDto
{
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string AddressLabel { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string FullAddress { get; set; } = string.Empty;
    public string? TC { get; set; }
    public string? VKN { get; set; }
    public bool IsAdmin { get; set; }
}
