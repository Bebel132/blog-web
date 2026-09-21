import { getSections } from "./../services/sections.js";
import { getTexts, getTextFile } from "./../services/texts.js";
import { publishPost } from "./../services/posts.js";

const url = new URLSearchParams(window.location.search);
const post = {
  id: url.get("id"),
  title: url.get("title"),
  creator: url.get("creator"),
  created_at: url.get("date"),
  is_draft: url.get("is_draft") === "true" ? true : false,
};

async function renderContent(admin) {
  try {
    if (admin) {
      document.querySelector("#publish").onclick = async () => {
        await publishPost(post.id).then(() => {
          history.back();
        });
      };
    }
    const sectionList = await getSections(post.id);

    document.querySelector(".loading").style.display = "fixed";

    const content = document.querySelector(".content");
    const sectionsContainer = document.querySelector(".sectionsList");

    sectionsContainer.style.display = "none";

    const title = document.createElement("h1");
    title.textContent = post.title;

    content.appendChild(title);

    for (const section of sectionList) {
      const subtitle = document.createElement("h2");
      subtitle.id = section.title;
      subtitle.textContent = section.title;
      content.appendChild(subtitle);

      const li = document.createElement("li");
      li.textContent = section.title;
      sectionsContainer.appendChild(li);

      const texts = await getTexts(section.id);
      for (const text of texts) {
        const p = document.createElement("p");
        p.innerHTML = text.content;
        content.appendChild(p);

        if (text.hasFile) {
          const imgWrapper = document.createElement("div");
          imgWrapper.classList.add("imgWrapper");

          const img = document.createElement("img");
          const imageFile = await getTextFile(text.id);

          img.src = imageFile.file;

          if (imageFile.width) {
            img.style.width = `${imageFile.width}px`;
          } else {
            img.style.width = "100%";
          }

          if (imageFile.height) {
            img.style.height = `${imageFile.height}px`;
          } else {
            img.style.height = "auto";
          }

          imgWrapper.append(img);
          content.append(imgWrapper);
        }
      }
    }

    const p = document.createElement("p");

    const i = document.createElement("i");
    i.textContent = ` por: ${post.creator}`;
    i.style.display = "block";

    const small = document.createElement("small");
    const date = new Date(post.created_at);
    const formattedDate = new Intl.DateTimeFormat("pt-BR").format(date);
    small.textContent = "- " + formattedDate;

    p.append(i);
    p.append(small);
    content.append(p);

    document.querySelector(".loading").style.display = "none";
    sectionsContainer.style.display = "flex";

    for (const li of sectionsContainer.children) {
      li.onclick = () => {
        document.getElementById(li.textContent).scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      };
    }
  } catch (error) {
    const loading = document.querySelector(".loading");
    const content = document.querySelector(".content");
    const sectionsContainer = document.querySelector(".sectionsList");

    loading.style.display = "none";
    sectionsContainer.style.display = "none";
    content.querySelectorAll("h1, h2, p, .imgWrapper").forEach((element) => element.remove());

    const unavailable = document.createElement("div");
    unavailable.className = "service-unavailable";
    unavailable.innerHTML = `
      <strong>503</strong>
      <h1>Serviço indisponível</h1>
      <p>Não foi possível carregar este post no momento. Tente novamente mais tarde.</p>
    `;
    content.appendChild(unavailable);
    console.error("Não foi possível carregar o post:", error);
  }
}

export { renderContent };