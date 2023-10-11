document.addEventListener("DOMContentLoaded", function () {
  const sliderInput = document.querySelector('input[type="range"]');

  sliderInput.addEventListener("input", function () {
    this.parentNode.style.setProperty("--value", this.value);
    this.parentNode.style.setProperty(
      "--text-value",
      JSON.stringify(this.value)
    );
  });
});
