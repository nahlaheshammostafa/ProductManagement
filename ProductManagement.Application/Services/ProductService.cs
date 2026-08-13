using ProductManagement.Application.Contracts;
using ProductManagement.Application.DTOs;
using ProductManagement.Application.Mapping;
using ProductManagement.Domain.Contracts;

namespace ProductManagement.Application.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;

    public ProductService(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<IEnumerable<ProductDto>> GetAllProductsAsync()
    {
        var products = await _productRepository.GetAllAsync();
        return products.Select(p => p.ToDto());
    }

    public async Task<ProductDto?> GetProductByIdAsync(int id)
    {
        var product = await _productRepository.GetByIdAsync(id);
        return product?.ToDto();
    }

    public async Task<ProductDto> CreateProductAsync(CreateUpdateProductDto dto)
    {
        var product = dto.ToEntity();
        var addedProduct = await _productRepository.AddAsync(product);
        return addedProduct.ToDto();
    }

    public async Task<bool> UpdateProductAsync(int id, CreateUpdateProductDto dto)
    {
        var existingProduct = await _productRepository.GetByIdAsync(id);
        if (existingProduct == null)
        {
            return false;
        }

        dto.UpdateEntity(existingProduct);
        await _productRepository.UpdateAsync(existingProduct);
        return true;
    }

    public async Task<bool> DeleteProductAsync(int id)
    {
        var existingProduct = await _productRepository.GetByIdAsync(id);
        if (existingProduct == null)
        {
            return false;
        }

        await _productRepository.DeleteAsync(id);
        return true;
    }
}
