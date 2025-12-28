using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acargroup.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly ICustomerService _customerService;
    private readonly IAuthService _authService;

    public AuthController(ICustomerService customerService, IAuthService authService)
    {
        _customerService = customerService;
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] CustomerRegisterDto dto)
    {
        try
        {
            dto.IsAdmin = false;
            var customer = await _customerService.RegisterAsync(dto);
            return Ok(customer);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        try
        {
            var response = await _authService.LoginAsync(dto);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new LoginResponseDto
            {
                Success = false,
                Message = ex.Message
            });
        }
    }

    [HttpPost("personnel-login")]
    public async Task<IActionResult> PersonnelLogin(PersonnelLoginRequestDto dto)
    {
        try
        {
            var result = await _authService.LoginPersonnelAsync(dto);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { success = false, message = ex.Message });
        }
    }
    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        try
        {
            if (dto.NewPassword != dto.ConfirmPassword)
            {
                return BadRequest(new { message = "Yeni şifreler eşleşmiyor." });
            }

            // Get user ID from claim
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized();
            }

            await _customerService.ChangePasswordAsync(userId, dto);
            return Ok(new { success = true, message = "Şifre başarıyla değiştirildi." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return BadRequest(new { message = ex.Message }); // 400 for wrong old password to display generic error
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
