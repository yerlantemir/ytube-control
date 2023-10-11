document.addEventListener("DOMContentLoaded", async function () {
  const customOptions = document.querySelector(".custom-options");
  const customOptionsInputs = customOptions.querySelectorAll("input");

  const sliderInput = document.querySelector('input[type="range"]');

  // Fetch the value from storage and set it to the input and styles
  const defaultComputedSliderValue =
    (await getStoredValue("distractionLevel")) ?? DEFAULT_DISTRACTION_LEVEL;

  sliderInput.value = defaultComputedSliderValue;
  sliderInput.parentNode.style.setProperty(
    "--value",
    defaultComputedSliderValue
  );
  sliderInput.parentNode.style.setProperty(
    "--text-value",
    JSON.stringify(defaultComputedSliderValue)
  );

  sliderInput.addEventListener("input", function () {
    this.parentNode.style.setProperty("--value", this.value);
    this.parentNode.style.setProperty(
      "--text-value",
      JSON.stringify(this.value)
    );

    chrome.storage.local.set({
      distractionLevel: this.value,
    });
    const distractionLevel = this.value;
    // Get the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      let activeTab = tabs[0];

      // Send a message to the active tab (where your content script should be running)
      chrome.tabs.sendMessage(activeTab.id, {
        distractionLevel,
      });
    });
  });
});
