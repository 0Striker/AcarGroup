using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acargroup.Api.Controllers;

[Route("api/accounting")]
[ApiController]
[Authorize]
public class AccountingController : ControllerBase
{
    private readonly IAccountingService _service;

    public AccountingController(IAccountingService service)
    {
        _service = service;
    }

    private bool IsAdmin => User.Claims.Any(c => c.Type == "IsAdmin" && c.Value == "true");

    [HttpGet("expenses")]
    public async Task<ActionResult<IEnumerable<AccountingExpenseDto>>> GetAllExpenses()
    {
        if (!IsAdmin) return Forbid();
        var expenses = await _service.GetAllExpensesAsync();
        return Ok(expenses);
    }

    [HttpGet("expenses/category/{category}")]
    public async Task<ActionResult<IEnumerable<AccountingExpenseDto>>> GetExpensesByCategory(ExpenseCategory category)
    {
        if (!IsAdmin) return Forbid();
        var expenses = await _service.GetExpensesByCategoryAsync(category);
        return Ok(expenses);
    }

    [HttpGet("expenses/range")]
    public async Task<ActionResult<IEnumerable<AccountingExpenseDto>>> GetExpensesByDateRange(
        [FromQuery] DateTime start,
        [FromQuery] DateTime end)
    {
        if (!IsAdmin) return Forbid();
        var expenses = await _service.GetExpensesByDateRangeAsync(start, end);
        return Ok(expenses);
    }

    [HttpGet("expenses/{id}")]
    public async Task<ActionResult<AccountingExpenseDto>> GetExpenseById(int id)
    {
        if (!IsAdmin) return Forbid();
        var expense = await _service.GetExpenseByIdAsync(id);
        if (expense == null) return NotFound();
        return Ok(expense);
    }

    [HttpPost("expenses")]
    public async Task<ActionResult<AccountingExpenseDto>> CreateExpense(CreateAccountingExpenseDto dto)
    {
        if (!IsAdmin) return Forbid();
        var expense = await _service.CreateExpenseAsync(dto);
        return CreatedAtAction(nameof(GetExpenseById), new { id = expense.Id }, expense);
    }

    [HttpPut("expenses/{id}")]
    public async Task<ActionResult<AccountingExpenseDto>> UpdateExpense(int id, CreateAccountingExpenseDto dto)
    {
        if (!IsAdmin) return Forbid();
        try
        {
            var expense = await _service.UpdateExpenseAsync(id, dto);
            return Ok(expense);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("expenses/{id}")]
    public async Task<IActionResult> DeleteExpense(int id)
    {
        if (!IsAdmin) return Forbid();
        var result = await _service.DeleteExpenseAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
