using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Acargroup.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    // GET: api/categories
    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetAll()
    {
        var categories = await _categoryService.GetAllAsync();
        return Ok(categories);
    }

    // GET: api/categories/5
    [HttpGet("{id}")]
    public async Task<ActionResult<CategoryDto>> GetById(int id)
    {
        var category = await _categoryService.GetByIdAsync(id);
        if (category == null)
            return NotFound();

        return Ok(category);
    }

    // POST: api/categories
    [HttpPost]
    public async Task<ActionResult<CategoryDto>> Create([FromBody] CreateCategoryDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var category = await _categoryService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
    }

    // PUT: api/categories/5
    [HttpPut("{id}")]
    public async Task<ActionResult<CategoryDto>> Update(int id, [FromBody] UpdateCategoryDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var category = await _categoryService.UpdateAsync(id, dto);
        if (category == null)
            return NotFound();

        return Ok(category);
    }

    // DELETE: api/categories/5
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var result = await _categoryService.DeleteAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}
