import { API_URL } from "./config.js";

async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);

        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}

async function refreshToken() {
    const refreshToken = localStorage.getItem("refresh_token");

    const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${refreshToken}`
        }
    });

    if (!response.ok) {
        throw new Error("Erro ao renovar token");
    }

    const data = await response.json();
    localStorage.setItem("access_token", data.access_token);
    return data.access_token;
}


function getToken() {
  return localStorage.getItem("access_token");
}

function isAuthenticated() {
    return getToken() == undefined ? false : !!getToken();
}

async function authFetch(url, options = {}) {
    let token = localStorage.getItem("access_token");

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    let response = await fetch(url, {
        ...options,
        headers: {
            ...headers,
            ...options.headers
        }
    });

    if (response.status === 401) {
        try {
            token = await refreshToken();
            const retryHeaders = {
                ...headers,
                'Authorization': `Bearer ${token}`
            };

            response = await fetch(url, {
                ...options,
                headers: {
                    ...retryHeaders,
                    ...options.headers
                }
            });
        } catch (err) {
            console.error("Erro ao renovar token:", err);
            throw err;
        }
    }

    if (!response.ok) {
        throw new Error("Erro na requisição");
    }

    return response.json();
}

async function me() {
    return authFetch(`${API_URL}/auth/me`);
}

export { login, authFetch, isAuthenticated, me };