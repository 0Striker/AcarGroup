using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acargroup.Api.Controllers;

[Route("api/customer-purchased-products")]
[ApiController]
[Authorize]
public class CustomerPurchasedProductsController : ControllerBase
{
    private readonly ICustomerPurchasedProductService _service;

    public CustomerPurchasedProductsController(ICustomerPurchasedProductService service)
    {
        _service = service;
    }

    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<List<CustomerPurchasedProductDto>>> GetByCustomer(int customerId)
    {
        // Only Admin or the customer themselves should access this
        var isAdmin = User.Claims.Any(c => c.Type == "IsAdmin" && c.Value == "true");
        var currentCustomerId = int.Parse(User.FindFirst("CustomerId")?.Value ?? "0");

        if (!isAdmin && currentCustomerId != customerId)
        {
            return Forbid();
        }

        var products = await _service.GetByCustomerAsync(customerId);
        return Ok(products);
    }

    [HttpPost("customer/{customerId}")]
    public async Task<ActionResult<CustomerPurchasedProductDto>> Create(int customerId, CustomerPurchasedProductCreateDto dto)
    {
        // Only Admin should be able to add products
        var isAdmin = User.Claims.Any(c => c.Type == "IsAdmin" && c.Value == "true");
        if (!isAdmin)
        {
            return Forbid();
        }

        var product = await _service.CreateAsync(customerId, dto);
        return CreatedAtAction(nameof(GetByCustomer), new { customerId }, product);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        // Only Admin should be able to delete products
        var isAdmin = User.Claims.Any(c => c.Type == "IsAdmin" && c.Value == "true");
        if (!isAdmin)
        {
            return Forbid();
        }

        var result = await _service.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
