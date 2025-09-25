import { authFetch } from "./auth.js";
import { API_URL } from "./config.js";
import { getTexts, getTextFile } from "./texts.js"

const url = new URLSearchParams(window.location.search)
const post = {
    id: url.get("id"),
    title: url.get("title"),
    creator: url.get("creator"),
    created_at: url.get("date")
}

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

async function renderSections(sections, admin) {
    const sectionList = document.querySelector(".sectionList");
    if(admin) {
        sectionList.innerHTML = "";
        sections.forEach(section => {
            const li = document.createElement("li");
            li.classList.add("section-item");
            li.dataset.section = JSON.stringify({id: section.id, title: section.title});
            
            const p = document.createElement("p");
            p.textContent = section.title;
            
            const editButton = document.createElement("button");
            editButton.classList.add("edit-button");
            editButton.textContent = "Editar";

            const saveButton = document.createElement("button");
            saveButton.classList.add("save-button");
            saveButton.textContent = "Salvar";
            saveButton.style.display = "none";

            const input = document.createElement("input");
            input.type = "text";
            input.value = section.title;
            input.style.display = "none";

            const deleteButton = document.createElement("button");
            deleteButton.classList.add("delete-button");
            deleteButton.textContent = "Excluir";

            li.appendChild(p);
            li.appendChild(input);
            li.appendChild(editButton);
            li.appendChild(saveButton);
            li.appendChild(deleteButton);
            sectionList.appendChild(li);

            document.querySelectorAll(".section-item").forEach(item => {
                const section = JSON.parse(item.dataset.section);
                item.children[0].addEventListener("click", () => {
                    window.location.href = `section.html?id=${section.id}&title=${encodeURIComponent(section.title)}`;
                });
            });
        });
        renderButtons();
    } else {
        document.querySelector(".loading").style.display = "fixed";
        document.body.style.overflowY = "hidden";

        const container = document.querySelector(".container");

        const title = document.createElement("h1");
        title.textContent = post.title;
        
        container.appendChild(title)
   
        for (const section of sections) {
            const subtitle = document.createElement("h2");
            subtitle.textContent = section.title;
            container.appendChild(subtitle);

            const texts = await getTexts(section.id);
            for (const text of texts) {
                const p = document.createElement("p");
                p.textContent = text.content;
                container.appendChild(p);

                if (text.hasFile) {
                    const imgWrapper = document.createElement("div");
                    imgWrapper.classList.add("imgWrapper");

                    const img = document.createElement("img");
                    img.src = await getTextFile(text.id);

                    imgWrapper.append(img)
                    container.append(imgWrapper);
                }
            }
        }

        const p = document.createElement("p");

        const i = document.createElement("i");
        i.textContent = ` por: ${post.creator}`;
        i.style.display = "block";

        const small = document.createElement("small");
        const date = new Date(post.created_at);
        const formattedDate = new Intl.DateTimeFormat('pt-BR').format(date);
        small.textContent = "- "+formattedDate;

        p.append(i)
        p.append(small)
        container.append(p)

        document.querySelector(".loading").style.display = "none";
        document.body.style.overflowY = "scroll";
    }
}

function renderButtons() {
    document.querySelectorAll(".edit-button").forEach(button => {
        button.onclick = () => {
            const parent = button.parentElement;
            parent.children[0].style.display = "none"; // p
            parent.children[1].style.display = "inline"; // input
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
                parent.children[1].style.display = "none"; // input

                parent.children[2].style.display = "block"; // editButton
                parent.children[3].style.display = "none"; // saveButton

                await putSection(JSON.parse(parent.dataset.section).id, parent.children[1].value, post.id);
            } catch (error) {
                alert("Erro ao salvar a seção");    
            }
            renderSections(await getSections(post.id), true);
        };
    });

    document.querySelectorAll(".delete-button").forEach(button => {
            button.onclick = async () => {
                const parent = button.parentElement;
                await deleteSection(JSON.parse(parent.dataset.section).id);
                renderSections(await getSections(post.id), true);
            };
        });

    document.querySelector(".new-button").onclick = () => {
        document.querySelector(".modal").style.display = "flex";
    }

    document.querySelector(".x").onclick = () => {
        document.querySelector(".modal").style.display = "none";
    }
    
    document.querySelector(".modal form").onsubmit = async (e) => {
        e.preventDefault();

        const title = document.querySelector("#titulo").value;

        await postSection(title, post.id);

        renderSections(await getSections(post.id), true);

        document.querySelector(".modal").style.display = "none";
        document.querySelector(".modal form").reset();
    }
}

export { getSections, renderSections };