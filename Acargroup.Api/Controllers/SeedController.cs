using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Acargroup.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SeedController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public SeedController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    [HttpPost("users")]
    public async Task<IActionResult> SeedUsers()
    {
        var users = new List<object>();

        // Member User
        try
        {
            var member = await _customerService.RegisterAsync(new CustomerRegisterDto
            {
                FullName = "Test Üye",
                Email = "uye@acargroup.com",
                Phone = "5551112233",
                Password = "123",
                IsAdmin = false
            });
            users.Add(new { Role = "Member", Email = "uye@acargroup.com", Password = "123" });
        }
        catch (Exception ex)
        {
            users.Add(new { Role = "Member", Error = ex.Message });
        }

        // Admin User (Created as Customer for now, assuming shared auth or simple auth)
        try
        {
            var admin = await _customerService.RegisterAsync(new CustomerRegisterDto
            {
                FullName = "Admin User",
                Email = "admin@acargroup.com",
                Phone = "5559998877",
                Password = "123",
                IsAdmin = true
            });
            users.Add(new { Role = "Admin", Email = "admin@acargroup.com", Password = "123" });
        }
        catch (Exception ex)
        {
            users.Add(new { Role = "Admin", Error = ex.Message });
        }

        return Ok(users);
    }
}
