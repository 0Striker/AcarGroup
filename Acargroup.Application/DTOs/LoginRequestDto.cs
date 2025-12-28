namespace Acargroup.Application.DTOs;

public class LoginRequestDto
{
    public string UsernameOrEmail { get; set; } = null!;
    public string Password { get; set; } = null!;
}
