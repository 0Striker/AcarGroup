using Acargroup.Application.DTOs;
using Acargroup.Domain.Enums;

namespace Acargroup.Application.Interfaces;

public interface IAccountingService
{
    Task<IEnumerable<AccountingExpenseDto>> GetAllExpensesAsync();
    Task<IEnumerable<AccountingExpenseDto>> GetExpensesByCategoryAsync(ExpenseCategory category);
    Task<IEnumerable<AccountingExpenseDto>> GetExpensesByDateRangeAsync(DateTime start, DateTime end);
    Task<AccountingExpenseDto?> GetExpenseByIdAsync(int id);
    Task<AccountingExpenseDto> CreateExpenseAsync(CreateAccountingExpenseDto dto);
    Task<AccountingExpenseDto> UpdateExpenseAsync(int id, CreateAccountingExpenseDto dto);
    Task<bool> DeleteExpenseAsync(int id);
}
