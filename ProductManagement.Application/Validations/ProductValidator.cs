using FluentValidation;
using ProductManagement.Application.DTOs;
using ProductManagement.Domain.Contracts;

namespace ProductManagement.Application.Validations;

public class ProductValidator : AbstractValidator<CreateUpdateProductDto>
{
    public ProductValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Name is required.")
            .Matches(@"^[\p{L}\p{N}\s\-_]+$")
            .WithMessage("Name contains invalid characters.");

        RuleFor(x => x.Price)
            .GreaterThan(0)
            .WithMessage("Price must be greater than zero.");

        RuleFor(x => x.Category)
            .IsInEnum()
            .WithMessage("A valid product category is required.");
    }
}
