using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acargroup.Api.Controllers;

[Route("api/references")]
[ApiController]
[AllowAnonymous]
public partial class ReferencesController : ControllerBase
{
    private readonly IReferenceService _service;
    private readonly IFileUploadService _fileUploadService;

    public ReferencesController(IReferenceService service, IFileUploadService fileUploadService)
    {
        _service = service;
        _fileUploadService = fileUploadService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ReferenceDto>>> GetAll()
    {
        var references = await _service.GetAllActiveAsync();
        return Ok(references);
    }
}
