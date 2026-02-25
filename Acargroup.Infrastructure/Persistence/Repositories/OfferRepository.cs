using Acargroup.Application.Interfaces;
using Acargroup.Domain.Entities;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Persistence.Repositories;

public class OfferRepository : IOfferRepository
{
    private readonly AcargroupDbContext _context;

    public OfferRepository(AcargroupDbContext context)
    {
        _context = context;
    }

    public async Task<List<Offer>> GetAllAsync()
    {
        return await _context.Offers
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<Offer?> GetByIdAsync(int id)
    {
        return await _context.Offers
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<Offer> AddAsync(Offer offer)
    {
        await _context.Offers.AddAsync(offer);
        await _context.SaveChangesAsync();
        return offer;
    }

    public async Task UpdateAsync(Offer offer)
    {
        _context.Offers.Update(offer);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Offer offer)
    {
        _context.Offers.Remove(offer);
        await _context.SaveChangesAsync();
    }

    public async Task<string> GenerateOfferNumberAsync()
    {
        var year = DateTime.Now.Year;
        var lastOffer = await _context.Offers
            .Where(o => o.OfferNumber.StartsWith($"TKL-{year}-"))
            .OrderByDescending(o => o.OfferNumber)
            .FirstOrDefaultAsync();

        if (lastOffer == null)
        {
            return $"TKL-{year}-001";
        }

        var lastNumberStr = lastOffer.OfferNumber.Split('-').Last();
        if (int.TryParse(lastNumberStr, out int lastNumber))
        {
            return $"TKL-{year}-{(lastNumber + 1):D3}";
        }

        return $"TKL-{year}-001";
    }
}
