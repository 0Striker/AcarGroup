using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;

namespace Acargroup.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public partial class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly ICloudinaryService _cloudinaryService;

    public ProductsController(IProductService productService, ICloudinaryService cloudinaryService)
    {
        _productService = productService;
        _cloudinaryService = cloudinaryService;
    }

    // GET: api/products
    [HttpGet]
    public async Task<ActionResult<List<ProductDto>>> GetAll()
    {
        var products = await _productService.GetAllAsync();
        return Ok(products);
    }

    // GET: api/products/5
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetById(int id)
    {
        var product = await _productService.GetByIdAsync(id);
        if (product == null)
            return NotFound();

        return Ok(product);
    }

    // POST: api/products
    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create([FromBody] CreateProductDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var product = await _productService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    // PUT: api/products/5
    [HttpPut("{id}")]
    public async Task<ActionResult<ProductDto>> Update(int id, [FromBody] UpdateProductDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var product = await _productService.UpdateAsync(id, dto);
        if (product == null)
            return NotFound();

        return Ok(product);
    }

    // DELETE: api/products/5
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var result = await _productService.DeleteAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}
