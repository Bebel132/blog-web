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

async function postText(content, sectionId) {
    return authFetch(`${API_URL}/texts/`, {
        method: 'POST',
        body: JSON.stringify({ content, sectionId })
    });
}

async function deleteText(id) {
    return authFetch(`${API_URL}/texts/${id}`, {
        method: 'DELETE',
    })
}

function renderTexts(texts) {
    const textList = document.querySelector(".textList");
    textList.innerHTML = "";
    texts.forEach(text => {
        const li = document.createElement("li");
        li.classList.add("text-item");
        li.dataset.id = text.id;

        const p = document.createElement("p");
        p.textContent = text.content;

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
        li.appendChild(textarea);
        li.appendChild(editButton);
        li.appendChild(saveButton);
        li.appendChild(deleteButton);
        textList.appendChild(li);
    });
    renderButtons();
}

function renderButtons() {
    document.querySelectorAll(".edit-button").forEach(button => {
        button.onclick = () => {
            const parent = button.parentElement;
            parent.children[0].style.display = "none"; // p
            parent.children[1].style.display = "block"; // textarea
            parent.children[2].style.display = "none"; // editButton
            parent.children[3].style.display = "inline"; // saveButton   
            parent.children[4].style.display = "none"; // deleteButton
        };
    });

    document.querySelectorAll(".save-button").forEach(saveButton => {
        saveButton.onclick = async () => {
            try {
                const parent = saveButton.parentElement;

                parent.children[0].style.display = "block"; // p
                parent.children[1].style.display = "none"; // textarea

                parent.children[2].style.display = "block"; // editButton
                parent.children[3].style.display = "none"; // saveButton

                await putText(parent.dataset.id, parent.children[1].value, sectionId);
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

        await postText(content, sectionId);

        renderTexts(await getTexts(sectionId));

        document.querySelector(".modal").style.display = "none";
        document.querySelector(".modal form").reset();
    }
}

export { getTexts, putText, renderTexts };