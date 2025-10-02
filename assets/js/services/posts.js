import { authFetch } from "../auth.js";
import { API_URL } from "../config.js";

async function getPosts(admin) {
    if(admin){
        const user = await me();
        return (await fetch(`${API_URL}/posts/${user.id}`)).json();
    } else {
        return (await fetch(`${API_URL}/posts/`)).json();
    }
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

export { getPosts, putPost, deletePost, postPost };