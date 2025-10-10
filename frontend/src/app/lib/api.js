"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

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
    } catch (_e) {
      return { raw: text };
    }
  } catch (_e) {
    return null;
  }
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
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
    const isAbort = err && (err.name === "AbortError" || err.code === 20);
    const message = isAbort ? "Request timed out" : "Network request failed";
    throw new ApiError(message, {
      url,
      method: init.method || "GET",
      cause: err,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const data = await safeParseJson(res);
    const requestId = res.headers.get("x-request-id") || res.headers.get("x-correlation-id") || undefined;
    const baseMessage = `Request failed with ${res.status}`;
    const message = (data && (data.message || data.error)) || baseMessage;

    throw new ApiError(message, {
      status: res.status,
      code: data && (data.code || data.errorCode),
      details: data && (data.details || data.errors || data.raw || data),
      url,
      method: init.method || "GET",
      requestId,
      response: data,
    });
  }

  const okData = await safeParseJson(res);
  return okData;
}

export { API_BASE, ApiError };


