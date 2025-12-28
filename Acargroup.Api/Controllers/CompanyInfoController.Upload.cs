using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acargroup.Api.Controllers;

public partial class CompanyInfoController
{
    /// <summary>
    /// Admin uploads company hero image
    /// </summary>
    [HttpPost("upload-hero")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> UploadHeroImage(IFormFile image)
    {
        try
        {
            if (image == null || image.Length == 0)
                return BadRequest("No image provided");

            if (image.Length > 5 * 1024 * 1024)
                return BadRequest("Image size must be less than 5MB");

            using var stream = image.OpenReadStream();
            var imageUrl = await _cloudinaryService.UploadImageAsync(stream, image.FileName);

            return Ok(new { heroImageUrl = imageUrl, success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Upload failed: {ex.Message}");
        }
    }

    /// <summary>
    /// Admin uploads slider image (slot 1-3)
    /// </summary>
    [HttpPost("upload-slider/{slot}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> UploadSliderImage(int slot, IFormFile image)
    {
        try
        {
            if (slot < 1 || slot > 3)
                return BadRequest("Slot must be between 1 and 3");

            if (image == null || image.Length == 0)
                return BadRequest("No image provided");

            if (image.Length > 5 * 1024 * 1024)
                return BadRequest("Image size must be less than 5MB");

            using var stream = image.OpenReadStream();
            var imageUrl = await _cloudinaryService.UploadImageAsync(stream, image.FileName);

            return Ok(new { sliderImageUrl = imageUrl, slot, success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Upload failed: {ex.Message}");
        }
    }
}
