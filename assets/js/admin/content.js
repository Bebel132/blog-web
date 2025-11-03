import {
  getSections,
  putSection,
  deleteSection,
  postSection,
} from "./../services/sections.js";
import {
  getTexts,
  putText,
  deleteText,
  postText,
  getTextFile,
  postTextFile,
} from "./../services/texts.js";

const url = new URLSearchParams(window.location.search);
const post = {
  id: url.get("id"),
  title: url.get("title"),
  creator: url.get("creator"),
  created_at: url.get("date"),
  is_draft: url.get("is_draft") === "true" ? true : false,
};

let sectionId = null;

async function renderContent() {
  const sectionList = await getSections(post.id);

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
    deleteBtn.classList.add("delete-button");
    li.appendChild(deleteBtn);

    sections.appendChild(li);

    textList = await getTexts(section.id);
    if (textList.length > 0) {
      const ul = document.createElement("ul");
      li.appendChild(ul);

      for (const text of textList) {
        const li = document.createElement("li");
        li.className = "texts";
        li.dataset.text = JSON.stringify(text);

        const p = document.createElement("p");
        p.innerHTML = text.content;

        li.append(p);

        if (text.hasFile) {
          const img = document.createElement("img");
          img.src = await getTextFile(text.id);
          li.appendChild(img);
        }

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "deletar";
        deleteBtn.classList.add("delete-button");
        li.appendChild(deleteBtn);

        ul.appendChild(li);
      }
    }
  }

  renderActions();
}

function renderActions() {
  let liList = [];

  document.querySelectorAll(".sections").forEach((item) => {
    liList.push(item);
  });
  document.querySelectorAll(".texts").forEach((item) => {
    liList.push(item);
  });

  !post.is_draft && (document.querySelector("#preview-post").style.display = "none");

  liList.forEach((item) => {
    item.onclick = async (event) => {
      event.stopPropagation();
      const sectionOrText = Object.keys(item.dataset)[0];

      const parent = item.parentElement;

      const textArea = document.createElement("textarea");

      textArea.addEventListener(
        "keydown",
        (e) => e.key == "Enter" && saveBtn.click()
      );

      textArea.addEventListener("input", () => {
        textArea.style.height = "auto";
        textArea.style.height = textArea.scrollHeight + "px";
      });

      let upload = null;

      const saveBtn = document.createElement("button");
      saveBtn.className = "save-button";
      saveBtn.textContent = "Salvar";

      const div = document.createElement("div");

      div.appendChild(textArea);

      if (sectionOrText == "text") {
        upload = document.createElement("input");
        upload.type = "file";
        upload.accept = ".png,.jpg,.jpeg,.gif";

        if (JSON.parse(item.dataset.text).hasFile) {
          const url = await getTextFile(JSON.parse(item.dataset.text).id);
          const response = await fetch(url);
          const blob = await response.blob();

          const file = new File([blob], "imagem.png", { type: blob.type });

          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          upload.files = dataTransfer.files;
        }
        div.appendChild(upload);
      }

      div.appendChild(saveBtn);

      div.addEventListener("click", (e) => {
        e.stopPropagation();
        event.stopPropagation();
      });

      Array.from(parent.children).forEach((child, i) => {
        if (
          JSON.parse(child.dataset[sectionOrText]).id ==
          JSON.parse(item.dataset[sectionOrText]).id
        ) {
          const titleOrContent = Object.keys(
            JSON.parse(child.dataset[sectionOrText])
          )[1];
          const text = JSON.parse(child.dataset[sectionOrText])[titleOrContent];

          textArea.value = text;
          parent.children[i].replaceChildren(div);

          textArea.onkeydown = (e) => {
            if (e.key == "Tab") {
              e.preventDefault();

              const el = e.target;
              const start = el.selectionStart;
              const end = el.selectionEnd;

              const tab = "\t";
              el.setRangeText(tab, start, end, "end");
            }
          };

          textArea.style.height = "auto";
          const computed = getComputedStyle(textArea);
          const borderY =
            parseFloat(computed.borderTopWidth) +
            parseFloat(computed.borderBottomWidth);
          textArea.style.height = textArea.scrollHeight + borderY + "px";
          textArea.focus();

          saveBtn.onclick = async () => {
            const id = JSON.parse(child.dataset[sectionOrText]).id;

            if (sectionOrText == "text") {
              if (child.children[0].children[1].files[0]) {
                await putText(
                  id,
                  textArea.value,
                  JSON.parse(child.dataset[sectionOrText]).sectionId
                );
                await postTextFile(child.children[0].children[1].files[0], id);
              } else {
                await putText(
                  id,
                  textArea.value,
                  JSON.parse(child.dataset[sectionOrText]).sectionId
                );
              }
            } else {
              await putSection(
                id,
                textArea.value,
                JSON.parse(child.dataset[sectionOrText]).postId
              );
            }

            await renderContent(true);
          };
        }
      });
      window.scrollTo(0, item.offsetTop);
    };
  });

  document.querySelectorAll(".delete-button").forEach((btn) => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const parent = btn.parentElement;
      const sectionOrText = Object.keys(parent.dataset)[0];
      const id = JSON.parse(parent.dataset[sectionOrText]).id;

      if (sectionOrText == "text") {
        await deleteText(id);
        await renderContent(true);
      } else {
        await deleteSection(id);
        await renderContent(true);
      }
    };

    window.scrollTo(0, btn.offsetTop);
  });

  document.querySelector("#new-section").onclick = () => {
    document.querySelector("#modalSection").style.display = "flex";

    document.querySelector("#modalSection").children[1].children[1].focus();
  };

  document.querySelectorAll(".x").forEach((x) => {
    x.onclick = () => {
      document.querySelectorAll(".modal").forEach((modal) => {
        modal.style.display = "none";
      });
    };
  });

  document.querySelectorAll(".modal form").forEach((modal) => {
    modal.onsubmit = async (e) => {
      e.preventDefault();

      if (modal.parentElement.id == "modalSection") {
        const title = document.querySelector("#titulo").value;

        await postSection(title, post.id);
      } else {
        const content = document.querySelector("#content").value;
        const file = document.querySelector("#file").files[0];

        await postText(content, sectionId, file);
      }

      await renderContent(true);

      modal.parentElement.style.display = "none";
      modal.reset();
    };
  });

  document.querySelector("#content").onkeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.querySelector("#content").parentElement.children[5].click();
    }
  };

  document.querySelectorAll(".new-text").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();

      document.querySelector("#modalText").style.display = "flex";

      document.querySelector("#modalText").children[1].children[1].focus();

      sectionId = JSON.parse(btn.parentElement.dataset.section).id;
    };
  });

  document.querySelector("#preview-post").onclick = () => {
    window.location.href = `postPreview.html?id=${post.id}&title=${encodeURIComponent(post.title)}&date=${post.created_at}&creator=${post.creator}`;
  };
}

export { renderContent };
