using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Acargroup.Api.Controllers;

[Route("api/project-requests")]
[ApiController]
public class ProjectRequestsController : ControllerBase
{
    private readonly IProjectRequestService _projectRequestService;

    public ProjectRequestsController(IProjectRequestService projectRequestService)
    {
        _projectRequestService = projectRequestService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProjectRequestCreateDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var created = await _projectRequestService.CreateAsync(dto);
        return Ok(new { message = "Talebiniz alındı.", id = created.Id });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var requests = await _projectRequestService.GetAllAsync();
        return Ok(requests);
    }
}
