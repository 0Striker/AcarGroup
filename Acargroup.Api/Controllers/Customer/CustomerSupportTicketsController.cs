using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acargroup.Api.Controllers.Customer;

[Route("api/customer/support-tickets")]
[ApiController]
[Authorize]
public class CustomerSupportTicketsController : ControllerBase
{
    private readonly ISupportTicketService _ticketService;
    private readonly IWebHostEnvironment _environment;

    public CustomerSupportTicketsController(ISupportTicketService ticketService, IWebHostEnvironment environment)
    {
        _ticketService = ticketService;
        _environment = environment;
    }

    [HttpGet]
    public async Task<ActionResult<List<SupportTicketListDto>>> GetTickets([FromQuery] string? status = null)
    {
        if (!TryGetCustomerId(out var customerId))
        {
            return Unauthorized();
        }

        var tickets = await _ticketService.GetByCustomerAsync(customerId, status);
        return Ok(tickets);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SupportTicketDetailDto>> GetTicketById(int id)
    {
        if (!TryGetCustomerId(out var customerId))
        {
            return Unauthorized();
        }

        var ticket = await _ticketService.GetByIdForCustomerAsync(customerId, id);
        if (ticket == null)
        {
            return NotFound();
        }

        return Ok(ticket);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<SupportTicketDetailDto>> CreateTicket([FromForm] SupportTicketCreateRequest request)
    {
        if (!TryGetCustomerId(out var customerId))
        {
            return Unauthorized();
        }

        string? imagePath = null;

        // Handle file upload
        if (request.Image != null && request.Image.Length > 0)
        {
            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var extension = Path.GetExtension(request.Image.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest("Sadece resim dosyaları yüklenebilir (.jpg, .jpeg, .png, .gif).");
            }

            // Validate file size (max 5MB)
            if (request.Image.Length > 5 * 1024 * 1024)
            {
                return BadRequest("Dosya boyutu maksimum 5MB olmalıdır.");
            }

            var webRoot = string.IsNullOrWhiteSpace(_environment.WebRootPath)
                ? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot")
                : _environment.WebRootPath!;
            Directory.CreateDirectory(webRoot);

            // Create upload directory if it doesn't exist
            var uploadsFolder = Path.Combine(webRoot, "uploads", "support-tickets");
            Directory.CreateDirectory(uploadsFolder);

            // Generate unique filename
            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await request.Image.CopyToAsync(stream);
            }

            // Store relative path
            imagePath = Path.Combine("uploads", "support-tickets", fileName).Replace("\\", "/");
        }

        var dto = new SupportTicketCreateDto
        {
            CustomerAddressId = request.CustomerAddressId,
            Title = request.Title,
            Description = request.Description,
            ProductName = request.ProductName,
            SerialNumber = request.SerialNumber
        };

        var ticket = await _ticketService.CreateAsync(customerId, dto, imagePath);
        return CreatedAtAction(nameof(GetTicketById), new { id = ticket.Id }, ticket);
    }

    private bool TryGetCustomerId(out int customerId)
    {
        customerId = 0;
        var claimValue = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        return int.TryParse(claimValue, out customerId) && customerId > 0;
    }
}

// Request model for multipart/form-data
public class SupportTicketCreateRequest
{
    public int CustomerAddressId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? ProductName { get; set; }
    public string? SerialNumber { get; set; }
    public IFormFile? Image { get; set; }
}
