using Acargroup.Application.DTOs;

namespace Acargroup.Application.Interfaces;

public interface ICustomerAddressService
{
    Task<List<CustomerAddressDto>> GetByCustomerAsync(int customerId);
    Task<CustomerAddressDto> CreateAsync(int customerId, CustomerAddressCreateUpdateDto dto);
    Task<CustomerAddressDto> UpdateAsync(int customerId, int addressId, CustomerAddressCreateUpdateDto dto);
    Task DeleteAsync(int customerId, int addressId);
}
