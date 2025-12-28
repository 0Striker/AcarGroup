namespace Acargroup.Application.DTOs;

public class LoginResponseDto
{
    public bool Success { get; set; }
    public string Token { get; set; } = string.Empty;
    public bool IsAdmin { get; set; }
    public string Message { get; set; } = string.Empty;
    public CustomerDto? Customer { get; set; }
}
