document.addEventListener("DOMContentLoaded", function () {
  var swap = document.querySelector("[data-swap]");
  if (swap) swap.addEventListener("click", function () {
    var origin = document.querySelector("#origin"), destination = document.querySelector("#destination");
    var value = origin.value; origin.value = destination.value; destination.value = value;
  });
  document.querySelectorAll("[data-password]").forEach(function (button) {
    button.addEventListener("click", function () {
      var input = document.querySelector(button.dataset.password);
      input.type = input.type === "password" ? "text" : "password";
      button.textContent = input.type === "password" ? "Show" : "Hide";
    });
  });
});
