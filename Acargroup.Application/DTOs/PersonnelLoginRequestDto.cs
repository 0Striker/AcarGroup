namespace Acargroup.Application.DTOs;

public class PersonnelLoginRequestDto
{
    public string UsernameOrEmailOrPhone { get; set; } = null!;
    public string Password { get; set; } = null!;
}
