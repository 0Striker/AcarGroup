using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acargroup.Api.Controllers.Admin;

[Route("api/admin/project-requests")]
[ApiController]
[Authorize(Roles = "Admin")]
public class AdminProjectRequestsController : ControllerBase
{
    private readonly IProjectRequestAdminService _service;

    public AdminProjectRequestsController(IProjectRequestAdminService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProjectRequestListDto>>> GetAll([FromQuery] string? status, [FromQuery] bool includeArchived = false)
    {
        var result = await _service.GetAllAsync(status, includeArchived);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProjectRequestDetailDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null)
        {
            return NotFound();
        }
        return Ok(result);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] ProjectRequestStatusUpdateDto dto)
    {
        try
        {
            await _service.UpdateStatusAsync(id, dto.Status);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("{id}/archive")]
    public async Task<IActionResult> Archive(int id)
    {
        try
        {
            await _service.ArchiveAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet("{id}/pdf")]
    public async Task<IActionResult> DownloadPdf(int id)
    {
        try
        {
            var pdfBytes = await _service.GeneratePdfAsync(id);
            return File(pdfBytes, "application/pdf", $"project-request-{id}.pdf");
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
