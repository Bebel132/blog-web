const GIST_ID = 'c695194f270beb73384b82b9efc7ee90';
const GIST_URL = `https://gist.githubusercontent.com/Bebel132/${GIST_ID}/raw/api-config.json`;

let API_URL = '';

try {
    // Cache-bust para sempre pegar a versão mais recente
    const response = await fetch(`${GIST_URL}?t=${Date.now()}`);
    const data = await response.json();
    API_URL = data.api_url;
} catch (error) {
    console.error('Erro ao carregar API URL:', error);
    // Fallback para desenvolvimento
    API_URL = 'http://localhost:5000';
}

window.env = {
  //API_URL: "http://127.0.0.1:5000"
  API_URL: API_URL
};