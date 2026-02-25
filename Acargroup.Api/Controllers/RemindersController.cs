using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Acargroup.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RemindersController : ControllerBase
{
    private readonly IReminderService _reminderService;

    public RemindersController(IReminderService reminderService)
    {
        _reminderService = reminderService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReminderDto>>> GetAll()
    {
        var reminders = await _reminderService.GetAllAsync();
        return Ok(reminders);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ReminderDto>> GetById(int id)
    {
        var reminder = await _reminderService.GetByIdAsync(id);
        if (reminder == null)
            return NotFound();

        return Ok(reminder);
    }

    [HttpPost]
    public async Task<ActionResult<ReminderDto>> Create([FromBody] ReminderCreateDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized(new { message = "User ID not found in token" });
        }

        var reminder = await _reminderService.CreateAsync(dto, userId);
        return CreatedAtAction(nameof(GetById), new { id = reminder.Id }, reminder);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _reminderService.DeleteAsync(id);
        if (!success)
            return NotFound();

        return NoContent();
    }

    [HttpPut("{id}/toggle")]
    public async Task<IActionResult> ToggleComplete(int id)
    {
        var success = await _reminderService.ToggleCompleteAsync(id);
        if (!success)
            return NotFound();

        return NoContent();
    }
}
