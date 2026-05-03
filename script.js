const loginForm = document.querySelector("#loginForm");
const loginScreen = document.querySelector("#loginScreen");
const placeholderScreen = document.querySelector("#placeholderScreen");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const workerId = String(formData.get("workerId") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!workerId || !password) {
    return;
  }

  loginScreen.hidden = true;
  placeholderScreen.hidden = false;
});
