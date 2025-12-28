namespace Acargroup.Application.DTOs;

public class PersonnelLoginResponseDto
{
    public bool Success { get; set; }
    public string Token { get; set; } = "";
    public string Message { get; set; } = "";
    public PersonnelDto? Personnel { get; set; }
}
