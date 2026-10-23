document.addEventListener("DOMContentLoaded", () => {
  const swap = document.querySelector("[data-swap]");
  if (swap) {
    swap.addEventListener("click", () => {
      const from = document.getElementById("id_from_station");
      const to = document.getElementById("id_to_station");
      [from.value, to.value] = [to.value, from.value];
    });
  }
  document.querySelectorAll("[data-password-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.querySelector(button.dataset.passwordToggle);
      const visible = input.type === "text";
      input.type = visible ? "password" : "text";
      button.textContent = visible ? "Show" : "Hide";
      button.setAttribute("aria-label", visible ? "Show password" : "Hide password");
    });
  });
});
