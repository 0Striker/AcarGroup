using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acargroup.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/company-payments")]
public class CompanyPaymentsController : ControllerBase
{
    private readonly ICompanyPaymentService _companyPaymentService;

    public CompanyPaymentsController(ICompanyPaymentService companyPaymentService)
    {
        _companyPaymentService = companyPaymentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var payments = await _companyPaymentService.GetAllAsync();
        return Ok(payments);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var payment = await _companyPaymentService.GetByIdAsync(id);
        if (payment == null)
            return NotFound();

        return Ok(payment);
    }

    [HttpGet("total")]
    public async Task<IActionResult> GetTotal()
    {
        var total = await _companyPaymentService.GetTotalAmountAsync();
        return Ok(new { total });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CompanyPaymentCreateDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var payment = await _companyPaymentService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = payment.Id }, payment);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CompanyPaymentUpdateDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var payment = await _companyPaymentService.UpdateAsync(id, dto);
        if (payment == null)
            return NotFound();

        return Ok(payment);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _companyPaymentService.DeleteAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}
