using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Acargroup.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CustomerDocumentsController : ControllerBase
{
    private readonly ICustomerDocumentService _service;

    public CustomerDocumentsController(ICustomerDocumentService service)
    {
        _service = service;
    }

    [HttpGet("customer/{customerId}")]
    public async Task<IActionResult> GetByCustomer(int customerId)
    {
        var documents = await _service.GetByCustomerIdAsync(customerId);
        return Ok(documents);
    }

    [HttpGet("customer/{customerId}/type/{type}")]
    public async Task<IActionResult> GetByCustomerAndType(int customerId, DocumentType type)
    {
        var documents = await _service.GetByCustomerAndTypeAsync(customerId, type);
        return Ok(documents);
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromForm] int customerId, [FromForm] int type)
    {
        try
        {
            var uploaderName = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst(ClaimTypes.Email)?.Value ?? "Admin";
            
            using var stream = file.OpenReadStream();
            var document = await _service.UploadAsync(stream, file.FileName, file.ContentType, customerId, (DocumentType)type, uploaderName);
            return Ok(document);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
