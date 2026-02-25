namespace Acargroup.Application.DTOs;

public class CustomerUpdateDto
{
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string? TC { get; set; }
    public string? VKN { get; set; }
    public bool IsActive { get; set; }
}
