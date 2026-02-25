namespace Acargroup.Application.DTOs;

public class PersonnelCreateDto
{
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string? Address { get; set; }
    public string? TC { get; set; }
    public string? Specialization { get; set; }
    public string? BloodType { get; set; }
    public bool HasDriverLicense { get; set; }
}
