using ProductManagement.Application.DTOs;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Application.Mapping;

public static class ProductMappingProfile
{
    public static ProductDto ToDto(this Product product)
    {
        if (product == null) return null!;
        
        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            Category = product.Category,
            CreatedAt = product.CreatedAt
        };
    }

    public static Product ToEntity(this CreateUpdateProductDto dto)
    {
        if (dto == null) return null!;

        return new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            Category = dto.Category,
            CreatedAt = dto.CreatedAt == default ? DateTime.UtcNow : dto.CreatedAt
        };
    }

    public static void UpdateEntity(this CreateUpdateProductDto dto, Product product)
    {
        if (dto == null || product == null) return;

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.Category = dto.Category;
    }
}
