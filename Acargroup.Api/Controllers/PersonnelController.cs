using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acargroup.Api.Controllers;

[Route("api/personnel")]
[ApiController]
[Authorize]
public class PersonnelController : ControllerBase
{
    private readonly IPersonnelService _service;

    public PersonnelController(IPersonnelService service)
    {
        _service = service;
    }

    private bool IsAdmin => User.Claims.Any(c => c.Type == "IsAdmin" && c.Value == "true");
    private bool IsPersonnel => User.Claims.Any(c => c.Type == "IsPersonnel" && c.Value == "true");

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PersonnelDto>>> GetAll()
    {
        if (!IsAdmin) return Forbid();
        var personnel = await _service.GetAllAsync();
        return Ok(personnel);
    }

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<PersonnelDto>>> GetActive()
    {
        // Personnel can also see active colleagues? Let's assume Admin only for now based on requirements
        if (!IsAdmin) return Forbid();
        var personnel = await _service.GetActivePersonnelAsync();
        return Ok(personnel);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PersonnelDto>> GetById(int id)
    {
        if (IsAdmin)
        {
            var person = await _service.GetByIdAsync(id);
            if (person == null) return NotFound();
            return Ok(person);
        }

        if (IsPersonnel)
        {
            // Personnel can see their own profile
            var currentPersonnelId = int.Parse(User.FindFirst("PersonnelId")?.Value ?? "0");
            if (id == currentPersonnelId)
            {
                var person = await _service.GetByIdAsync(id);
                if (person == null) return NotFound();
                return Ok(person);
            }
        }

        return Forbid();
    }

    [HttpGet("{id}/statistics")]
    public async Task<ActionResult<object>> GetStatistics(int id)
    {
        if (!IsAdmin) return Forbid();

        try
        {
            var person = await _service.GetByIdAsync(id);
            if (person == null) return NotFound();

            // Calculate job statistics
            var jobs = await _service.GetJobsForPersonnelAsync(id);
            var totalJobs = jobs.Count();
            var completedJobs = jobs.Count(j => j.Status == "Completed");
            var overdueJobs = jobs.Count(j => j.Status != "Completed" && j.ScheduledEndTime < DateTime.Now);

            return Ok(new
            {
                TotalJobs = totalJobs,
                CompletedJobs = completedJobs,
                OverdueJobs = overdueJobs
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error retrieving statistics: {ex.Message}");
        }
    }

    [HttpPost]
    public async Task<ActionResult<PersonnelDto>> Create(PersonnelCreateDto dto)
    {
        if (!IsAdmin) return Forbid();
        var person = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = person.Id }, person);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<PersonnelDto>> Update(int id, PersonnelUpdateDto dto)
    {
        if (!IsAdmin) return Forbid();
        try
        {
            var person = await _service.UpdateAsync(id, dto);
            return Ok(person);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (!IsAdmin) return Forbid();
        var result = await _service.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
