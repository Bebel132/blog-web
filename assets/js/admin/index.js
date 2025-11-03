import {
  getPosts,
  putPost,
  deletePost,
  postPost,
} from "./../services/posts.js";

async function renderPosts() {
    const postList = document.querySelector(".postList");
    const posts = await getPosts(true);
    postList.innerHTML = "";

    posts.forEach((post) => {
      const li = document.createElement("li");
      li.classList.add("post-item");
      li.dataset.post = JSON.stringify({ id: post.id, title: post.title });

      const p = document.createElement("p");
      p.textContent = `${post.title} ${post.is_draft ? "(rascunho)" : ""}`;

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
      const formattedDate = new Intl.DateTimeFormat("pt-BR").format(date);
      small.textContent = "- " + formattedDate;
      small.style.display = "block";

      p.appendChild(small);
      li.appendChild(p);
      li.appendChild(input);
      li.appendChild(editButton);
      li.appendChild(saveButton);
      li.appendChild(deleteButton);
      postList.append(li);

      input.onkeydown = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          ;saveButton.click();
        }
      }
    });

    for (let i = 0; i < posts.length; i++) {
      document.querySelectorAll(".post-item")[i].children[0].addEventListener("click", () => {
        window.location.href = `post.html?id=${posts[i].id}&title=${encodeURIComponent(posts[i].title)}&date=${posts[i].created_at}&creator=${posts[i].creator}&is_draft=${posts[i].is_draft}`;
      });
    }

    renderPostButtons();
}

function renderPostButtons() {
  document.querySelectorAll(".edit-button").forEach((button) => {
    button.onclick = (e) => {
      e.stopPropagation();
      const parent = button.parentElement;
      parent.children[0].style.display = "none"; // p
      parent.children[1].style.display = "inline"; // input
      parent.children[1].focus();

      parent.children[2].style.display = "none"; // editButton
      parent.children[3].style.display = "inline"; // saveButton
      parent.children[4].style.display = "none"; // deleteButton
    };
  });

  document.querySelectorAll(".save-button").forEach((button) => {
    button.onclick = async () => {
      try {
        const parent = button.parentElement;

        parent.children[0].style.display = "block"; // p
        parent.children[1].style.display = "none"; // input

        parent.children[2].style.display = "block"; // editButton
        parent.children[3].style.display = "none"; // saveButton
        parent.children[4].style.display = "block"; // deleteButton

        await putPost(
          JSON.parse(parent.dataset.post).id,
          parent.children[1].value
        );
      } catch (error) {
        alert("Erro ao salvar o post");
      }
      renderPosts(await getPosts(true), true);
    };
  });

  document.querySelectorAll(".delete-button").forEach((button) => {
    button.onclick = async () => {
      const parent = button.parentElement;
      await deletePost(JSON.parse(parent.dataset.post).id);
      renderPosts(await getPosts(true), true);
    };
  });

  document.querySelector(".new-button").onclick = () => {
    document.querySelector(".modal").style.display = "flex";
    document.querySelector(".modal").children[1].children[1].focus();
  };

  document.querySelector(".x").onclick = () => {
    document.querySelector(".modal").style.display = "none";
  };

  document.querySelector(".modal form").onsubmit = async (e) => {
    e.preventDefault();

    const title = document.querySelector("#titulo").value;

    await postPost(title);

    renderPosts(await getPosts(true), true);

    document.querySelector(".modal").style.display = "none";
    document.querySelector(".modal form").reset();
  };
}

export { renderPosts };