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
    const file = URL.createObjectURL(await response.blob())
    console.log(response.headers.get('X-Image-Width'), response.headers.get('X-Image-Height'))
    return {
        file,
        width: response.headers.get('X-Image-Width'),
        height: response.headers.get('X-Image-Height'),
    }
}

async function postTextFile(file, id, width = null, height = null) {
   const formData = new FormData();
    formData.append('file', file);
    console.log(width, height)
    if (width) formData.append('width', width);
    if (height) formData.append('height', height);

    authFetch(`${API_URL}/texts/${id}/upload`, {
        method: 'POST',
        body: formData
    });
}

export { getTexts, putText, deleteText, postText, getTextFile, postTextFile };