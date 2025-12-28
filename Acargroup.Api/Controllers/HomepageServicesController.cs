using Acargroup.Domain.Entities;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class HomepageServicesController : ControllerBase
{
    private readonly AcargroupDbContext _context;

    public HomepageServicesController(AcargroupDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<HomepageServiceItem>>> GetServices()
    {
        return await _context.HomepageServices.OrderBy(s => s.DisplayOrder).ToListAsync();
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<HomepageServiceItem>> CreateService(HomepageServiceItem service)
    {
        service.CreatedAt = DateTime.UtcNow;
        _context.HomepageServices.Add(service);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetService", new { id = service.Id }, service);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<HomepageServiceItem>> GetService(int id)
    {
        var service = await _context.HomepageServices.FindAsync(id);

        if (service == null)
        {
            return NotFound();
        }

        return service;
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateService(int id, HomepageServiceItem service)
    {
        if (id != service.Id)
        {
            return BadRequest();
        }

        var existingService = await _context.HomepageServices.FindAsync(id);
        if (existingService == null)
        {
            return NotFound();
        }

        existingService.Title = service.Title;
        existingService.Description = service.Description;
        existingService.DetailedDescription = service.DetailedDescription;
        // Icon and DisplayOrder can be updated too
        existingService.Icon = service.Icon;
        existingService.DisplayOrder = service.DisplayOrder;
        existingService.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ServiceExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteService(int id)
    {
        var service = await _context.HomepageServices.FindAsync(id);
        if (service == null)
        {
            return NotFound();
        }

        _context.HomepageServices.Remove(service);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool ServiceExists(int id)
    {
        return _context.HomepageServices.Any(e => e.Id == id);
    }
}
