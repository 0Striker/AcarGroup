using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Entities;

namespace Acargroup.Infrastructure.Services;

public class OfferService : IOfferService
{
    private readonly IOfferRepository _offerRepository;

    public OfferService(IOfferRepository offerRepository)
    {
        _offerRepository = offerRepository;
    }

    public async Task<List<OfferDto>> GetAllAsync()
    {
        var offers = await _offerRepository.GetAllAsync();
        return offers.Select(MapToDto).ToList();
    }

    public async Task<List<OfferDto>> GetByCustomerIdAsync(int customerId)
    {
        var offers = await _offerRepository.GetAllAsync();
        var customerOffers = offers.Where(o => o.CustomerId == customerId).ToList();
        return customerOffers.Select(MapToDto).ToList();
    }


    public async Task<OfferDto?> GetByIdAsync(int id)
    {
        var offer = await _offerRepository.GetByIdAsync(id);
        return offer == null ? null : MapToDto(offer);
    }

    public async Task<OfferDto> CreateAsync(CreateOfferDto dto)
    {
        var offerNumber = await _offerRepository.GenerateOfferNumberAsync();
        
        var offer = new Offer
        {
            CustomerName = dto.CustomerName,
            CustomerEmail = dto.CustomerEmail,
            CustomerPhone = dto.CustomerPhone,
            CustomerAddress = dto.CustomerAddress,
            CustomerId = dto.CustomerId,
            
            OfferNumber = offerNumber,
            OfferDate = DateTime.SpecifyKind(dto.OfferDate, DateTimeKind.Utc),
            ValidUntil = DateTime.SpecifyKind(dto.ValidUntil, DateTimeKind.Utc),
            
            Currency = dto.Currency,
            ExchangeRate = dto.ExchangeRate,
            
            TaxRate = dto.TaxRate,
            Notes = dto.Notes,
            GeneralConditions = dto.GeneralConditions,
            DeliveryTime = dto.DeliveryTime,
            BankDetails = dto.BankDetails,
            Status = "Draft"
        };

        // Add items and calculate totals
        decimal subTotal = 0;
        foreach (var itemDto in dto.Items)
        {
            var item = new OfferItem
            {
                ProductId = itemDto.ProductId,
                ProductName = itemDto.ProductName,
                Description = itemDto.Description,
                Quantity = itemDto.Quantity,
                Unit = itemDto.Unit,
                UnitPrice = itemDto.UnitPrice,
                TotalPrice = itemDto.Quantity * itemDto.UnitPrice
            };
            offer.Items.Add(item);
            subTotal += item.TotalPrice;
        }

        offer.SubTotal = subTotal;
        offer.TaxAmount = subTotal * (offer.TaxRate / 100);
        offer.GrandTotal = subTotal + offer.TaxAmount;

        await _offerRepository.AddAsync(offer);
        return MapToDto(offer);
    }

    public async Task<OfferDto?> UpdateAsync(int id, UpdateOfferDto dto)
    {
        var offer = await _offerRepository.GetByIdAsync(id);
        if (offer == null) return null;

        offer.CustomerName = dto.CustomerName;
        offer.CustomerEmail = dto.CustomerEmail;
        offer.CustomerPhone = dto.CustomerPhone;
        offer.CustomerAddress = dto.CustomerAddress;
        offer.CustomerId = dto.CustomerId;
        
        offer.OfferDate = DateTime.SpecifyKind(dto.OfferDate, DateTimeKind.Utc);
        offer.ValidUntil = DateTime.SpecifyKind(dto.ValidUntil, DateTimeKind.Utc);
        
        offer.Currency = dto.Currency;
        offer.ExchangeRate = dto.ExchangeRate;
        
        offer.TaxRate = dto.TaxRate;
        offer.Notes = dto.Notes;
        offer.GeneralConditions = dto.GeneralConditions;
        offer.DeliveryTime = dto.DeliveryTime;
        offer.BankDetails = dto.BankDetails;
        offer.Status = dto.Status;

        // Clear existing items and add new ones (simple approach)
        offer.Items.Clear();
        decimal subTotal = 0;
        foreach (var itemDto in dto.Items)
        {
            var item = new OfferItem
            {
                ProductId = itemDto.ProductId,
                ProductName = itemDto.ProductName,
                Description = itemDto.Description,
                Quantity = itemDto.Quantity,
                Unit = itemDto.Unit,
                UnitPrice = itemDto.UnitPrice,
                TotalPrice = itemDto.Quantity * itemDto.UnitPrice
            };
            offer.Items.Add(item);
            subTotal += item.TotalPrice;
        }

        offer.SubTotal = subTotal;
        offer.TaxAmount = subTotal * (offer.TaxRate / 100);
        offer.GrandTotal = subTotal + offer.TaxAmount;

        await _offerRepository.UpdateAsync(offer);
        return MapToDto(offer);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var offer = await _offerRepository.GetByIdAsync(id);
        if (offer == null) return false;

        await _offerRepository.DeleteAsync(offer);
        return true;
    }

    public Task<string> GeneratePdfAsync(int id)
    {
        // Placeholder for backend PDF generation if needed
        return Task.FromResult(""); 
    }

    private static OfferDto MapToDto(Offer offer)
    {
        return new OfferDto
        {
            Id = offer.Id,
            CustomerName = offer.CustomerName,
            CustomerEmail = offer.CustomerEmail,
            CustomerPhone = offer.CustomerPhone,
            CustomerAddress = offer.CustomerAddress,
            CustomerId = offer.CustomerId,
            
            OfferNumber = offer.OfferNumber,
            OfferDate = offer.OfferDate,
            ValidUntil = offer.ValidUntil,
            
            Currency = offer.Currency,
            ExchangeRate = offer.ExchangeRate,
            
            SubTotal = offer.SubTotal,
            TaxRate = offer.TaxRate,
            TaxAmount = offer.TaxAmount,
            GrandTotal = offer.GrandTotal,
            
            Notes = offer.Notes,
            GeneralConditions = offer.GeneralConditions,
            DeliveryTime = offer.DeliveryTime,
            BankDetails = offer.BankDetails,
            Status = offer.Status,
            
            Items = offer.Items.Select(i => new OfferItemDto
            {
                Id = i.Id,
                OfferId = i.OfferId,
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                Description = i.Description,
                Quantity = i.Quantity,
                Unit = i.Unit,
                UnitPrice = i.UnitPrice,
                TotalPrice = i.TotalPrice
            }).ToList(),
            
            CreatedAt = offer.CreatedAt,
            UpdatedAt = offer.UpdatedAt
        };
    }
}
