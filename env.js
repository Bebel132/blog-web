window.env = {
  //API_URL: "http://127.0.0.1:5000"
  API_URL: "https://emanuelferreira.pythonanywhere.com"
};

const isGithub = location.hostname.includes("github.io");
if (isGithub) {
  const base = document.createElement("base");
  base.href = "/blog-web/";
  document.head.appendChild(base);
}