document.addEventListener("DOMContentLoaded", () => {
  const swap = document.querySelector("[data-swap]");
  if (swap) swap.addEventListener("click", () => {
    const from = document.querySelector("#from"), to = document.querySelector("#to");
    [from.value, to.value] = [to.value, from.value];
  });
  document.querySelectorAll("[data-password]").forEach((button) => button.addEventListener("click", () => {
    const input = document.querySelector(button.dataset.password), visible = input.type === "text";
    input.type = visible ? "password" : "text"; button.textContent = visible ? "Show" : "Hide";
  }));
});
