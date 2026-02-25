using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Entities;
using Acargroup.Domain.Enums;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Services;

public class AccountingService : IAccountingService
{
    private readonly AcargroupDbContext _context;

    public AccountingService(AcargroupDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<AccountingExpenseDto>> GetAllExpensesAsync()
    {
        var expenses = await _context.AccountingExpenses
            .OrderByDescending(e => e.PaymentDate)
            .ToListAsync();

        return expenses.Select(MapToDto);
    }

    public async Task<IEnumerable<AccountingExpenseDto>> GetExpensesByCategoryAsync(ExpenseCategory category)
    {
        var expenses = await _context.AccountingExpenses
            .Where(e => e.Category == category)
            .OrderByDescending(e => e.PaymentDate)
            .ToListAsync();

        return expenses.Select(MapToDto);
    }

    public async Task<IEnumerable<AccountingExpenseDto>> GetExpensesByDateRangeAsync(DateTime start, DateTime end)
    {
        var expenses = await _context.AccountingExpenses
            .Where(e => e.PaymentDate >= start && e.PaymentDate <= end)
            .OrderByDescending(e => e.PaymentDate)
            .ToListAsync();

        return expenses.Select(MapToDto);
    }

    public async Task<AccountingExpenseDto?> GetExpenseByIdAsync(int id)
    {
        var expense = await _context.AccountingExpenses.FindAsync(id);
        return expense == null ? null : MapToDto(expense);
    }

    public async Task<AccountingExpenseDto> CreateExpenseAsync(CreateAccountingExpenseDto dto)
    {
        var expense = new AccountingExpense
        {
            Category = dto.Category,
            Description = dto.Description,
            Amount = dto.Amount,
            PaymentDate = dto.PaymentDate,
            IsRecurring = dto.IsRecurring,
            RecurringPeriod = dto.RecurringPeriod,
            Notes = dto.Notes,
            ReferenceNumber = dto.ReferenceNumber,
            CreatedAt = DateTime.UtcNow
        };

        _context.AccountingExpenses.Add(expense);
        await _context.SaveChangesAsync();

        return MapToDto(expense);
    }

    public async Task<AccountingExpenseDto> UpdateExpenseAsync(int id, CreateAccountingExpenseDto dto)
    {
        var expense = await _context.AccountingExpenses.FindAsync(id);
        if (expense == null)
            throw new KeyNotFoundException($"Accounting expense with ID {id} not found.");

        expense.Category = dto.Category;
        expense.Description = dto.Description;
        expense.Amount = dto.Amount;
        expense.PaymentDate = dto.PaymentDate;
        expense.IsRecurring = dto.IsRecurring;
        expense.RecurringPeriod = dto.RecurringPeriod;
        expense.Notes = dto.Notes;
        expense.ReferenceNumber = dto.ReferenceNumber;
        expense.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDto(expense);
    }

    public async Task<bool> DeleteExpenseAsync(int id)
    {
        var expense = await _context.AccountingExpenses.FindAsync(id);
        if (expense == null) return false;

        _context.AccountingExpenses.Remove(expense);
        await _context.SaveChangesAsync();

        return true;
    }

    private static AccountingExpenseDto MapToDto(AccountingExpense expense)
    {
        return new AccountingExpenseDto
        {
            Id = expense.Id,
            Category = expense.Category,
            Description = expense.Description,
            Amount = expense.Amount,
            PaymentDate = expense.PaymentDate,
            IsRecurring = expense.IsRecurring,
            RecurringPeriod = expense.RecurringPeriod,
            Notes = expense.Notes,
            ReferenceNumber = expense.ReferenceNumber,
            CreatedAt = expense.CreatedAt
        };
    }
}
