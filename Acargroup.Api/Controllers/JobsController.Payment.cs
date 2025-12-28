using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Acargroup.Api.Controllers;

public partial class JobsController
{
    [HttpPost("{id}/payment")]
    public async Task<ActionResult<JobDto>> RecordPayment(int id, [FromBody] PaymentRecordDto dto)
    {
        // Only personnel can record payment
        if (!IsPersonnel) return Forbid();

        var job = await _service.GetByIdAsync(id);
        if (job == null) return NotFound();
        
        // Personnel can only record payment for their assigned jobs
        if (job.AssignedPersonnelId != CurrentPersonnelId) 
            return Forbid();

        // Job must be completed
        if (job.Status != JobStatus.Completed)
            return BadRequest("İş tamamlanmadan ödeme alınamaz.");

        // Payment already recorded
        if (job.PaymentReceived != null)
            return BadRequest("Bu iş için ödeme zaten kaydedilmiş.");

        if (dto.Amount <= 0)
            return BadRequest("Geçersiz tutar.");

        try
        {
            // Update job with payment
            var updatedJob = await _service.RecordPaymentAsync(id, dto.Amount);

            // Create finance transaction (Income from customer)
            var financeDto = new FinanceTransactionCreateDto
            {
                CustomerId = job.CustomerId,
                JobId = id,
                Type = TransactionType.Income, // 0 = Income (payment received)
                Amount = dto.Amount,
                Description = $"{job.Title} - Ödeme Alındı",
                ReferenceNumber = $"JOB-{id}",
                Notes = $"Personel tarafından kaydedildi"
            };

            await _financeService.CreateTransactionAsync(financeDto);

            return Ok(updatedJob);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Ödeme kaydedilemedi: {ex.Message}");
        }
    }
}

public class PaymentRecordDto
{
    public decimal Amount { get; set; }
}
