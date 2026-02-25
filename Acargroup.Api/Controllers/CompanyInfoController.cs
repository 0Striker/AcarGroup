using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acargroup.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public partial class CompanyInfoController : ControllerBase
{
    private readonly ICompanyInfoService _service;
    private readonly IFileUploadService _fileUploadService;

    public CompanyInfoController(ICompanyInfoService service, IFileUploadService fileUploadService)
    {
        _service = service;
        _fileUploadService = fileUploadService;
    }

    // GET: api/companyinfo
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<CompanyInfoDto>> Get()
    {
        var info = await _service.GetAsync();
        if (info == null)
            return NotFound(new { message = "Şirket bilgisi henüz eklenmemiş." });

        return Ok(info);
    }

    // PUT: api/companyinfo
    [HttpPut]
    [Authorize] // Admin authentication required
    public async Task<ActionResult<CompanyInfoDto>> CreateOrUpdate([FromBody] CompanyInfoCreateUpdateDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _service.CreateOrUpdateAsync(dto);
        return Ok(result);
    }
}
