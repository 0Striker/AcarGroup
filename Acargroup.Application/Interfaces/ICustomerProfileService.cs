using Acargroup.Application.DTOs;

namespace Acargroup.Application.Interfaces;

public interface ICustomerProfileService
{
    Task<CustomerProfileDto?> GetProfileAsync(int customerId);
    Task<CustomerProfileDto?> UpdateProfileAsync(int customerId, CustomerProfileUpdateDto dto);
}
