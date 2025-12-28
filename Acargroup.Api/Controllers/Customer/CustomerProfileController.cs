using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acargroup.Api.Controllers.Customer;

[Route("api/customer/profile")]
[ApiController]
[Authorize]
public class CustomerProfileController : ControllerBase
{
    private readonly ICustomerProfileService _profileService;

    public CustomerProfileController(ICustomerProfileService profileService)
    {
        _profileService = profileService;
    }

    [HttpGet]
    public async Task<ActionResult<CustomerProfileDto>> GetProfile()
    {
        if (!TryGetCustomerId(out var customerId))
        {
            return Unauthorized();
        }

        var profile = await _profileService.GetProfileAsync(customerId);
        if (profile == null)
        {
            return NotFound("Müşteri profili bulunamadı.");
        }

        return Ok(profile);
    }

    [HttpPut]
    public async Task<ActionResult<CustomerProfileDto>> UpdateProfile([FromBody] CustomerProfileUpdateDto dto)
    {
        if (!TryGetCustomerId(out var customerId))
        {
            return Unauthorized();
        }

        var profile = await _profileService.UpdateProfileAsync(customerId, dto);
        if (profile == null)
        {
            return NotFound("Müşteri profili bulunamadı.");
        }

        return Ok(profile);
    }

    private bool TryGetCustomerId(out int customerId)
    {
        customerId = 0;
        var claimValue = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        return int.TryParse(claimValue, out customerId) && customerId > 0;
    }
}
