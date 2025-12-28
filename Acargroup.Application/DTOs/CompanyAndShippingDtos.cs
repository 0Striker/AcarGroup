
// Shipping Company DTOs
public class ShippingCompanyDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Address { get; set; }
    public string? Phone { get; set; }
}

public class ShippingCompanyCreateDto
{
    public string Name { get; set; } = null!;
    public string? Address { get; set; }
    public string? Phone { get; set; }
}

public class ShippingCompanyUpdateDto
{
    public string Name { get; set; } = null!;
    public string? Address { get; set; }
    public string? Phone { get; set; }
}

// Company DTOs
public class CompanyDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? AuthorizedPerson { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? Email { get; set; }
    public string? Sector { get; set; }
    public string? Notes { get; set; }
    public string? StampNumber { get; set; }
    public string? LoginName { get; set; }
    public string? LoginCode { get; set; }
    public string? LoginPassword { get; set; }
    public string? ShippingCompanyName { get; set; }
}

public class CompanyCreateDto
{
    public string Name { get; set; } = null!;
    public string? AuthorizedPerson { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? Email { get; set; }
    public string? Sector { get; set; }
    public string? Notes { get; set; }
    public string? StampNumber { get; set; }
    public string? LoginName { get; set; }
    public string? LoginCode { get; set; }
    public string? LoginPassword { get; set; }
    public string? ShippingCompanyName { get; set; }
}

public class CompanyUpdateDto
{
    public string Name { get; set; } = null!;
    public string? AuthorizedPerson { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? Email { get; set; }
    public string? Sector { get; set; }
    public string? Notes { get; set; }
    public string? StampNumber { get; set; }
    public string? LoginName { get; set; }
    public string? LoginCode { get; set; }
    public string? LoginPassword { get; set; }
    public string? ShippingCompanyName { get; set; }
}
