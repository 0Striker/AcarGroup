using Acargroup.Application.DTOs;

namespace Acargroup.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto dto);
    Task<PersonnelLoginResponseDto> LoginPersonnelAsync(PersonnelLoginRequestDto dto);
}
