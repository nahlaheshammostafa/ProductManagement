import authService from './authService';

const BASE_URL = 'http://localhost:5000/api/products';


async function getHeaders() {
  const headers = {};
  const token = await authService.getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchProducts() {
  const headers = await getHeaders();
  const response = await fetch(BASE_URL, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchProductById(id) {
  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}/${id}`, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch product with id ${id}: ${response.statusText}`);
  }
  return response.json();
}

export async function createProduct(productData) {
  const headers = await getHeaders();
  headers['Content-Type'] = 'application/json';
  
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(productData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error('Failed to create product');
    error.details = errorData;
    throw error;
  }
  return response.json();
}

export async function updateProduct(id, productData) {
  const headers = await getHeaders();
  headers['Content-Type'] = 'application/json';

  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(productData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error('Failed to update product');
    error.details = errorData;
    throw error;
  }
  return true;
}

export async function deleteProduct(id) {
  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) {
    throw new Error(`Failed to delete product: ${response.statusText}`);
  }
  return true;
}
