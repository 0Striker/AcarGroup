using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Enums;
using Acargroup.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Acargroup.Api.Controllers;

[Route("api/jobs")]
[ApiController]
[Authorize]
public partial class JobsController : ControllerBase
{
    private readonly IJobService _service;
    private readonly ICloudinaryService _cloudinaryService;
    private readonly IFinanceService _financeService;

    public JobsController(IJobService service, ICloudinaryService cloudinaryService, IFinanceService financeService)
    {
        _service = service;
        _cloudinaryService = cloudinaryService;
        _financeService = financeService;
    }

    private bool IsAdmin => User.Claims.Any(c => c.Type == "IsAdmin" && c.Value == "true");
    private bool IsPersonnel => User.Claims.Any(c => c.Type == "IsPersonnel" && c.Value == "true");
    private int CurrentPersonnelId => int.Parse(User.FindFirst("PersonnelId")?.Value ?? "0");
    private int CurrentCustomerId => int.Parse(User.FindFirst("CustomerId")?.Value ?? "0"); // Assuming CustomerId claim exists for customers

    [HttpGet]
    public async Task<ActionResult<IEnumerable<JobDto>>> GetAll()
    {
        if (IsAdmin)
        {
            var jobs = await _service.GetAllAsync();
            return Ok(jobs);
        }
        
        if (IsPersonnel)
        {
            var jobs = await _service.GetByPersonnelAsync(CurrentPersonnelId);
            return Ok(jobs);
        }

        // Customers should use "my-jobs" endpoint or we can route them here if we want generic Get
        // But for clarity, let's keep this for internal staff mostly, or allow customer to see only theirs
        if (CurrentCustomerId > 0)
        {
             var jobs = await _service.GetByCustomerAsync(CurrentCustomerId);
             return Ok(jobs);
        }

        return Forbid();
    }

    [HttpGet("my-jobs")]
    public async Task<ActionResult<IEnumerable<JobDto>>> GetMyJobs()
    {
        if (CurrentCustomerId <= 0) return Forbid();
        var jobs = await _service.GetByCustomerAsync(CurrentCustomerId);
        return Ok(jobs);
    }

    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<IEnumerable<JobDto>>> GetByCustomer(int customerId)
    {
        if (!IsAdmin) return Forbid();
        var jobs = await _service.GetByCustomerAsync(customerId);
        return Ok(jobs);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<JobDto>> GetById(int id)
    {
        var job = await _service.GetByIdAsync(id);
        if (job == null) return NotFound();

        if (IsAdmin) return Ok(job);

        if (IsPersonnel)
        {
            if (job.AssignedPersonnelId == CurrentPersonnelId)
                return Ok(job);
        }

        if (CurrentCustomerId > 0)
        {
            if (job.CustomerId == CurrentCustomerId)
                return Ok(job);
        }

        return Forbid();
    }

    [HttpPost]
    public async Task<ActionResult<JobDto>> Create(JobCreateDto dto)
    {
        if (!IsAdmin) return Forbid();
        var job = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = job.Id }, job);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<JobDto>> Update(int id, JobUpdateDto dto)
    {
        if (!IsAdmin) return Forbid();
        try
        {
            var job = await _service.UpdateAsync(id, dto);
            return Ok(job);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (!IsAdmin) return Forbid();
        var result = await _service.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPost("{id}/assign")]
    public async Task<ActionResult<JobDto>> AssignPersonnel(int id, JobAssignDto dto)
    {
        if (!IsAdmin) return Forbid();
        try
        {
            var job = await _service.AssignPersonnelAsync(id, dto);
            return Ok(job);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("{id}/status")]
    public async Task<ActionResult<JobDto>> ChangeStatus(int id, JobStatusChangeDto dto)
    {
        // Both Admin and Personnel can change status
        // Personnel can only change status of assigned jobs
        if (!IsAdmin && !IsPersonnel) return Forbid();

        if (IsPersonnel)
        {
            var job = await _service.GetByIdAsync(id);
            if (job == null) return NotFound();
            if (job.AssignedPersonnelId != CurrentPersonnelId) return Forbid();
        }

        var changedBy = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst(ClaimTypes.Email)?.Value ?? "Unknown";
        
        try
        {
            var result = await _service.ChangeStatusAsync(id, dto, changedBy);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("{id}/payment-status")]
    public async Task<ActionResult<JobDto>> UpdatePaymentStatus(int id, [FromBody] PaymentStatus status)
    {
        if (!IsAdmin) return Forbid();
        try
        {
            var job = await _service.UpdatePaymentStatusAsync(id, status);
            return Ok(job);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPut("{id}/cancel")]
    public async Task<ActionResult<JobDto>> CancelJob(int id)
    {
        if (!IsAdmin) return Forbid();
        
        var changedBy = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst(ClaimTypes.Email)?.Value ?? "Admin";
        
        try
        {
            var result = await _service.ChangeStatusAsync(id, new JobStatusChangeDto { NewStatus = JobStatus.Canceled }, changedBy);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
