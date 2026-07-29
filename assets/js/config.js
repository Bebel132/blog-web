const GIST_ID = 'c695194f270beb73384b82b9efc7ee90';
const GIST_URL = `https://gist.githubusercontent.com/Bebel132/${GIST_ID}/raw/blog-api.json`;

export let API_URL = '';

export async function initApiUrl() {
    try {
        const response = await fetch(`${GIST_URL}?t=${Date.now()}`);
        const data = await response.json();
        API_URL = data.api_url;
        console.log('API URL carregada:', API_URL);
        
        // Dispara evento quando pronto
        window.dispatchEvent(new CustomEvent('apiReady', { detail: API_URL }));
    } catch (error) {
        console.error('Erro ao carregar API URL:', error);
        API_URL = 'http://localhost:5000';
        window.dispatchEvent(new CustomEvent('apiReady', { detail: API_URL }));
    }
}

// Inicia automaticamente quando importado
initApiUrl();