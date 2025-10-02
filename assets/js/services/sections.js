import { authFetch } from "../auth.js";
import { API_URL } from "../config.js";

async function getSections(id) {
    const response = await fetch(`${API_URL}/sections/${id}`);

    return response.json();
}

async function putSection(id, title, postId) {
    return authFetch(`${API_URL}/sections/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, postId })
    });
}

async function deleteSection(id) {
    return authFetch(`${API_URL}/sections/${id}`, {
        method: 'DELETE'
    });
}

async function postSection(title, postId) {
    return authFetch(`${API_URL}/sections/`, {
        method: 'POST',
        body: JSON.stringify({ title, postId })
    });
}

export { getSections, putSection, deleteSection, postSection };