using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Acargroup.Api.Controllers.Customer;

[Route("api/customer/service-items")]
[ApiController]
[Authorize]
public class CustomerServiceItemsController : ControllerBase
{
    private readonly IServiceItemService _serviceItemService;
    private readonly IWebHostEnvironment _environment;

    public CustomerServiceItemsController(IServiceItemService serviceItemService, IWebHostEnvironment environment)
    {
        _serviceItemService = serviceItemService;
        _environment = environment;
    }

    [HttpGet]
    public async Task<ActionResult<List<ServiceItemResponseDto>>> GetServiceItems()
    {
        if (!TryGetCustomerId(out var customerId))
        {
            return Unauthorized();
        }

        var items = await _serviceItemService.GetByCustomerAsync(customerId);
        return Ok(items);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ServiceItemResponseDto>> CreateServiceItem([FromForm] ServiceItemCreateRequest request)
    {
        if (!TryGetCustomerId(out var customerId))
        {
            return Unauthorized();
        }

        if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Description))
        {
            return BadRequest("Başlık ve açıklama zorunludur.");
        }

        string? photoPath = null;
        if (request.Photo != null && request.Photo.Length > 0)
        {
            photoPath = await SavePhotoAsync(request.Photo);
        }

        var dto = new ServiceItemCreateDto
        {
            Title = request.Title,
            Description = request.Description
        };

        var created = await _serviceItemService.CreateAsync(customerId, dto, photoPath);
        return CreatedAtAction(nameof(GetServiceItems), new { }, created);
    }

    private bool TryGetCustomerId(out int customerId)
    {
        customerId = 0;
        var claimValue = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        return int.TryParse(claimValue, out customerId) && customerId > 0;
    }

    private async Task<string> SavePhotoAsync(IFormFile photo)
    {
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
        var extension = Path.GetExtension(photo.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
        {
            throw new InvalidOperationException("Sadece resim dosyaları yüklenebilir.");
        }

        var webRoot = string.IsNullOrWhiteSpace(_environment.WebRootPath)
            ? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot")
            : _environment.WebRootPath!;
        Directory.CreateDirectory(webRoot);

        var uploadsFolder = Path.Combine(webRoot, "uploads", "service-items");
        Directory.CreateDirectory(uploadsFolder);

        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await photo.CopyToAsync(stream);

        return Path.Combine("uploads", "service-items", fileName).Replace("\\", "/");
    }
}

public class ServiceItemCreateRequest
{
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public IFormFile? Photo { get; set; }
}
