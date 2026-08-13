using ProductManagement.Application.DTOs;

namespace ProductManagement.Application.Contracts;

public interface IProductService
{
    Task<IEnumerable<ProductDto>> GetAllProductsAsync();
    Task<ProductDto?> GetProductByIdAsync(int id);
    Task<ProductDto> CreateProductAsync(CreateUpdateProductDto dto);
    Task<bool> UpdateProductAsync(int id, CreateUpdateProductDto dto);
    Task<bool> DeleteProductAsync(int id);
}
