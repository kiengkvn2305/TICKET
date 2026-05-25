const BASE_URL = "/api";

async function apiFetch(path, options = {}) {
    const defaultHeaders = {
        "ngrok-skip-browser-warning": "true"
    };
    
    // Chỉ thêm Content-Type nếu có body
    if (options.body) {
        defaultHeaders["Content-Type"] = "application/json";
    }

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Lỗi ${res.status}`);
    }
    const ct = res.headers.get("content-type") || "";
    return ct.includes("application/json") ? res.json() : res.text();
}