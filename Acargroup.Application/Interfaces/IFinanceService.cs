using Acargroup.Application.DTOs;

namespace Acargroup.Application.Interfaces;

public interface IFinanceService
{
    Task<IEnumerable<FinanceTransactionDto>> GetAllTransactionsAsync();
    Task<IEnumerable<FinanceTransactionDto>> GetTransactionsByCustomerAsync(int customerId);
    Task<IEnumerable<FinanceTransactionDto>> GetTransactionsByJobAsync(int jobId);
    Task<FinanceTransactionDto> CreateTransactionAsync(FinanceTransactionCreateDto dto);
    Task<CustomerBalanceDto?> GetCustomerBalanceAsync(int customerId);
    Task UpdateCustomerBalanceAsync(int customerId);
}
