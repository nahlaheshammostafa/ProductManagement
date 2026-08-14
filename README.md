Product Catalog Management System
A full-stack web application for managing a product catalog, built with .NET 10 (ASP.NET Core Web API) and SQL Server on the backend, and Vue 3 on the frontend.

The application implements Single Sign-On (SSO) via Microsoft Entra ID (Azure AD). Users log in once with their corporate credentials to securely access, search, and manage products across the system.

Project Overview:
The main objective of this task was to build a clean, secure product management dashboard integrated with enterprise SSO. Key highlights:

Enterprise SSO Integration: Implemented Single Sign-On using Microsoft Entra ID (Azure AD) with MSAL to secure both the Vue SPA and ASP.NET Core Web API.

Clean Architecture: Organized the backend into four decoupled layers (Domain, Application, Infrastructure, API) to keep business logic maintainable and isolated from external dependencies.

End-to-End Validation: Combined client-side form checks with server-side FluentValidation rules to keep data consistent and prevent bad inputs.


Tech Stack & Architecture:
Backend
Framework & Language: .NET 10 (ASP.NET Core Web API), C# 14

Database & ORM: SQL Server with Entity Framework Core 10 (Code-First)

Validation: FluentValidation

Authentication / SSO: JWT Bearer token validation linked to Microsoft Entra ID

API Documentation: Swagger / OpenAPI with custom Bearer token support for testing protected endpoints

Backend Structure (Clean Architecture)
Domain (ProductManagement.Domain): Core domain entity (Product), enums (ProductCategory), and repository interfaces (IProductRepository) without external dependencies.

Application (ProductManagement.Application): Business use cases, services (ProductService), DTOs, object mapping, and FluentValidation rules.

Infrastructure (ProductManagement.Infrastructure): Database context (AppDbContext), EF Core migrations, and data access repositories.

API (ProductManagement.Api): Controllers, route handling, CORS configuration, JWT verification middleware, and Swagger setup.

Frontend
Framework: Vue 3 (Single-Page Application)

SSO / Auth Client: @azure/msal-browser using Authorization Code Flow with PKCE

Styling: Custom CSS (Flexbox/Grid layout, custom cards, dark theme)

HTTP Requests: Native Fetch API wrapped to automatically attach the SSO Bearer token to every request


Features:
Single Sign-On (SSO) & Security:
SSO Login / Logout: Integrated Microsoft Entra ID redirect login flow so users authenticate once with their work account.

Silent Token Renewal: Uses acquireTokenSilent with a redirect fallback to keep sessions active seamlessly without re-prompting.

Session Persistence: Restores active account state on page refresh.

Protected Endpoints: Controller-level protection using [Authorize] attributes and token claim validation.

Swagger Integration: Configured Bearer token authorization directly inside Swagger UI for easy endpoint testing.

Product Management (CRUD):
View catalog items in a responsive grid with name, description, category badge, price, and created date.

Modal forms for creating and editing products.

Delete confirmation modal to avoid accidental removals.

Automatic price formatting (USD) and localized date strings.

Search & Categorization:
Live search filtering by product name or description.

Category filter dropdown (Electronics, Clothing, Food, Books, Beauty, Other).

Input Validation:
Client-Side: Immediate form feedback and clear validation alerts inside dialogs.

Server-Side (FluentValidation):

Name: Required, character length rules, and safe string regex pattern.

Price: Must be greater than 0.

Category: Validated against defined enum values.


Microsoft Entra ID SSO Authentication Flow:

1. User clicks Login
        ↓
2. MSAL generates Code Verifier
        ↓
3. MSAL creates Code Challenge
        ↓
4. Redirect to Microsoft Entra ID
        ↓
5. User authenticates
        ↓
6. Microsoft returns Authorization Code
        ↓
7. MSAL sends Code + Code Verifier
        ↓
8. Microsoft validates PKCE
        ↓
9. Microsoft returns tokens
        ↓
10. Vue gets Access Token
        ↓
11. Vue calls ASP.NET Core API
        ↓
12. Authorization: Bearer <token>
        ↓
13. API validates JWT
        ↓
14. [Authorize] allows request


Microsoft Entra ID (Azure AD) Configuration:

Step 1: Create App Registration

Go to Microsoft Entra ID → App registrations → New registration.
Enter the application name: Product Management.
Select Single tenant under Supported account types.
Under Redirect URI, select SPA and add: http://localhost:8080
Click Register.

Step 2: Get Application IDs

From the app Overview page, copy:

Application (Client) ID
Directory (Tenant) ID

These IDs are used in both the frontend and backend configuration.

Step 3: Configure the Backend and Frontend

Update appsettings.json with the IDs from the App Registration.
The same Client ID and Tenant ID are also configured in the Vue frontend.
