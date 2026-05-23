const BASE_URL = "/api";

async function apiFetch(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { 
            "Content-Type": "application/json"
        },
        ...options,
    });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Lỗi ${res.status}`);
    }
    const ct = res.headers.get("content-type") || "";
    return ct.includes("application/json") ? res.json() : res.text();
}