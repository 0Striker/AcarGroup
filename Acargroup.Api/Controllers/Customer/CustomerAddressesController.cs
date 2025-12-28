using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acargroup.Api.Controllers.Customer;

[Route("api/customer/addresses")]
[ApiController]
[Authorize]
public class CustomerAddressesController : ControllerBase
{
    private readonly ICustomerAddressService _addressService;

    public CustomerAddressesController(ICustomerAddressService addressService)
    {
        _addressService = addressService;
    }

    [HttpGet]
    public async Task<ActionResult<List<CustomerAddressDto>>> GetAddresses()
    {
        if (!TryGetCustomerId(out var customerId))
        {
            return Unauthorized();
        }

        var addresses = await _addressService.GetByCustomerAsync(customerId);
        return Ok(addresses);
    }

    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<List<CustomerAddressDto>>> GetByCustomer(int customerId)
    {
        // Only Admin
        if (!User.Claims.Any(c => c.Type == "IsAdmin" && c.Value == "true")) return Forbid();
        
        var addresses = await _addressService.GetByCustomerAsync(customerId);
        return Ok(addresses);
    }

    [HttpPost]
    public async Task<ActionResult<CustomerAddressDto>> CreateAddress([FromBody] CustomerAddressCreateUpdateDto dto)
    {
        if (!TryGetCustomerId(out var customerId))
        {
            return Unauthorized();
        }

        var address = await _addressService.CreateAsync(customerId, dto);
        return CreatedAtAction(nameof(GetAddresses), new { }, address);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CustomerAddressDto>> UpdateAddress(int id, [FromBody] CustomerAddressCreateUpdateDto dto)
    {
        if (!TryGetCustomerId(out var customerId))
        {
            return Unauthorized();
        }

        var address = await _addressService.UpdateAsync(customerId, id, dto);
        return Ok(address);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteAddress(int id)
    {
        if (!TryGetCustomerId(out var customerId))
        {
            return Unauthorized();
        }

        await _addressService.DeleteAsync(customerId, id);
        return NoContent();
    }

    private bool TryGetCustomerId(out int customerId)
    {
        customerId = 0;
        var claimValue = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        return int.TryParse(claimValue, out customerId) && customerId > 0;
    }
}
