namespace Acargroup.Application.DTOs;

public class CompanyInfoDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string Subtitle { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string? HeroImageUrl { get; set; }
    public string? SliderImageUrl1 { get; set; }
    public string? SliderImageUrl2 { get; set; }
    public string? SliderImageUrl3 { get; set; }
    public string? LogoUrl { get; set; }
    public string? Address { get; set; }
    public string? PhoneNumber { get; set; }
    public string? PhoneNumber2 { get; set; }
    public string? Email { get; set; }
    public string? Email2 { get; set; }
    public string? WhatsappNumber { get; set; }
    public string? MapUrl { get; set; }
    public bool IsWhatsappButtonActive { get; set; }
    public bool IsInternetApplicationButtonActive { get; set; }
    
    public string? LogoTitle { get; set; }
    public string? LogoText { get; set; }
    public string? TickerText { get; set; }
    public bool ShowCurrencyRates { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CompanyInfoCreateUpdateDto
{
    public string Title { get; set; } = null!;
    public string Subtitle { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string? HeroImageUrl { get; set; }
    public string? SliderImageUrl1 { get; set; }
    public string? SliderImageUrl2 { get; set; }
    public string? SliderImageUrl3 { get; set; }
    public string? LogoUrl { get; set; }
    
    // Contact Info
    public string? Address { get; set; }
    public string? PhoneNumber { get; set; }
    public string? PhoneNumber2 { get; set; }
    public string? Email { get; set; }
    public string? Email2 { get; set; }
    public string? WhatsappNumber { get; set; }
    public string? MapUrl { get; set; }
    public bool IsWhatsappButtonActive { get; set; }
    public bool IsInternetApplicationButtonActive { get; set; }
    
    public string? LogoTitle { get; set; }
    public string? LogoText { get; set; }
    public string? TickerText { get; set; }
    public bool ShowCurrencyRates { get; set; }
}
