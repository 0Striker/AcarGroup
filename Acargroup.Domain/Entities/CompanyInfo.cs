using Acargroup.Domain.Common;

namespace Acargroup.Domain.Entities;

public class CompanyInfo : BaseEntity
{
    public string Title { get; set; } = null!;
    public string Subtitle { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string? HeroImageUrl { get; set; }
    public string? SliderImageUrl1 { get; set; }
    public string? SliderImageUrl2 { get; set; }
    public string? SliderImageUrl3 { get; set; }
    public string? VideoUrl { get; set; }
    public string? GalleryImageUrls { get; set; } // JSON array of image URLs
    public string? LogoUrl { get; set; }
    
    // Contact Info
    public string? Address { get; set; }
    public string? PhoneNumber { get; set; }
    public string? PhoneNumber2 { get; set; }
    public string? Email { get; set; }
    public string? Email2 { get; set; }
    public string? WhatsappNumber { get; set; }
    public string? MapUrl { get; set; }

    // Settings
    public string? LogoTitle { get; set; } = "AcarGroup";
    public string? LogoText { get; set; } = "Teknoloji & Güvenlik";
    public string? TickerText { get; set; } = "Acar Group Bilişim Teknolojileri ve Güvenlik";
    public bool ShowCurrencyRates { get; set; } = true;
    public bool IsWhatsappButtonActive { get; set; } = true;
    public bool IsInternetApplicationButtonActive { get; set; } = true;
}
