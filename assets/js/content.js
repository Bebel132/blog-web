import { getSections, putSection, deleteSection, postSection } from "./sections.js"
import { getTexts, putText, deleteText, postText, getTextFile, postTextFile } from "./texts.js"

const postId = new URLSearchParams(window.location.search).get("id");
let sectionId = null;

async function renderContent() {
    const sections = document.querySelector(".sectionList");
    const sectionList = await getSections(postId);
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

            textList.forEach(async text => {
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
            })
        }
    }

    await renderActions();
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
                            await putSection(id, textArea.value, JSON.parse(child.dataset[sectionOrText]).postId)
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
            
                await postSection(title, postId);
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

export { renderContent }