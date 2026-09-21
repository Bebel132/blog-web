import { authFetch, me } from "../auth.js";
import { API_URL } from "../config.js";

async function getPosts(admin, page) {
    if(admin){
        const user = await me();
        return (await authFetch(`${API_URL}/posts/all/${user}`, {method: 'GET'}));
    } else {
        const response = await fetch(`${API_URL}/posts/${page}`);
        if (!response.ok) {
            throw new Error(`API indisponivel: ${response.status}`);
        }
        return response.json();
    }
}

async function getCount() {
    const response = await fetch(`${API_URL}/posts/count`);
    if (!response.ok) {
        throw new Error(`API indisponivel: ${response.status}`);
    }
    return response.json();
}

async function putPost(id, title) {
    return authFetch(`${API_URL}/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title })
    });
}

async function deletePost(id) {
    return authFetch(`${API_URL}/posts/${id}`, {
        method: 'DELETE'
    });
}

async function postPost(title) {
    return authFetch(`${API_URL}/posts/`, {
        method: 'POST',
        body: JSON.stringify({ title })
    });
}

async function publishPost(id) {
    return authFetch(`${API_URL}/publish/${id}`, {method: 'POST'})
}

export { getPosts, getCount, putPost, deletePost, postPost, publishPost };