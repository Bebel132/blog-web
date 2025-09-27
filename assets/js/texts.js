import { authFetch } from "./auth.js";
import { API_URL } from "./config.js";

const sectionId = new URLSearchParams(window.location.search).get("id");

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

async function renderTexts(texts) {
    const textList = document.querySelector(".textList");
    textList.innerHTML = "";
    for (const text of texts) {
        const li = document.createElement("li");
        li.classList.add("text-item");
        li.dataset.id = text.id;

        const p = document.createElement("p");
        p.textContent = text.content;

        const img = document.createElement("img");
        img.style.display = "none"

        const upload = document.createElement("input");
        upload.type = "file";
        upload.accept = ".png,.jpg,.jpeg,.gif";
        upload.style.display = "none"

        if(text.hasFile) {
            img.src = await getTextFile(text.id);
            img.style.display = "block"
        }

        const editButton = document.createElement("button");
        editButton.classList.add("edit-button");
        editButton.textContent = "Editar";

        const saveButton = document.createElement("button");
        saveButton.classList.add("save-button");
        saveButton.textContent = "Salvar";
        saveButton.style.display = "none";

        const textarea = document.createElement("textarea");
        textarea.value = text.content;
        textarea.style.display = "none";
        textarea.style.width = "100%";
        textarea.style.height = "200px";

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delete-button");
        deleteButton.textContent = "Excluir";

        li.appendChild(p);
        li.appendChild(img);
        li.appendChild(textarea);
        li.appendChild(editButton);

        li.appendChild(upload)

        li.appendChild(saveButton);
        li.appendChild(deleteButton);
        textList.appendChild(li);
    };
    renderButtons();
}

function renderButtons() {
    document.querySelectorAll(".edit-button").forEach(button => {
        console.log(button.parentElement.childNodes)
        button.onclick = () => {
            const parent = button.parentElement;
            parent.children[0].style.display = "none"; // p
            parent.children[1].style.display = "none"; // img
            parent.children[2].style.display = "block"; // textarea
            parent.children[3].style.display = "none"; // editButton

            parent.children[4].style.display = "block";

            parent.children[5].style.display = "inline"; // saveButton   
            parent.children[6].style.display = "none"; // deleteButton
        };
    });

    document.querySelectorAll(".save-button").forEach(saveButton => {
        saveButton.onclick = async () => {
            try {
                const parent = saveButton.parentElement;
                const file = parent.children[4].files[0];

                if(file) {
                    await postTextFile(file, parent.dataset.id)
                }

                await putText(parent.dataset.id, parent.children[2].value, sectionId);
            } catch (error) {
                alert("Erro ao salvar o texto");
            }
            renderTexts(await getTexts(sectionId));
        };
    });

    document.querySelectorAll(".delete-button").forEach(deleteButton => {
        deleteButton.onclick = async () => {
            const parent = deleteButton.parentElement;
            await deleteText(parent.dataset.id)
            renderTexts(await getTexts(sectionId), true)
        }
    })

    document.querySelector(".new-button").onclick = () => {
        document.querySelector(".modal").style.display = "flex";
    }

    document.querySelector(".x").onclick = () => {
        document.querySelector(".modal").style.display = "none";
    }

    document.querySelector(".modal form").onsubmit = async (e) => {
        e.preventDefault();

        const content = document.querySelector("#content").value;
        const file = document.querySelector("#file").files[0];

        await postText(content, sectionId, file);

        renderTexts(await getTexts(sectionId));

        document.querySelector(".modal").style.display = "none";
        document.querySelector(".modal form").reset();
    }
}

export { getTexts, putText, deleteText, postText, getTextFile, postTextFile, renderTexts };