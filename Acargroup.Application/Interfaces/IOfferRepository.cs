using Acargroup.Domain.Entities;

namespace Acargroup.Application.Interfaces;

public interface IOfferRepository
{
    Task<List<Offer>> GetAllAsync();
    Task<Offer?> GetByIdAsync(int id);
    Task<Offer> AddAsync(Offer offer);
    Task UpdateAsync(Offer offer);
    Task DeleteAsync(Offer offer);
    Task<string> GenerateOfferNumberAsync();
}
