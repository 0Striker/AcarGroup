using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Enums;
using Acargroup.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Acargroup.Api.Controllers;

public partial class JobsController
{
    // Personnel-specific endpoints for editing jobs
    
    /// <summary>
    /// Personnel uploads a photo for their assigned job
    /// </summary>
    [HttpPost("{id}/photos")]
    [Authorize(Roles = "Personnel,Admin")]
    public async Task<ActionResult<JobDto>> UploadJobPhoto(int id, IFormFile photo)
    {
        try
        {
            if (photo == null || photo.Length == 0)
                return BadRequest("No photo provided");

            // Check if personnel owns this job
            var job = await _service.GetByIdAsync(id);
            if (job == null) return NotFound();

            if (!IsAdmin && job.AssignedPersonnelId != CurrentPersonnelId)
                return Forbid();

            // Upload to Cloudinary
            using var stream = photo.OpenReadStream();
            var photoUrl = await _cloudinaryService.UploadImageAsync(stream, photo.FileName);

            // Add photo URL to job
            var updatedJob = await _service.AddPhotoAsync(id, photoUrl);
            return Ok(updatedJob);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Upload failed: {ex.Message}");
        }
    }

    /// <summary>
    /// Personnel updates job notes
    /// </summary>
    [HttpPatch("{id}/notes")]
    [Authorize(Roles = "Personnel,Admin")]
    public async Task<ActionResult<JobDto>> UpdateJobNotes(int id, [FromBody] UpdateNotesDto dto)
    {
        try
        {
            var job = await _service.GetByIdAsync(id);
            if (job == null) return NotFound();

            if (!IsAdmin && job.AssignedPersonnelId != CurrentPersonnelId)
                return Forbid();

            // Update via JobService
            var updateDto = new JobUpdateDto
            {
                Title = job.Title,
                Description = job.Description,
                EstimatedCost = job.EstimatedCost,
                ActualCost = job.ActualCost,
                Notes = dto.Notes,
                Priority = job.Priority,
                ScheduledDate = job.ScheduledDate,
                EstimatedHours = job.EstimatedHours,
                Address = job.Address,
                ContactPerson = job.ContactPerson,
                ContactPhone = job.ContactPhone,
                RequiredMaterials = job.RequiredMaterials
            };

            var updatedJob = await _service.UpdateAsync(id, updateDto);
            return Ok(updatedJob);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Update failed: {ex.Message}");
        }
    }

    /// <summary>
    /// Personnel adds a material to the job
    /// </summary>
    [HttpPost("{id}/materials")]
    [Authorize(Roles = "Personnel,Admin")]
    public async Task<ActionResult<JobDto>> AddMaterial(int id, [FromBody] AddMaterialDto dto)
    {
        try
        {
            var job = await _service.GetByIdAsync(id);
            if (job == null) return NotFound();

            if (!IsAdmin && job.AssignedPersonnelId != CurrentPersonnelId)
                return Forbid();

            // Get existing materials
            var materials = job.RequiredMaterials ?? new List<string>();
            materials.Add(dto.MaterialName);

            // Update job
            var updateDto = new JobUpdateDto
            {
                Title = job.Title,
                Description = job.Description,
                EstimatedCost = job.EstimatedCost,
                ActualCost = job.ActualCost,
                Notes = job.Notes,
                Priority = job.Priority,
                ScheduledDate = job.ScheduledDate,
                EstimatedHours = job.EstimatedHours,
                Address = job.Address,
                ContactPerson = job.ContactPerson,
                ContactPhone = job.ContactPhone,
                RequiredMaterials = materials
            };

            var updatedJob = await _service.UpdateAsync(id, updateDto);
            return Ok(updatedJob);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Update failed: {ex.Message}");
        }
    }

    /// <summary>
    /// Personnel removes a material from the job
    /// </summary>
    [HttpDelete("{id}/materials/{materialIndex}")]
    [Authorize(Roles = "Personnel,Admin")]
    public async Task<ActionResult<JobDto>> RemoveMaterial(int id, int materialIndex)
    {
        try
        {
            var job = await _service.GetByIdAsync(id);
            if (job == null) return NotFound();

            if (!IsAdmin && job.AssignedPersonnelId != CurrentPersonnelId)
                return Forbid();

            var materials = job.RequiredMaterials ?? new List<string>();
            if (materialIndex < 0 || materialIndex >= materials.Count)
                return BadRequest("Invalid material index");

            materials.RemoveAt(materialIndex);

            var updateDto = new JobUpdateDto
            {
                Title = job.Title,
                Description = job.Description,
                EstimatedCost = job.EstimatedCost,
                ActualCost = job.ActualCost,
                Notes = job.Notes,
                Priority = job.Priority,
                ScheduledDate = job.ScheduledDate,
                EstimatedHours = job.EstimatedHours,
                Address = job.Address,
                ContactPerson = job.ContactPerson,
                ContactPhone = job.ContactPhone,
                RequiredMaterials = materials
            };

            var updatedJob = await _service.UpdateAsync(id, updateDto);
            return Ok(updatedJob);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Update failed: {ex.Message}");
        }
    }
}

// DTOs
public class UpdateNotesDto
{
    public string Notes { get; set; } = string.Empty;
}

public class AddMaterialDto
{
    public string MaterialName { get; set; } = null!;
}
