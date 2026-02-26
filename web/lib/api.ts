import { auth } from "@clerk/nextjs/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const { getToken } = await auth();
    const token = await getToken();
    if (token) {
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
    }
  } catch {
    // Not in a server context or not authenticated
  }
  return { "Content-Type": "application/json" };
}

export async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}${path}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`API GET ${path} failed:`, res.status, await res.text());
      return null;
    }
    return res.json();
  } catch (err) {
    console.error(`API GET ${path} error:`, err);
    return null;
  }
}

export async function apiPost<T>(path: string, body?: any): Promise<T | null> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`API POST ${path} failed:`, res.status, text);
      throw new Error(text || `Request failed with status ${res.status}`);
    }
    return res.json();
  } catch (err) {
    console.error(`API POST ${path} error:`, err);
    throw err;
  }
}

export async function apiPut<T>(path: string, body?: any): Promise<T | null> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`API PUT ${path} failed:`, res.status, text);
      throw new Error(text || `Request failed with status ${res.status}`);
    }
    return res.json();
  } catch (err) {
    console.error(`API PUT ${path} error:`, err);
    throw err;
  }
}
