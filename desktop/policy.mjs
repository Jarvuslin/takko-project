export function isServiceUrl(value, origin) {
  try {
    const url = new URL(value);
    return (
      url.origin === origin &&
      url.protocol === "http:" &&
      url.hostname === "127.0.0.1" &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export function isRobloxBrowserLink(value) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "create.roblox.com" &&
      !url.port &&
      !url.username &&
      !url.password &&
      (url.pathname.startsWith("/docs/") ||
        /^\/store\/asset\/\d+(?:\/|$)/.test(url.pathname))
    );
  } catch {
    return false;
  }
}

export function isRobloxThumbnailRequest(value, resourceType) {
  if (resourceType !== "image") return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.port &&
      !url.username &&
      !url.password &&
      /(^|\.)rbxcdn\.com$/.test(url.hostname)
    );
  } catch {
    return false;
  }
}

export function readyOrigin(message, nonce) {
  if (
    message?.type !== "ready" ||
    message.nonce !== nonce ||
    !Number.isInteger(message.port) ||
    message.port < 1024 ||
    message.port > 65535
  )
    return null;
  return `http://127.0.0.1:${message.port}`;
}

export const rendererPreferences = Object.freeze({
  nodeIntegration: false,
  contextIsolation: true,
  sandbox: true,
  webSecurity: true,
  allowRunningInsecureContent: false,
  webviewTag: false,
});

// No renderer IPC, filesystem, shell, process or credential API is exposed.
export const contentSecurityPolicy =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://rbxcdn.com https://*.rbxcdn.com; font-src 'self'; connect-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'self'";
