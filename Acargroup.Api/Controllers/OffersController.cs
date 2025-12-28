using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acargroup.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class OffersController : ControllerBase
{
    private readonly IOfferService _offerService;

    public OffersController(IOfferService offerService)
    {
        _offerService = offerService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var offers = await _offerService.GetAllAsync();
        return Ok(offers);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var offer = await _offerService.GetByIdAsync(id);
        if (offer == null)
            return NotFound();
        return Ok(offer);
    }

    [HttpGet("customer/{customerId}")]
    public async Task<IActionResult> GetByCustomerId(int customerId)
    {
        var offers = await _offerService.GetByCustomerIdAsync(customerId);
        return Ok(offers);
    }


    [HttpPost]
    public async Task<IActionResult> Create(CreateOfferDto dto)
    {
        var offer = await _offerService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = offer.Id }, offer);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateOfferDto dto)
    {
        var offer = await _offerService.UpdateAsync(id, dto);
        if (offer == null)
            return NotFound();
        return Ok(offer);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _offerService.DeleteAsync(id);
        if (!result)
            return NotFound();
        return NoContent();
    }
}
