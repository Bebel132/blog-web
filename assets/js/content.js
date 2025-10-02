import { getPosts, putPost, deletePost, postPost } from "./services/posts.js";
import { getSections, putSection, deleteSection, postSection } from "./services/sections.js";
import { getTexts, putText, deleteText, postText, getTextFile, postTextFile } from "./services/texts.js";

const url = new URLSearchParams(window.location.search);
const post = {
    id: url.get("id"),
    title: url.get("title"),
    creator: url.get("creator"),
    created_at: url.get("date")
};

let sectionId = null;

async function renderPosts(admin) {
    const posts = await getPosts()
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
        });
        renderPostButtons();
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
        })
    }

    for(let i = 0; i < posts.length; i++){
        document.querySelectorAll(".post-item")[i].children[0].addEventListener("click", () => {
            if(admin) {
                window.location.href = `post.html?id=${posts[i].id}&title=${encodeURIComponent(posts[i].title)}`;
            } else {
                window.location.href = `pages/post/index.html?id=${posts[i].id}&title=${encodeURIComponent(posts[i].title)}&date=${posts[i].created_at}&creator=${posts[i].creator}`;
            } 
        })
    }
}

function renderPostButtons() {
    document.querySelectorAll(".edit-button").forEach(button => {
        button.onclick = e => {
            e.stopPropagation();
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

async function renderContent(admin) {
    const sectionList = await getSections(post.id);
    if(admin) {
        const sections = document.querySelector(".sectionList");
        sections.innerHTML = "";
        let textList = [];

        for (const section of sectionList) {
            const li = document.createElement("li");
            li.className = "sections";
            li.dataset.section = JSON.stringify(section);
            li.textContent = section.title;

            const newTextBtn = document.createElement("button");
            newTextBtn.textContent = "novo texto";
            newTextBtn.classList.add("new-button");
            newTextBtn.classList.add("new-text");
            li.appendChild(newTextBtn);

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "deletar";
            deleteBtn.classList.add("delete-button")
            li.appendChild(deleteBtn);
            
            sections.appendChild(li);

            textList = await getTexts(section.id);
            if(textList.length > 0) {
                const ul = document.createElement("ul");
                li.appendChild(ul);

                for(const text of textList) {
                    const li = document.createElement("li");
                    li.className = "texts";
                    li.dataset.text = JSON.stringify(text);
                    li.textContent = text.content;

                    if(text.hasFile) {
                        const img = document.createElement("img");
                        img.src = await getTextFile(text.id);
                        li.appendChild(img)
                    }

                    const deleteBtn = document.createElement("button");
                    deleteBtn.textContent = "deletar";
                    deleteBtn.classList.add("delete-button")
                    li.appendChild(deleteBtn);

                    ul.appendChild(li);
                }
            }
        }

        renderActions();
    } else {
        document.querySelector(".loading").style.display = "fixed";

        const container = document.querySelector(".container");

        const title = document.createElement("h1");
        title.textContent = post.title;
        
        container.appendChild(title)
    
        for (const section of sectionList) {
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
    }
    
}

function renderActions() {
    let liList = [];
    
    document.querySelectorAll(".sections").forEach(item => {
        liList.push(item)
    })
    document.querySelectorAll(".texts").forEach(item => {
        liList.push(item)
    })

    liList.forEach(item => {
        item.onclick = async event => {
            event.stopPropagation();
            const sectionOrText = Object.keys(item.dataset)[0];
            
            const parent = item.parentElement;

            const textArea = document.createElement("textarea");

            let upload = null;
            
            const saveBtn = document.createElement("button");
            saveBtn.className = "save-button";
            saveBtn.textContent = "Salvar";
            
            const div = document.createElement("div");

            div.appendChild(textArea);

            if(sectionOrText == "text") {
                upload = document.createElement("input");
                upload.type = "file";
                upload.accept = ".png,.jpg,.jpeg,.gif";

                console.log(item)

                if(JSON.parse(item.dataset.text).hasFile){
                    const url = await getTextFile(JSON.parse(item.dataset.text).id);
                    const response = await fetch(url);
                    const blob = await response.blob();

                    const file = new File([blob], "imagem.png", { type: blob.type });

                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    upload.files = dataTransfer.files;
                }
                div.appendChild(upload)
            }

            div.appendChild(saveBtn);

            div.addEventListener("click", e => {
                e.stopPropagation();
                event.stopPropagation();
            })
            
            Array.from(parent.children).forEach((child, i) => {
                if(JSON.parse(child.dataset[sectionOrText]).id == JSON.parse(item.dataset[sectionOrText]).id) {
                    const titleOrContent = Object.keys(JSON.parse(child.dataset[sectionOrText]))[1];
                    const text = JSON.parse(child.dataset[sectionOrText])[titleOrContent];

                    textArea.value = text;

                    parent.children[i].replaceChildren(div);

                    saveBtn.onclick = async () => {
                        const id = JSON.parse(child.dataset[sectionOrText]).id;

                        if(sectionOrText == 'text') {
                            if(child.children[0].children[1].files[0]){
                                await putText(id, textArea.value, JSON.parse(child.dataset[sectionOrText]).sectionId);
                                await postTextFile(child.children[0].children[1].files[0], id)
                            } else {
                                await putText(id, textArea.value, JSON.parse(child.dataset[sectionOrText]).sectionId);
                            }
                        } else {
                            await putSection(id, textArea.value, JSON.parse(child.dataset[sectionOrText]).post.id)
                        }

                        await renderContent();
                    }
                }
            })
            window.scrollTo(0, item.offsetTop)
        }
    })

    document.querySelectorAll(".delete-button").forEach(btn => {
        btn.onclick = async e => {
            e.stopPropagation();
            const parent = btn.parentElement;
            const sectionOrText = Object.keys(parent.dataset)[0];
            const id = JSON.parse(parent.dataset[sectionOrText]).id;

            if(sectionOrText == 'text') {
                await deleteText(id);
                await renderContent();
            } else {
                await deleteSection(id);
                await renderContent();
            }
        }

        window.scrollTo(0, btn.offsetTop);
    })

    document.querySelector("#new-section").onclick = () => {
        document.querySelector("#modalSection").style.display = "flex";
    }

    document.querySelectorAll(".x").forEach(x => {
        x.onclick = () => {
            document.querySelectorAll(".modal").forEach(modal => {
                modal.style.display = "none";
            })
        }
    })
    
    document.querySelectorAll(".modal form").forEach(modal => {
        modal.onsubmit = async (e) => {
            e.preventDefault();

            if(modal.parentElement.id == "modalSection"){
                const title = document.querySelector("#titulo").value;
            
                await postSection(title, post.id);
            } else {
                const content = document.querySelector("#content").value;
                const file = document.querySelector("#file").files[0];

                await postText(content, sectionId, file);
            }
            
            await renderContent();

            modal.parentElement.style.display = "none";
            modal.reset(); 
        }
    })

    document.querySelectorAll(".new-text").forEach(btn => {
        btn.onclick = e => {
            e.stopPropagation();

            document.querySelector("#modalText").style.display = "flex";
            sectionId = JSON.parse(btn.parentElement.dataset.section).id;
        }
    })
}

export { renderPosts, renderContent }