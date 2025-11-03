import {
  getPosts,
  getCount,
} from "./../services/posts.js";

let page = 1;
let count = await getCount();

let sectionId = null;

async function renderPosts() {
  const postList = document.querySelector(".postList");
  
  const posts = await getPosts(false, page);
  postList.innerHTML = "";
  posts.forEach((post) => {
    const li = document.createElement("li");
    li.classList.add("post-item");
    li.dataset.post = JSON.stringify({ id: post.id, title: post.title });

    const p = document.createElement("p");
    p.textContent = post.title;

    const i = document.createElement("i");
    i.textContent = ` por: ${post.creator}`;
    i.style.display = "block";

    const small = document.createElement("small");
    const date = new Date(post.created_at);
    const formattedDate = " " + new Intl.DateTimeFormat("pt-BR").format(date);
    small.textContent = formattedDate;

    const div = document.createElement("div");
    div.appendChild(i);
    div.appendChild(small);

    p.appendChild(div);
    li.appendChild(p);
    postList.append(li);
  });

  let firstPostText =
    postList.children[0].children[0].textContent.split("por");
  firstPostText[0] += "- mais novo! 🌟";
  firstPostText[1] =
    firstPostText[1].slice(0, 0) + "por" + firstPostText[1].slice(0);
  postList.children[0].children[0].innerHTML = `${
    firstPostText[0]
  } <div><i style="display: block;">${
    firstPostText[1].split(" ")[0] + " " + firstPostText[1].split(" ")[1]
  }</i><small>${firstPostText[1].split(" ")[2]}</small></div>`;

  document.querySelector("#previous").disabled = false;
  document.querySelector("#next").disabled = false;

  if (page == 1) {
    document.querySelector("#previous").disabled = true;
  }

  if (page == Math.ceil(count / 6)) {
    document.querySelector("#next").disabled = true;
  }

  document.querySelector("#previous").onclick = async () => {
    page--;
    renderPosts(false, await getPosts(false, page));
  };

  document.querySelector("#count").textContent = `${page} de ${Math.ceil(
    count / 6
  )}`;

  document.querySelector("#next").onclick = async () => {
    page++;
    renderPosts(false, await getPosts(false, page));
  };

  for (let i = 0; i < posts.length; i++) {
    document.querySelectorAll(".post-item")[i].children[0].addEventListener("click", () => {
      window.location.href = `pages/post/index.html?id=${posts[i].id}&title=${encodeURIComponent(posts[i].title)}&date=${posts[i].created_at}&creator=${posts[i].creator}`;
    });
  }

}

export { renderPosts };