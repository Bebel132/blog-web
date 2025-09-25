import { API_URL } from "./config.js";

let isRefreshing = false;
let refreshQueue = [];

async function login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) throw new Error("Login falhou");

    const data = await response.json();
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    return data;
}

function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
}

async function refreshToken() {
    const refresh_token = localStorage.getItem("refresh_token");

    if (!refresh_token) throw new Error("Nenhum refresh token disponível");

    const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${refresh_token}`
        }
    });

    if (!response.ok) throw new Error("Falha ao renovar token");

    const data = await response.json();
    localStorage.setItem("access_token", data.access_token);
    return data.access_token;
}

async function authFetch(url, options = {}) {
    let token = localStorage.getItem("access_token");

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    let response = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });

    if (response.status === 401 || response.status === 500) {
        if (!isRefreshing) {
            isRefreshing = true;
            try {
                token = await refreshToken();
                isRefreshing = false;

                // Processa a fila de requests pendentes
                refreshQueue.forEach(resolve => resolve(token));
                refreshQueue = [];
            } catch (err) {
                isRefreshing = false;
                refreshQueue = [];
                console.error("Erro ao renovar token:", err);
                logout();
                throw err;
            }
        } else {
            token = await new Promise(resolve => refreshQueue.push(resolve));
        }

        const retryHeaders = { ...headers, 'Authorization': `Bearer ${token}` };
        response = await fetch(url, { ...options, headers: { ...retryHeaders, ...options.headers } });
    }

    if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
    }

    return response.json();
}

function isLoggedIn() {
    const token = localStorage.getItem("access_token");
    return !!token;
}

export { login, logout, refreshToken, authFetch, isLoggedIn };
