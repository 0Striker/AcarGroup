using Acargroup.Application.DTOs;

namespace Acargroup.Application.Interfaces;

public interface ICustomerPurchasedProductService
{
    Task<List<CustomerPurchasedProductDto>> GetByCustomerAsync(int customerId);
    Task<CustomerPurchasedProductDto> CreateAsync(int customerId, CustomerPurchasedProductCreateDto dto);
    Task<bool> DeleteAsync(int id);
}
