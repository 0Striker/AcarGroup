using Acargroup.Application.Interfaces;
using Acargroup.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acargroup.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly ICloudinaryService _cloudinaryService;

    public UploadController(ICloudinaryService cloudinaryService)
    {
        _cloudinaryService = cloudinaryService;
    }

    [HttpPost("image")]
    [Authorize]
    public async Task<IActionResult> UploadImage(IFormFile image)
    {
        try
        {
            if (image == null || image.Length == 0)
                return BadRequest("No image provided");

            if (image.Length > 5 * 1024 * 1024)
                return BadRequest("Image size must be less than 5MB");

            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };
            if (!allowedTypes.Contains(image.ContentType.ToLower()))
                return BadRequest("Only JPG, PNG, and WEBP images are allowed");

            using var stream = image.OpenReadStream();
            var imageUrl = await _cloudinaryService.UploadImageAsync(stream, image.FileName);

            return Ok(new { url = imageUrl, imageUrl });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Upload failed: {ex.Message}");
        }
    }
    [HttpPost("local")]
    [Authorize]
    public async Task<IActionResult> UploadLocalImage(IFormFile image)
    {
        try
        {
            if (image == null || image.Length == 0)
                return BadRequest("No image provided");

            if (image.Length > 5 * 1024 * 1024)
                return BadRequest("Image size must be less than 5MB");

            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml" };
            if (!allowedTypes.Contains(image.ContentType.ToLower()))
                return BadRequest("Only JPG, PNG, WEBP, and SVG images are allowed");

            var folderName = Path.Combine("wwwroot", "uploads", "logos");
            var pathToSave = Path.Combine(Directory.GetCurrentDirectory(), folderName);

            if (!Directory.Exists(pathToSave))
                Directory.CreateDirectory(pathToSave);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
            var fullPath = Path.Combine(pathToSave, fileName);
            var dbPath = Path.Combine("uploads", "logos", fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            // Construct full URL
            var baseUrl = $"{this.Request.Scheme}://{this.Request.Host}{this.Request.PathBase}";
            var fullUrl = $"{baseUrl}/{dbPath}";

            return Ok(new { url = fullUrl, dbPath });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex}");
        }
    }
}
