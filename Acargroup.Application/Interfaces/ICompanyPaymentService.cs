using Acargroup.Application.DTOs;

namespace Acargroup.Application.Interfaces;

public interface ICompanyPaymentService
{
    Task<IEnumerable<CompanyPaymentDto>> GetAllAsync();
    Task<CompanyPaymentDto?> GetByIdAsync(int id);
    Task<CompanyPaymentDto> CreateAsync(CompanyPaymentCreateDto dto);
    Task<CompanyPaymentDto?> UpdateAsync(int id, CompanyPaymentUpdateDto dto);
    Task<bool> DeleteAsync(int id);
    Task<decimal> GetTotalAmountAsync();
}
