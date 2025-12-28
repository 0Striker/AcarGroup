using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acargroup.Api.Controllers;

[Route("api/projects")]
[ApiController]
[AllowAnonymous]
public partial class ProjectsController : ControllerBase
{
    private readonly IProjectService _service;
    private readonly ICloudinaryService _cloudinaryService;

    public ProjectsController(IProjectService service, ICloudinaryService cloudinaryService)
    {
        _service = service;
        _cloudinaryService = cloudinaryService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProjectListDto>>> GetByStatus([FromQuery] string status = "Active")
    {
        var projects = await _service.GetByStatusAsync(status);
        return Ok(projects);
    }

    [HttpGet("featured")]
    public async Task<ActionResult<List<ProjectListDto>>> GetFeatured([FromQuery] int take = 3)
    {
        var projects = await _service.GetFeaturedAsync(take);
        return Ok(projects);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<ProjectDetailDto>> GetBySlug(string slug)
    {
        var project = await _service.GetBySlugAsync(slug);
        if (project == null)
        {
            return NotFound();
        }
        return Ok(project);
    }
}
