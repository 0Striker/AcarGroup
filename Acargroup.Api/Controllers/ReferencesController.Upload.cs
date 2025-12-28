using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acargroup.Api.Controllers;

public partial class ReferencesController
{
    /// <summary>
    /// Admin uploads reference logo
    /// </summary>
    [HttpPost("{id}/logo")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> UploadLogo(int id, IFormFile image)
    {
        try
        {
            if (image == null || image.Length == 0)
                return BadRequest("No image provided");

            if (image.Length > 5 * 1024 * 1024)
                return BadRequest("Image size must be less than 5MB");

            // Prefer PNG for logos (transparency)
            var allowedTypes = new[] { "image/png", "image/jpeg", "image/jpg", "image/webp" };
            if (!allowedTypes.Contains(image.ContentType.ToLower()))
                return BadRequest("Only PNG, JPG, and WEBP images are allowed");

            using var stream = image.OpenReadStream();
            var logoUrl = await _cloudinaryService.UploadImageAsync(stream, image.FileName);

            return Ok(new { logoUrl, success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Upload failed: {ex.Message}");
        }
    }
}
