import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig, loginRequest } from './authConfig';

class AuthService {
  constructor() {
    this.msalInstance = new PublicClientApplication(msalConfig);
    this.isInitialized = false;
  }

 
  async initialize() {
    if (this.isInitialized) return;
    await this.msalInstance.initialize();
    this.isInitialized = true;
  }


  async login() {
    await this.initialize();
    await this.msalInstance.loginRedirect(loginRequest);
  }


  async logout() {
    await this.initialize();
    const account = this.getActiveAccount();
    await this.msalInstance.logoutRedirect({
      account: account,
    });
  }


  async handleRedirect() {
    await this.initialize();
    const response = await this.msalInstance.handleRedirectPromise();
    if (response) {
      this.msalInstance.setActiveAccount(response.account);
      return response.account;
    } else {
      const currentAccounts = this.msalInstance.getAllAccounts();
      if (currentAccounts.length > 0) {
        this.msalInstance.setActiveAccount(currentAccounts[0]);
        return currentAccounts[0];
      }
    }
    return null;
  }

 
  getActiveAccount() {
    return this.msalInstance.getActiveAccount();
  }


  async getAccessToken() {
    await this.initialize();
    const account = this.getActiveAccount();
    if (!account) return null;

    const request = {
      ...loginRequest,
      account: account
    };

    try {
      const response = await this.msalInstance.acquireTokenSilent(request);
      console.log("🔑 Current ID Token (for Swagger testing):", response.idToken);
      return response.idToken;
    } catch (error) {
      console.warn("Silent token acquisition failed, acquiring token via redirect...", error);
      await this.msalInstance.acquireTokenRedirect(request);
      return null;
    }
  }


  getUserProfile() {
    const account = this.getActiveAccount();
    if (!account) return null;

    return {
      name: account.name || account.username,
      username: account.username
    };
  }
}

const authService = new AuthService();
export default authService;
