using Acargroup.Application.DTOs;

namespace Acargroup.Application.Interfaces;

public interface ICustomerService
{
    Task<CustomerDto> RegisterAsync(CustomerRegisterDto dto);
    Task<CustomerDto?> GetByEmailAsync(string email);
    Task<List<CustomerDto>> GetAllAsync();
    Task<CustomerDto> CreateAsync(CustomerCreateDto dto);
    Task<CustomerDto> UpdateAsync(int id, CustomerUpdateDto dto);
    Task DeleteAsync(int id);
    Task ChangePasswordAsync(int customerId, ChangePasswordDto dto);
}
