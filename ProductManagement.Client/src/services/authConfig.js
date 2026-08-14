export const msalConfig = {
  auth: {
    clientId: '3cbcae1a-91e9-4198-b109-24bd4db5c658',
    authority: 'https://login.microsoftonline.com/99c04493-a2ba-4fbd-85da-31ad7b5bc403',
    redirectUri: 'http://localhost:8080',
    postLogoutRedirectUri: 'http://localhost:8080',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  }
};


export const loginRequest = {
  scopes: [
    'openid', 
    'profile', 
    'User.Read'
  ]
};
