namespace Acargroup.Application.DTOs;

public class CustomerDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string? TC { get; set; }
    public string? VKN { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
    public bool IsAdmin { get; set; }
    public string? DefaultAddress { get; set; }
}
