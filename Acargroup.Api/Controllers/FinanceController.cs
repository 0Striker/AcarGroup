using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acargroup.Api.Controllers;

[Route("api/finance")]
[ApiController]
[Authorize]
public class FinanceController : ControllerBase
{
    private readonly IFinanceService _service;

    public FinanceController(IFinanceService service)
    {
        _service = service;
    }

    private bool IsAdmin => User.Claims.Any(c => c.Type == "IsAdmin" && c.Value == "true");
    private int CurrentCustomerId => int.Parse(User.FindFirst("CustomerId")?.Value ?? "0");

    [HttpGet("transactions")]
    public async Task<ActionResult<IEnumerable<FinanceTransactionDto>>> GetAllTransactions()
    {
        if (!IsAdmin) return Forbid();
        var transactions = await _service.GetAllTransactionsAsync();
        return Ok(transactions);
    }

    [HttpGet("customer/{customerId}/transactions")]
    public async Task<ActionResult<IEnumerable<FinanceTransactionDto>>> GetCustomerTransactions(int customerId)
    {
        if (IsAdmin)
        {
            var transactions = await _service.GetTransactionsByCustomerAsync(customerId);
            return Ok(transactions);
        }

        if (CurrentCustomerId == customerId)
        {
            var transactions = await _service.GetTransactionsByCustomerAsync(customerId);
            return Ok(transactions);
        }

        return Forbid();
    }

    [HttpGet("my-transactions")]
    public async Task<ActionResult<IEnumerable<FinanceTransactionDto>>> GetMyTransactions()
    {
        if (CurrentCustomerId <= 0) return Forbid();
        var transactions = await _service.GetTransactionsByCustomerAsync(CurrentCustomerId);
        return Ok(transactions);
    }

    [HttpGet("job/{jobId}/transactions")]
    public async Task<ActionResult<IEnumerable<FinanceTransactionDto>>> GetJobTransactions(int jobId)
    {
        if (!IsAdmin) return Forbid();
        var transactions = await _service.GetTransactionsByJobAsync(jobId);
        return Ok(transactions);
    }

    [HttpPost("transactions")]
    public async Task<ActionResult<FinanceTransactionDto>> CreateTransaction(FinanceTransactionCreateDto dto)
    {
        if (!IsAdmin) return Forbid();
        var transaction = await _service.CreateTransactionAsync(dto);
        return Ok(transaction);
    }

    [HttpGet("customer/{customerId}/balance")]
    public async Task<ActionResult<CustomerBalanceDto>> GetCustomerBalance(int customerId)
    {
        if (IsAdmin)
        {
            var balance = await _service.GetCustomerBalanceAsync(customerId);
            if (balance == null) return NotFound();
            return Ok(balance);
        }

        if (CurrentCustomerId == customerId)
        {
            var balance = await _service.GetCustomerBalanceAsync(customerId);
            if (balance == null) return NotFound();
            return Ok(balance);
        }
        
        return Forbid();
    }

    [HttpGet("my-balance")]
    public async Task<ActionResult<CustomerBalanceDto>> GetMyBalance()
    {
        if (CurrentCustomerId <= 0) return Forbid();
        var balance = await _service.GetCustomerBalanceAsync(CurrentCustomerId);
        if (balance == null) return NotFound();
        return Ok(balance);
    }
}
