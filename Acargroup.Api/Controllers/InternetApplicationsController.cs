using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acargroup.Api.Controllers;

[Route("api/internet-applications")]
[ApiController]
public class InternetApplicationsController : ControllerBase
{
    private readonly IInternetApplicationService _service;

    public InternetApplicationsController(IInternetApplicationService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<InternetApplicationDto>>> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<InternetApplicationDto>> GetById(int id)
    {
        var app = await _service.GetByIdAsync(id);
        if (app == null) return NotFound();
        return Ok(app);
    }

    [HttpPost]
    public async Task<ActionResult<InternetApplicationDto>> Create(CreateInternetApplicationDto createDto)
    {
        var app = await _service.CreateAsync(createDto);
        return CreatedAtAction(nameof(GetById), new { id = app.Id }, app);
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateInternetApplicationDto updateDto)
    {
        var result = await _service.UpdateStatusAsync(id, updateDto.Status);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
