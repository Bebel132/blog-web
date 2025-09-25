import { authFetch } from "./auth.js";
import { API_URL } from "./config.js";

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

function renderPosts(posts, admin) {
    const postList = document.querySelector(".postList");
    if(admin) {
        postList.innerHTML = "";
        posts.forEach(post => {
            const li = document.createElement("li");
            li.classList.add("post-item");
            li.dataset.post = JSON.stringify({id: post.id, title: post.title});
            
            const p = document.createElement("p");
            p.textContent = post.title;
            
            const editButton = document.createElement("button");
            editButton.classList.add("edit-button");
            editButton.textContent = "Editar";

            const saveButton = document.createElement("button");
            saveButton.classList.add("save-button");
            saveButton.textContent = "Salvar";
            saveButton.style.display = "none";

            const deleteButton = document.createElement("button");
            deleteButton.classList.add("delete-button");
            deleteButton.textContent = "Excluir";

            const input = document.createElement("input");
            input.type = "text";
            input.value = post.title;
            input.style.display = "none";

            const small = document.createElement("small");
            const date = new Date(post.created_at);
            const formattedDate = new Intl.DateTimeFormat('pt-BR').format(date);
            small.textContent = "- "+formattedDate;
            small.style.display = "block"

            p.appendChild(small);
            li.appendChild(p);
            li.appendChild(input);
            li.appendChild(editButton);
            li.appendChild(saveButton);
            li.appendChild(deleteButton);
            postList.append(li);

            document.querySelectorAll(".post-item").forEach(item => {
                item.children[0].addEventListener("click", () => {
                    window.location.href = `post.html?id=${post.id}&title=${encodeURIComponent(post.title)}`;
                });
            });
        });
        renderButtons();
    } else {
        posts.forEach(post => {
            const li = document.createElement("li");
            li.classList.add("post-item");
            li.dataset.post = JSON.stringify({id: post.id, title: post.title});

            const p = document.createElement("p");
            p.textContent = post.title;

            const i = document.createElement("i");
            i.textContent = ` por: ${post.creator}`;
            i.style.display = "block";

            const small = document.createElement("small");
            const date = new Date(post.created_at);
            const formattedDate = new Intl.DateTimeFormat('pt-BR').format(date);
            small.textContent = "- "+formattedDate;


            p.appendChild(i);
            p.appendChild(small)
            li.appendChild(p);
            postList.append(li);

            document.querySelectorAll(".post-item").forEach(item => {
                item.children[0].addEventListener("click", () => {
                    window.location.href = `post.html?id=${post.id}&title=${encodeURIComponent(post.title)}&date=${post.created_at}&creator=${post.creator}`;
                });
            });
        })
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

    document.querySelectorAll(".save-button").forEach(button => {
        button.onclick = async () => {
            try {
                const parent = button.parentElement;

                parent.children[0].style.display = "block"; // p
                parent.children[1].style.display = "none"; // input

                parent.children[2].style.display = "block"; // editButton
                parent.children[3].style.display = "none"; // saveButton
                parent.children[4].style.display = "block"; // deleteButton

                await putPost(JSON.parse(parent.dataset.post).id, parent.children[1].value);
                
            } catch (error) {
                alert("Erro ao salvar o post");
            }
            renderPosts(await getPosts(), true);
        };
    });

    document.querySelectorAll(".delete-button").forEach(button => {
        button.onclick = async () => {
            const parent = button.parentElement;
            await deletePost(JSON.parse(parent.dataset.post).id);
            renderPosts(await getPosts(), true);
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

        await postPost(title);

        renderPosts(await getPosts(), true);

        document.querySelector(".modal").style.display = "none";
        document.querySelector(".modal form").reset();
    }
}

export { getPosts, renderPosts };