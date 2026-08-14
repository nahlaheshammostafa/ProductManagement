<template>
  <div id="app">
    <!-- Loading/Initializing state -->
    <div v-if="initializing" class="loading-screen">
      <div class="loading-spinner"></div>
      <p>Initializing Secure Session...</p>
    </div>

    <div v-else-if="isAuthenticated" class="app-container">
      <header class="app-header">
        <div class="brand-section">
          <div class="brand-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <div>
            <span class="brand-name">Product Management</span>
          </div>
        </div>

        <div class="user-section">
          <div class="user-info">
            <div class="user-name">{{ userProfile?.name }}</div>
            <div class="user-email">{{ userProfile?.username }}</div>
          </div>
          

          <button @click="logout" class="btn-logout" title="Sign Out">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Sign Out
          </button>
        </div>
      </header>

      <main class="app-content">
        <ProductsManager />
      </main>
    </div>

    <div v-else class="login-screen">
      <div class="login-card">
        <div class="login-header">
          <div class="login-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <h1>Product Management</h1>
          <p>Product & Catalog Management Portal</p>
        </div>

        <div class="login-body">
          <div class="sso-desc">
            <p>Welcome! Please sign in using your enterprise credentials to access the directory.</p>
          </div>

          <button @click="login" class="btn-sso-login">
            <svg class="ms-logo" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 23 23">
              <rect x="0" y="0" width="11" height="11" fill="#f25022" />
              <rect x="12" y="0" width="11" height="11" fill="#7fba00" />
              <rect x="0" y="12" width="11" height="11" fill="#00a4ef" />
              <rect x="12" y="12" width="11" height="11" fill="#ffb900" />
            </svg>
            Sign in with Microsoft
          </button>
        </div>

        <div class="login-footer">
          <p>Secured by Microsoft Entra ID SSO</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProductsManager from './components/ProductsManager.vue';
import authService from './services/authService';

export default {
  name: 'App',
  components: {
    ProductsManager
  },
  data() {
    return {
      initializing: true,
      isAuthenticated: false,
      userProfile: null
    };
  },

  async mounted() {
    try {
      const account = await authService.handleRedirect();
      if (account) {
        this.isAuthenticated = true;
        this.userProfile = authService.getUserProfile();
      } else {
        const activeAccount = authService.getActiveAccount();
        this.isAuthenticated = !!activeAccount;
        if (this.isAuthenticated) {
          this.userProfile = authService.getUserProfile();
        }
      }
    } catch (error) {
      console.error("SSO Initialization Error:", error);
    } finally {
      this.initializing = false;
    }
  },
  methods: {
    async login() {
      try {
        await authService.login();
      } catch (err) {
        console.error("SSO Login Redirect failed:", err);
      }
    },
    async logout() {
      try {
        await authService.logout();
      } catch (err) {
        console.error("SSO Logout failed:", err);
      }
    }
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

body {
  margin: 0;
  background-color: #0b0f19;
  background-image: 
    radial-gradient(at 0% 0%, rgba(30, 58, 138, 0.15) 0px, transparent 50%),
    radial-gradient(at 50% 0%, rgba(99, 102, 241, 0.08) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(30, 58, 138, 0.15) 0px, transparent 50%);
  color: #f8fafc;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.loading-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #94a3b8;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3.5px solid rgba(99, 102, 241, 0.1);
  border-radius: 50%;
  border-top-color: #6366f1;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 440px;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 40px 32px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(16px);
  text-align: center;
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.login-logo {
  display: inline-flex;
  padding: 14px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 14px;
  color: #6366f1;
  margin-bottom: 20px;
}

.login-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 6px 0;
  letter-spacing: -0.025em;
  background: linear-gradient(to right, #ffffff, #cbd5e1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-header p {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0 0 32px 0;
}

.sso-desc {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 28px;
}

.sso-desc p {
  margin: 0;
  font-size: 0.9rem;
  color: #94a3b8;
  line-height: 1.5;
}

.btn-sso-login {
  width: 100%;
  padding: 13px 20px;
  background-color: #ffffff;
  color: #1e293b;
  font-size: 0.95rem;
  font-weight: 600;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn-sso-login:hover {
  background-color: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.btn-sso-login:active {
  transform: translateY(0);
}

.login-footer p {
  margin: 32px 0 0 0;
  font-size: 0.75rem;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.app-container {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(15, 23, 42, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  padding: 16px 40px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 8px;
  color: #6366f1;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #ffffff;
  display: block;
}

.brand-badge {
  font-size: 0.7rem;
  font-weight: 600;
  color: #6366f1;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  text-align: right;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #f1f5f9;
}

.user-email {
  font-size: 0.75rem;
  color: #64748b;
}

.role-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
}

.role-badge.admin {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.role-badge.reader {
  background-color: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.btn-logout {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 8px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-logout:hover {
  background-color: #ef4444;
  color: #ffffff;
  border-color: #ef4444;
}

.app-content {
  flex: 1;
  padding: 20px;
  background-color: transparent;
}
</style>
