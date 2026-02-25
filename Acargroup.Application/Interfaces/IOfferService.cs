using Acargroup.Application.DTOs;

namespace Acargroup.Application.Interfaces;

public interface IOfferService
{
    Task<List<OfferDto>> GetAllAsync();
    Task<List<OfferDto>> GetByCustomerIdAsync(int customerId);
    Task<OfferDto?> GetByIdAsync(int id);
    Task<OfferDto> CreateAsync(CreateOfferDto dto);
    Task<OfferDto?> UpdateAsync(int id, UpdateOfferDto dto);
    Task<bool> DeleteAsync(int id);
    Task<string> GeneratePdfAsync(int id); // Returns base64 or file path
}
