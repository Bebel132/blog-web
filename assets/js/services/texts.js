import { authFetch } from "../auth.js";
import { API_URL } from "../config.js";

async function getTexts(id) {
    const response = await fetch(`${API_URL}/texts/${id}`);

    return response.json();
}

async function putText(id, content, sectionId) {
    return authFetch(`${API_URL}/texts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ content, sectionId })
    });
}

async function postText(content, sectionId, file) {
    const response = authFetch(`${API_URL}/texts/`, {
        method: 'POST',
        body: JSON.stringify({ content, sectionId })
    });

    const text = await response;
    
    if(file) {
        await postTextFile(file, text.id)
    }
}

async function deleteText(id) {
    return authFetch(`${API_URL}/texts/${id}`, {
        method: 'DELETE',
    })
}

async function getTextFile(id) {
    const response = await fetch(`${API_URL}/texts/${id}/file`)
    
    return URL.createObjectURL(await response.blob())
}

async function postTextFile(file, id) {
   const formData = new FormData();
    formData.append('file', file);

    authFetch(`${API_URL}/texts/${id}/upload`, {
        method: 'POST',
        body: formData
    });
}

export { getTexts, putText, deleteText, postText, getTextFile, postTextFile };