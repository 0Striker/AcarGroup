using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Entities;
using Acargroup.Domain.Enums;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Services;

public class FinanceService : IFinanceService
{
    private readonly AcargroupDbContext _context;

    public FinanceService(AcargroupDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<FinanceTransactionDto>> GetAllTransactionsAsync()
    {
        var transactions = await _context.FinanceTransactions
            .Include(t => t.Customer)
            .Include(t => t.Job)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return transactions.Select(MapToDto);
    }

    public async Task<IEnumerable<FinanceTransactionDto>> GetTransactionsByCustomerAsync(int customerId)
    {
        var transactions = await _context.FinanceTransactions
            .Include(t => t.Customer)
            .Include(t => t.Job)
            .Where(t => t.CustomerId == customerId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return transactions.Select(MapToDto);
    }

    public async Task<IEnumerable<FinanceTransactionDto>> GetTransactionsByJobAsync(int jobId)
    {
        var transactions = await _context.FinanceTransactions
            .Include(t => t.Customer)
            .Include(t => t.Job)
            .Where(t => t.JobId == jobId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return transactions.Select(MapToDto);
    }

    public async Task<FinanceTransactionDto> CreateTransactionAsync(FinanceTransactionCreateDto dto)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var transactionEntity = new FinanceTransaction
            {
                // DEBUG LOG
                CustomerId = dto.CustomerId,
                JobId = dto.JobId,
                ExternalCustomerName = dto.ExternalCustomerName,
                ExternalJobTitle = dto.ExternalJobTitle,
                Type = dto.Type,
                Amount = dto.Amount,
                Description = dto.Description,
                ReferenceNumber = dto.ReferenceNumber,
                Notes = dto.Notes,
                VatRate = dto.VatRate,
                VatAmount = dto.VatAmount,
                IsVatIncluded = dto.IsVatIncluded,
                Currency = dto.Currency,
                PaymentType = dto.PaymentType,
                CreatedAt = DateTime.UtcNow
            };

            _context.FinanceTransactions.Add(transactionEntity);
            await _context.SaveChangesAsync();

            // Update customer balance automatically if customer is present
            if (dto.CustomerId.HasValue)
            {
                await UpdateCustomerBalanceAsync(dto.CustomerId.Value);
            }

            await transaction.CommitAsync();

            // Reload navigation properties
            if (transactionEntity.CustomerId.HasValue)
                await _context.Entry(transactionEntity).Reference(t => t.Customer).LoadAsync();
            if (dto.JobId.HasValue)
                await _context.Entry(transactionEntity).Reference(t => t.Job).LoadAsync();

            return MapToDto(transactionEntity);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<CustomerBalanceDto?> GetCustomerBalanceAsync(int customerId)
    {
        var balance = await _context.CustomerBalances
            .Include(b => b.Customer)
            .FirstOrDefaultAsync(b => b.CustomerId == customerId);

        if (balance == null)
        {
            // Create initial balance record if not exists
            var customer = await _context.Customers.FindAsync(customerId);
            if (customer == null) return null;

            balance = new CustomerBalance
            {
                CustomerId = customerId,
                TotalBalance = 0,
                TotalIncome = 0,
                TotalExpense = 0,
                CreatedAt = DateTime.UtcNow
            };
            _context.CustomerBalances.Add(balance);
            await _context.SaveChangesAsync();
            
            // Reload to get customer
            await _context.Entry(balance).Reference(b => b.Customer).LoadAsync();
        }

        return new CustomerBalanceDto
        {
            CustomerId = balance.CustomerId,
            CustomerName = balance.Customer.FullName,
            TotalBalance = balance.TotalBalance,
            TotalIncome = balance.TotalIncome,
            TotalExpense = balance.TotalExpense,
            LastUpdated = balance.UpdatedAt ?? balance.CreatedAt
        };
    }

    public async Task UpdateCustomerBalanceAsync(int customerId)
    {
        // This method might be called within an existing transaction, so we don't start a new one here unless necessary.
        // However, to be safe, we can just let it partake in the ambient transaction if one exists.
        // EF Core handles nested SaveChanges fine within the same context.
        
        var transactions = await _context.FinanceTransactions
            .Where(t => t.CustomerId == customerId)
            .ToListAsync();

        // Logic:
        // Income = Money coming IN to the company (Payment from customer) -> Reduces customer debt (Credit)
        // Expense = Money going OUT (Service Cost / Charge to customer) -> Increases customer debt (Debit)
        // Balance = Expense - Income
        // Positive Balance = Customer owes money
        // Negative Balance = Customer has credit
        
        // Wait, usually in accounting:
        // Income for Company = Credit for Customer Account (reduces receivable)
        // Expense for Company = Debit for Customer Account (increases receivable)
        
        // Let's stick to:
        // TransactionType.Income = Payment received from Customer
        // TransactionType.Expense = Service provided to Customer (Charge)
        
        var totalIncome = transactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount);
        var totalExpense = transactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount);
        var totalBalance = totalExpense - totalIncome;

        var balanceRecord = await _context.CustomerBalances
            .FirstOrDefaultAsync(b => b.CustomerId == customerId);

        if (balanceRecord == null)
        {
            balanceRecord = new CustomerBalance
            {
                CustomerId = customerId,
                CreatedAt = DateTime.UtcNow
            };
            _context.CustomerBalances.Add(balanceRecord);
        }

        balanceRecord.TotalIncome = totalIncome;
        balanceRecord.TotalExpense = totalExpense;
        balanceRecord.TotalBalance = totalBalance;
        balanceRecord.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    private static FinanceTransactionDto MapToDto(FinanceTransaction transaction)
    {
        return new FinanceTransactionDto
        {
            Id = transaction.Id,
            CustomerId = transaction.CustomerId,
            CustomerName = transaction.Customer?.FullName ?? transaction.ExternalCustomerName ?? (transaction.CustomerId.HasValue ? "Unknown Customer" : "Harici/Genel"),
            JobId = transaction.JobId,
            JobTitle = transaction.Job?.Title ?? transaction.ExternalJobTitle,
            ExternalCustomerName = transaction.ExternalCustomerName,
            ExternalJobTitle = transaction.ExternalJobTitle,
            Type = transaction.Type,
            Amount = transaction.Amount,
            Description = transaction.Description,
            ReferenceNumber = transaction.ReferenceNumber,
            Notes = transaction.Notes,
            VatRate = transaction.VatRate,
            VatAmount = transaction.VatAmount,
            IsVatIncluded = transaction.IsVatIncluded,
            Currency = transaction.Currency,
            PaymentType = transaction.PaymentType,
            CreatedAt = transaction.CreatedAt
        };
    }
}
