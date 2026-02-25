using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Acargroup.Api.Controllers;

public partial class ProjectsController
{
    /// <summary>
    /// Admin uploads project hero image
    /// </summary>
    [HttpPost("{id}/hero-image")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> UploadHeroImage(int id, IFormFile image)
    {
        try
        {
            if (image == null || image.Length == 0)
                return BadRequest("No image provided");

            if (image.Length > 5 * 1024 * 1024)
                return BadRequest("Image size must be less than 5MB");

            using var stream = image.OpenReadStream();
            var imageUrl = await _fileUploadService.UploadImageAsync(stream, image.FileName, "projects");

            return Ok(new { heroImageUrl = imageUrl, success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Upload failed: {ex.Message}");
        }
    }

    /// <summary>
    /// Admin uploads project gallery image
    /// </summary>
    [HttpPost("{id}/gallery-image")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> UploadGalleryImage(int id, IFormFile image)
    {
        try
        {
            if (image == null || image.Length == 0)
                return BadRequest("No image provided");

            if (image.Length > 5 * 1024 * 1024)
                return BadRequest("Image size must be less than 5MB");

            using var stream = image.OpenReadStream();
            var imageUrl = await _fileUploadService.UploadImageAsync(stream, image.FileName, "projects/gallery");

            return Ok(new { galleryImageUrl = imageUrl, success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Upload failed: {ex.Message}");
        }
    }
}
