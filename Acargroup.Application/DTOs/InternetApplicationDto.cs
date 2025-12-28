namespace Acargroup.Application.DTOs;

public class InternetApplicationDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public int Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateInternetApplicationDto
{
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}

public class UpdateInternetApplicationDto
{
    public int Status { get; set; }
}
