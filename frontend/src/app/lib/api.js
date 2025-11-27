"use client";

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://techm.work.gd/api/";

let API_BASE = RAW_BASE || "";
if (API_BASE.length > 2048) API_BASE = API_BASE.slice(0, 2048);
while (API_BASE.endsWith('/')) API_BASE = API_BASE.slice(0, -1);

class ApiError extends Error {
  constructor(message, { status, code, details, url, method, requestId, response, cause } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.url = url;
    this.method = method;
    this.requestId = requestId;
    this.response = response;
    if (cause) this.cause = cause;
  }
}

async function safeParseJson(response) {
  try {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  } catch {
    return null;
  }
}

export async function apiFetch(path, options = {}) {
  // Always join paths correctly
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE}${cleanPath}`;

  const { timeoutMs = 15000, ...restOptions } = options || {};
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const init = {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...(restOptions.headers || {}),
    },
    credentials: "include",
    cache: "no-store",
    signal: controller.signal,
  };

  let res;
  try {
    res = await fetch(url, init);
  } catch (err) {
    clearTimeout(timeoutId);
    throw new ApiError("Network request failed", {
      url,
      method: init.method || "GET",
      cause: err,
    });
  }

  clearTimeout(timeoutId);

  if (!res.ok) {
    const data = await safeParseJson(res);
    throw new ApiError(data?.message || `Request failed with ${res.status}`, {
      status: res.status,
      url,
      response: data,
    });
  }

  return safeParseJson(res);
}

export { API_BASE, ApiError };
