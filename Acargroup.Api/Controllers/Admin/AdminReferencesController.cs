using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acargroup.Api.Controllers.Admin;

[Route("api/admin/references")]
[ApiController]
[Authorize]
public class AdminReferencesController : ControllerBase
{
    private readonly IReferenceAdminService _service;

    public AdminReferencesController(IReferenceAdminService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<ReferenceAdminListDto>>> GetAll()
    {
        var references = await _service.GetAllAsync();
        return Ok(references);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ReferenceDto>> GetById(int id)
    {
        var reference = await _service.GetByIdAsync(id);
        if (reference == null)
        {
            return NotFound();
        }
        return Ok(reference);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ReferenceAdminCreateUpdateDto dto)
    {
        var id = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ReferenceAdminCreateUpdateDto dto)
    {
        try
        {
            await _service.UpdateAsync(id, dto);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
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
    }
}
