using System.Security.Claims;
using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acargroup.Api.Controllers.Admin;

[Route("api/admin/service-items")]
[ApiController]
[Authorize(Roles = "Admin")]
public class AdminServiceItemsController : ControllerBase
{
    private readonly IServiceItemService _serviceItemService;

    public AdminServiceItemsController(IServiceItemService serviceItemService)
    {
        _serviceItemService = serviceItemService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ServiceItemDetailDto>>> GetAll([FromQuery] string? status, [FromQuery] string? search)
    {
        var items = await _serviceItemService.GetAllAsync(status, search);
        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult<ServiceItemResponseDto>> Create([FromBody] ServiceItemCreateDto dto)
    {
        if (dto.CustomerId <= 0)
        {
            return BadRequest("Müşteri seçimi zorunludur.");
        }

        if (string.IsNullOrWhiteSpace(dto.Title) || string.IsNullOrWhiteSpace(dto.Description))
        {
            return BadRequest("Başlık ve açıklama zorunludur.");
        }

        var result = await _serviceItemService.CreateAsync(dto.CustomerId, dto, null);
        return CreatedAtAction(nameof(GetDetail), new { id = result.Id }, result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceItemDetailDto>> GetDetail(int id)
    {
        var item = await _serviceItemService.GetDetailAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] ServiceItemStatusUpdateDto dto, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(dto.Status))
        {
            return BadRequest("Durum zorunludur.");
        }

        var adminName = User.FindFirst(ClaimTypes.Name)?.Value
            ?? User.FindFirst(ClaimTypes.Email)?.Value
            ?? "Admin";

        await _serviceItemService.UpdateStatusAsync(id, dto.Status, dto.Note, adminName);
        return NoContent();
    }

    [HttpPut("{id}/note")]
    public async Task<IActionResult> AddAdminNote(int id, [FromBody] ServiceItemAdminNoteDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Note))
        {
            return BadRequest("Not alanı zorunludur.");
        }

        var adminName = User.FindFirst(ClaimTypes.Name)?.Value
            ?? User.FindFirst(ClaimTypes.Email)?.Value
            ?? "Admin";

        await _serviceItemService.AddAdminNoteAsync(id, dto.Note, adminName);
        return NoContent();
    }
}
