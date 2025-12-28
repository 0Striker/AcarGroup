using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Entities;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Services;

public class CompanyInfoService : ICompanyInfoService
{
    private readonly AcargroupDbContext _context;

    public CompanyInfoService(AcargroupDbContext context)
    {
        _context = context;
    }

    public async Task<CompanyInfoDto?> GetAsync()
    {
        var entity = await _context.CompanyInfos
            .OrderByDescending(c => c.CreatedAt)
            .FirstOrDefaultAsync();

        if (entity == null)
            return null;

        return new CompanyInfoDto
        {
            Id = entity.Id,
            Title = entity.Title,
            Subtitle = entity.Subtitle,
            Content = entity.Content,
            HeroImageUrl = entity.HeroImageUrl,
            SliderImageUrl1 = entity.SliderImageUrl1,
            SliderImageUrl2 = entity.SliderImageUrl2,
            SliderImageUrl3 = entity.SliderImageUrl3,
            LogoUrl = entity.LogoUrl,
            Address = entity.Address,
            PhoneNumber = entity.PhoneNumber,
            PhoneNumber2 = entity.PhoneNumber2,
            Email = entity.Email,
            Email2 = entity.Email2,
            WhatsappNumber = entity.WhatsappNumber,
            MapUrl = entity.MapUrl,
            IsWhatsappButtonActive = entity.IsWhatsappButtonActive,
            IsInternetApplicationButtonActive = entity.IsInternetApplicationButtonActive,
            LogoTitle = entity.LogoTitle,
            LogoText = entity.LogoText,
            TickerText = entity.TickerText,
            ShowCurrencyRates = entity.ShowCurrencyRates,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }

    public async Task<CompanyInfoDto> CreateOrUpdateAsync(CompanyInfoCreateUpdateDto dto)
    {
        var existing = await _context.CompanyInfos
            .OrderByDescending(c => c.CreatedAt)
            .FirstOrDefaultAsync();

        if (existing == null)
        {
            // Create new
            var newEntity = new CompanyInfo
            {
                Title = dto.Title,
                Subtitle = dto.Subtitle,
                Content = dto.Content,
                HeroImageUrl = dto.HeroImageUrl,
                SliderImageUrl1 = dto.SliderImageUrl1,
                SliderImageUrl2 = dto.SliderImageUrl2,
                SliderImageUrl3 = dto.SliderImageUrl3,
                Address = dto.Address,
                PhoneNumber = dto.PhoneNumber,
                PhoneNumber2 = dto.PhoneNumber2,
                Email = dto.Email,
                Email2 = dto.Email2,
                WhatsappNumber = dto.WhatsappNumber,
                MapUrl = dto.MapUrl,
                IsWhatsappButtonActive = dto.IsWhatsappButtonActive,
                IsInternetApplicationButtonActive = dto.IsInternetApplicationButtonActive,
                LogoTitle = dto.LogoTitle,
                LogoText = dto.LogoText,
                TickerText = dto.TickerText,
                ShowCurrencyRates = dto.ShowCurrencyRates,
                CreatedAt = DateTime.UtcNow
            };

            _context.CompanyInfos.Add(newEntity);
            await _context.SaveChangesAsync();

            return new CompanyInfoDto
            {
                Id = newEntity.Id,
                Title = newEntity.Title,
                Subtitle = newEntity.Subtitle,
                Content = newEntity.Content,
                HeroImageUrl = newEntity.HeroImageUrl,
                SliderImageUrl1 = newEntity.SliderImageUrl1,
                SliderImageUrl2 = newEntity.SliderImageUrl2,
                SliderImageUrl3 = newEntity.SliderImageUrl3,
                Address = newEntity.Address,
                PhoneNumber = newEntity.PhoneNumber,
                PhoneNumber2 = newEntity.PhoneNumber2,
                Email = newEntity.Email,
                Email2 = newEntity.Email2,
                WhatsappNumber = newEntity.WhatsappNumber,
                MapUrl = newEntity.MapUrl,
                IsWhatsappButtonActive = newEntity.IsWhatsappButtonActive,
                IsInternetApplicationButtonActive = newEntity.IsInternetApplicationButtonActive,
                LogoTitle = newEntity.LogoTitle,
                LogoText = newEntity.LogoText,
                TickerText = newEntity.TickerText,
                ShowCurrencyRates = newEntity.ShowCurrencyRates,
                CreatedAt = newEntity.CreatedAt,
                UpdatedAt = newEntity.UpdatedAt
            };
        }
        else
        {
            // Update existing
            existing.Title = dto.Title;
            existing.Subtitle = dto.Subtitle;
            existing.Content = dto.Content;
            existing.HeroImageUrl = dto.HeroImageUrl;
            existing.SliderImageUrl1 = dto.SliderImageUrl1;
            existing.SliderImageUrl2 = dto.SliderImageUrl2;
            existing.SliderImageUrl3 = dto.SliderImageUrl3;
            existing.LogoUrl = dto.LogoUrl;
            existing.Address = dto.Address;
            existing.PhoneNumber = dto.PhoneNumber;
            existing.PhoneNumber2 = dto.PhoneNumber2;
            existing.Email = dto.Email;
            existing.Email2 = dto.Email2;
            existing.WhatsappNumber = dto.WhatsappNumber;
            existing.MapUrl = dto.MapUrl;
            existing.IsWhatsappButtonActive = dto.IsWhatsappButtonActive;
            existing.IsInternetApplicationButtonActive = dto.IsInternetApplicationButtonActive;
            existing.LogoTitle = dto.LogoTitle;
            existing.LogoText = dto.LogoText;
            existing.TickerText = dto.TickerText;
            existing.ShowCurrencyRates = dto.ShowCurrencyRates;
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new CompanyInfoDto
            {
                Id = existing.Id,
                Title = existing.Title,
                Subtitle = existing.Subtitle,
                Content = existing.Content,
                HeroImageUrl = existing.HeroImageUrl,
                SliderImageUrl1 = existing.SliderImageUrl1,
                SliderImageUrl2 = existing.SliderImageUrl2,
                SliderImageUrl3 = existing.SliderImageUrl3,
                Address = existing.Address,
                PhoneNumber = existing.PhoneNumber,
                PhoneNumber2 = existing.PhoneNumber2,
                Email = existing.Email,
                Email2 = existing.Email2,
                WhatsappNumber = existing.WhatsappNumber,
                MapUrl = existing.MapUrl,
                IsWhatsappButtonActive = existing.IsWhatsappButtonActive,
                IsInternetApplicationButtonActive = existing.IsInternetApplicationButtonActive,
                LogoTitle = existing.LogoTitle,
                LogoText = existing.LogoText,
                TickerText = existing.TickerText,
                ShowCurrencyRates = existing.ShowCurrencyRates,
                CreatedAt = existing.CreatedAt,
                UpdatedAt = existing.UpdatedAt
            };
        }
    }
}
