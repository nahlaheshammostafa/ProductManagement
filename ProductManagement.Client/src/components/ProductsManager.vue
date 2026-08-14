<template>
  <div class="product-manager">
    <div class="manager-header">
      <div>
        <h1>Product Directory</h1>
        <p class="subtitle">Manage products, pricing, and classifications</p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="btn-icon-svg"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Add Product
      </button>
    </div>

    <div class="control-panel">
      <div class="search-box">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search products by name or description..." 
          class="form-control search-input"
        />
      </div>
      <div class="filter-box">
        <select v-model="selectedCategory" class="form-control filter-select">
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="state-container">
      <div class="spinner"></div>
      <p>Loading products...</p>
    </div>

    <div v-else-if="error" class="state-container">
      <div class="error-banner">
        <p>{{ error }}</p>
        <button @click="loadProducts" class="btn btn-secondary btn-sm">Try Again</button>
      </div>
    </div>

    <div v-else class="table-card">
      <div class="table-responsive">
        <table v-if="filteredProducts.length > 0" class="products-table">
          <thead>
            <tr>
              <th style="width: 80px">ID</th>
              <th>Product Name</th>
              <th>Description</th>
              <th style="width: 140px">Category</th>
              <th style="width: 120px" class="text-right">Price</th>
              <th style="width: 150px">Created At</th>
              <th style="width: 120px" class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in filteredProducts" :key="product.id">
              <td class="col-id">#{{ product.id }}</td>
              <td class="col-name">{{ product.name }}</td>
              <td class="col-desc" :title="product.description">
                {{ product.description || 'No description provided' }}
              </td>
              <td>
                <span :class="['category-badge', getCategoryBadgeClass(product.category)]">
                  {{ product.category }}
                </span>
              </td>
              <td class="col-price text-right">{{ formatPrice(product.price) }}</td>
              <td class="col-date">{{ formatDate(product.createdAt) }}</td>
              <td class="col-actions text-center">
                <button @click="openEditModal(product)" class="action-btn edit-btn" title="Edit Product">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button @click="confirmDelete(product)" class="action-btn delete-btn" title="Delete Product">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="empty-state">
          <svg class="empty-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
          <h3>No products found</h3>
          <p>We couldn't find any products matching your criteria.</p>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-header">
          <h2>{{ isEdit ? 'Edit Product' : 'Add New Product' }}</h2>
          <button @click="closeModal" class="modal-close-btn">&times;</button>
        </div>
        <form @submit.prevent="handleSave">
          <div class="modal-body">
            <!-- Alert for Validation Failures -->
            <div v-if="formErrors.length > 0" class="error-alert">
              <div class="error-alert-header">Please fix the following validation errors:</div>
              <ul>
                <li v-for="(err, idx) in formErrors" :key="idx">{{ err }}</li>
              </ul>
            </div>

            <div class="form-group">
              <label for="product-name">Product Name <span class="required-indicator">*</span></label>
              <input 
                id="product-name"
                v-model="form.name"
                type="text" 
                class="form-control" 
                placeholder="Enter product name..."
                required
              />
              <span class="field-help">Can contain letters, numbers, spaces, hyphens, and underscores.</span>
            </div>

            <div class="form-row">
              <!-- Category Field -->
              <div class="form-group col-6">
                <label for="product-category">Category <span class="required-indicator">*</span></label>
                <select id="product-category" v-model="form.category" class="form-control" required>
                  <option disabled value="">Select Category</option>
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>

              <div class="form-group col-6">
                <label for="product-price">Price ($) <span class="required-indicator">*</span></label>
                <input 
                  id="product-price"
                  v-model.number="form.price"
                  type="number" 
                  step="0.01" 
                  min="0.01"
                  class="form-control" 
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="product-desc">Description</label>
              <textarea 
                id="product-desc"
                v-model="form.description"
                rows="3" 
                class="form-control" 
                placeholder="Provide a brief description..."
                maxlength="500"
              ></textarea>
              <div class="char-counter">{{ form.description.length }}/500 characters</div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              {{ submitting ? 'Saving...' : 'Save Product' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal-box modal-sm">
        <div class="modal-header">
          <h2>Delete Product</h2>
          <button @click="closeDeleteModal" class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to permanently delete <strong>"{{ targetProduct?.name }}"</strong>?</p>
          <p class="warning-text">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button @click="closeDeleteModal" class="btn btn-secondary">Cancel</button>
          <button @click="handleDelete" class="btn btn-danger" :disabled="submitting">
            {{ submitting ? 'Deleting...' : 'Delete Product' }}
          </button>
        </div>
      </div>
    </div>

    <Transition name="toast-fade">
      <div v-if="toast.visible" :class="['toast-bubble', toast.type]">
        <div class="toast-bubble-content">
          <span class="toast-icon">
            <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../services/api';

export default {
  name: 'ProductsManager',
  data() {
    return {
      products: [],
      categories: ['Electronics', 'Clothing', 'Food', 'Books', 'Beauty', 'Other'],
      searchQuery: '',
      selectedCategory: '',
      loading: false,
      error: null,
      submitting: false,
      
      showModal: false,
      isEdit: false,
      form: {
        id: null,
        name: '',
        description: '',
        price: '',
        category: ''
      },
      formErrors: [],

      showDeleteModal: false,
      targetProduct: null,

      toast: {
        visible: false,
        message: '',
        type: 'success', // 'success' or 'error'
        timeoutId: null
      }
    };
  },
  computed: {
    filteredProducts() {
      return this.products.filter(product => {
        const query = this.searchQuery.toLowerCase().trim();
        const matchesSearch = !query || 
          product.name.toLowerCase().includes(query) || 
          product.description.toLowerCase().includes(query) ||
          product.id.toString().includes(query);
        
        const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
        
        return matchesSearch && matchesCategory;
      });
    }
  },
  methods: {
    async loadProducts() {
      this.loading = true;
      this.error = null;
      try {
        this.products = await fetchProducts();
      } catch (err) {
        this.error = 'Failed to load products from server. Please verify the API is running.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.form = {
        id: null,
        name: '',
        description: '',
        price: '',
        category: ''
      };
      this.formErrors = [];
    },
    openCreateModal() {
      this.resetForm();
      this.isEdit = false;
      this.showModal = true;
    },
    openEditModal(product) {
      this.resetForm();
      this.form = {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category
      };
      this.isEdit = true;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.resetForm();
    },
    confirmDelete(product) {
      this.targetProduct = product;
      this.showDeleteModal = true;
    },
    closeDeleteModal() {
      this.showDeleteModal = false;
      this.targetProduct = null;
    },
    validateForm() {
      const errors = [];
      

      const nameRegex = /^[\p{L}\p{N}\s\-_]+$/u;
      
      if (!this.form.name || !this.form.name.trim()) {
        errors.push('Product name is required.');
      } else if (!nameRegex.test(this.form.name)) {
        errors.push('Product name contains invalid characters. (Letters, numbers, spaces, - and _ only)');
      }

      if (!this.form.category) {
        errors.push('Please select a category.');
      }

      if (this.form.price === null || this.form.price === undefined || this.form.price === '') {
        errors.push('Product price is required.');
      } else if (isNaN(Number(this.form.price)) || Number(this.form.price) <= 0) {
        errors.push('Price must be greater than zero.');
      }

      if (this.form.description && this.form.description.length > 500) {
        errors.push('Description cannot exceed 500 characters.');
      }

      this.formErrors = errors;
      return errors.length === 0;
    },
    async handleSave() {
      if (!this.validateForm()) return;

      this.submitting = true;
      this.formErrors = [];

      const payload = {
        name: this.form.name.trim(),
        description: (this.form.description || '').trim(),
        price: Number(this.form.price),
        category: this.form.category,
        createdAt: new Date().toISOString()
      };

      try {
        if (this.isEdit) {
          await updateProduct(this.form.id, payload);
          this.showToast('Product updated successfully!', 'success');
        } else {
          await createProduct(payload);
          this.showToast('Product created successfully!', 'success');
        }
        this.closeModal();
        await this.loadProducts();
      } catch (err) {
        console.error(err);
        if (err.details && typeof err.details === 'object') {
          const errors = [];
          for (const key in err.details) {
            if (Array.isArray(err.details[key])) {
              errors.push(...err.details[key]);
            } else {
              errors.push(err.details[key]);
            }
          }
          this.formErrors = errors.length > 0 ? errors : ['An error occurred while saving the product.'];
        } else {
          this.showToast(err.message || 'Failed to save product.', 'error');
        }
      } finally {
        this.submitting = false;
      }
    },
    async handleDelete() {
      if (!this.targetProduct) return;
      this.submitting = true;
      try {
        await deleteProduct(this.targetProduct.id);
        this.showToast('Product deleted successfully.', 'success');
        this.closeDeleteModal();
        await this.loadProducts();
      } catch (err) {
        console.error(err);
        this.showToast(err.message || 'Failed to delete product.', 'error');
      } finally {
        this.submitting = false;
      }
    },
    showToast(message, type = 'success') {
      if (this.toast.timeoutId) {
        clearTimeout(this.toast.timeoutId);
      }
      this.toast.message = message;
      this.toast.type = type;
      this.toast.visible = true;
      this.toast.timeoutId = setTimeout(() => {
        this.toast.visible = false;
      }, 4000);
    },
    formatPrice(price) {
      if (price === null || price === undefined) return '$0.00';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(price);
    },
    formatDate(dateStr) {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    getCategoryBadgeClass(category) {
      if (!category) return 'badge-other';
      return `badge-${category.toLowerCase()}`;
    }
  },
  mounted() {
    this.loadProducts();
  }
};
</script>

<style scoped>
.product-manager {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #f8fafc;
  text-align: left;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 20px;
}

.manager-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 6px 0;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 14px;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  gap: 8px;
}

.btn-primary {
  background-color: #3b82f6;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #ffffff;
  border-color: #cbd5e1;
  color: #475569;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #f8fafc;
  border-color: #94a3b8;
}

.btn-danger {
  background-color: #ef4444;
  color: #ffffff;
}

.btn-danger:hover:not(:disabled) {
  background-color: #dc2626;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon-svg {
  flex-shrink: 0;
}

.control-panel {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.search-box {
  position: relative;
  flex-grow: 1;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}

.search-input {
  padding-left: 40px !important;
}

.filter-box {
  width: 220px;
}

.form-control {
  width: 100%;
  height: 42px;
  padding: 8px 14px;
  font-size: 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background-color: #ffffff;
  color: #1e293b;
  outline: none;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  box-sizing: border-box;
}

.form-control:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

textarea.form-control {
  height: auto;
  min-height: 80px;
  resize: vertical;
}

.table-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
  color: #1e293b;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;
}

.products-table th {
  background-color: #f8fafc;
  color: #475569;
  font-weight: 600;
  padding: 14px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.products-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
}

.products-table tbody tr:last-child td {
  border-bottom: none;
}

.products-table tbody tr:hover {
  background-color: #f8fafc;
}

.col-id {
  font-family: monospace;
  font-weight: 600;
  color: #64748b;
}

.col-name {
  font-weight: 600;
  color: #0f172a;
}

.col-desc {
  color: #64748b;
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-price {
  font-weight: 600;
  color: #0f172a;
  font-family: monospace;
}

.col-date {
  color: #64748b;
  font-size: 13px;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  color: #475569;
  cursor: pointer;
  margin: 0 4px;
  transition: all 0.15s ease-in-out;
}

.edit-btn:hover {
  color: #3b82f6;
  border-color: #3b82f6;
  background-color: #f0f6ff;
}

.delete-btn:hover {
  color: #ef4444;
  border-color: #ef4444;
  background-color: #fef2f2;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 550;
  border-radius: 9999px;
}

.badge-electronics { background-color: #dbeafe; color: #1e40af; }
.badge-clothing { background-color: #f3e8ff; color: #6b21a8; }
.badge-food { background-color: #dcfce7; color: #15803d; }
.badge-books { background-color: #fef9c3; color: #854d0e; }
.badge-beauty { background-color: #fce7f3; color: #9d174d; }
.badge-other { background-color: #f1f5f9; color: #475569; }

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-box {
  background-color: #ffffff;
  width: 100%;
  max-width: 550px;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: modalEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  color: #1e293b;
}

.modal-box.modal-sm {
  max-width: 400px;
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.modal-close-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
}

.modal-close-btn:hover {
  color: #475569;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 14px 20px;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.col-6 {
  width: 50%;
}

.required-indicator {
  color: #ef4444;
}

.field-help {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
}

.char-counter {
  text-align: right;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
}

.warning-text {
  color: #ef4444;
  font-size: 13px;
  font-weight: 500;
  margin-top: 8px;
}

.error-alert {
  background-color: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  color: #991b1b;
  font-size: 13px;
}

.error-alert-header {
  font-weight: 600;
  margin-bottom: 4px;
}

.error-alert ul {
  margin: 0;
  padding-left: 20px;
}

.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
}

.error-banner {
  color: #ef4444;
}

.error-banner p {
  margin-bottom: 12px;
  font-weight: 500;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  text-align: center;
}

.empty-icon {
  color: #94a3b8;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 16px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 6px 0;
}

.empty-state p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.toast-bubble {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 2000;
  min-width: 250px;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.toast-bubble-content {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 10px;
}

.toast-bubble.success {
  background-color: #065f46;
  color: #ecfdf5;
}

.toast-bubble.error {
  background-color: #991b1b;
  color: #fef2f2;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast-message {
  font-size: 13px;
  font-weight: 500;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}
</style>
