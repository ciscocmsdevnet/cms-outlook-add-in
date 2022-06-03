type MyWindow = Window & { 'env': { backendurl: string } }

export const environment = {
  production: true,
  // backendurl: window.env["backendurl"] || "default",
  backendurl: (window as unknown as MyWindow).env['backendurl']
};
