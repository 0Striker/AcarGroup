using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acargroup.Api.Controllers;

[Route("api/customer-devices")]
[ApiController]
[Authorize]
public class CustomerDevicesController : ControllerBase
{
    private readonly ICustomerDeviceService _service;
    private readonly IFileUploadService _fileUploadService;

    public CustomerDevicesController(ICustomerDeviceService service, IFileUploadService fileUploadService)
    {
        _service = service;
        _fileUploadService = fileUploadService;
    }

    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<List<CustomerDeviceDto>>> GetByCustomer(int customerId)
    {
        var isAdmin = User.Claims.Any(c => c.Type == "IsAdmin" && c.Value == "true");
        var currentCustomerId = int.Parse(User.FindFirst("CustomerId")?.Value ?? "0");

        if (!isAdmin && currentCustomerId != customerId)
        {
            return Forbid();
        }

        var devices = await _service.GetByCustomerAsync(customerId);
        return Ok(devices);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CustomerDeviceDto>> GetById(int id)
    {
        var device = await _service.GetByIdAsync(id);
        if (device == null) return NotFound();

        var isAdmin = User.Claims.Any(c => c.Type == "IsAdmin" && c.Value == "true");
        var currentCustomerId = int.Parse(User.FindFirst("CustomerId")?.Value ?? "0");

        if (!isAdmin && currentCustomerId != device.CustomerId)
        {
            return Forbid();
        }

        return Ok(device);
    }

    [HttpPost("customer/{customerId}")]
    public async Task<ActionResult<CustomerDeviceDto>> Create(int customerId, CreateCustomerDeviceDto dto)
    {
        var isAdmin = User.Claims.Any(c => c.Type == "IsAdmin" && c.Value == "true");
        if (!isAdmin) return Forbid();

        var device = await _service.CreateAsync(customerId, dto);
        return CreatedAtAction(nameof(GetById), new { id = device.Id }, device);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CustomerDeviceDto>> Update(int id, UpdateCustomerDeviceDto dto)
    {
        var isAdmin = User.Claims.Any(c => c.Type == "IsAdmin" && c.Value == "true");
        if (!isAdmin) return Forbid();

        var device = await _service.UpdateAsync(id, dto);
        if (device == null) return NotFound();

        return Ok(device);
    }

    [HttpPost("{id}/qr-code")]
    public async Task<IActionResult> UploadQrCode(int id, IFormFile file)
    {
        var isAdmin = User.Claims.Any(c => c.Type == "IsAdmin" && c.Value == "true");
        if (!isAdmin) return Forbid();

        if (file == null || file.Length == 0)
            return BadRequest("No file provided");

        try
        {
            using var stream = file.OpenReadStream();
            var url = await _fileUploadService.UploadImageAsync(stream, file.FileName, "devices");
            
            var result = await _service.UpdateQrCodeAsync(id, url);
            if (!result) return NotFound();

            return Ok(new { url });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Upload failed: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var isAdmin = User.Claims.Any(c => c.Type == "IsAdmin" && c.Value == "true");
        if (!isAdmin) return Forbid();

        var result = await _service.DeleteAsync(id);
        if (!result) return NotFound();

        return NoContent();
    }
}
