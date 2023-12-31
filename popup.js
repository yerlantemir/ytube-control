document.addEventListener("DOMContentLoaded", async function () {
  handleSelectedOption();
  handleAdvancedSettingValues();
  handleBasicSettingValues();
});

function handleSelectedOption() {
  const settingRadios = document.getElementsByName("setting-radio");
  settingRadios.forEach(async (radio) => {
    radio.addEventListener("change", () => {
      chrome.storage.local.set({
        [StoredValueKeysEnum.setting]: radio.id,
      });

      settingRadios.forEach((nestedRadio) => {
        if (radio === nestedRadio) {
          nestedRadio.closest(".section").classList.remove("section-disabled");
        } else {
          nestedRadio.closest(".section").classList.add("section-disabled");
        }
      });
    });

    const selectedValue =
      (await getStoredValue(StoredValueKeysEnum.setting)) ??
      DEFAULT_VALUES[StoredValueKeysEnum.setting];
    radio.checked = selectedValue === radio.id;
    if (!radio.checked)
      radio.closest(".section").classList.add("section-disabled");
  });
}

function handleAdvancedSettingValues() {
  const customOptions = document.querySelector(".custom-options");
  const customOptionsInputs = customOptions.querySelectorAll("input");

  customOptionsInputs.forEach(async (input) => {
    input.addEventListener("change", async (e) => {
      const advancedSettings =
        (await getStoredValue(StoredValueKeysEnum.advancedSettings)) ?? {};
      chrome.storage.local.set({
        [StoredValueKeysEnum.advancedSettings]: {
          ...advancedSettings,
          [e.target.id]: e.target.checked,
        },
      });
    });
    const advancedSettings =
      (await getStoredValue(StoredValueKeysEnum.advancedSettings)) ??
      DEFAULT_VALUES[StoredValueKeysEnum.advancedSettings];
    input.checked = advancedSettings[input.id];
  });
}

async function handleBasicSettingValues() {
  const sliderInput = document.querySelector('input[type="range"]');

  sliderInput.addEventListener("input", function () {
    this.parentNode.style.setProperty("--value", this.value);
    this.parentNode.style.setProperty(
      "--text-value",
      JSON.stringify(this.value)
    );

    chrome.storage.local.set({
      [StoredValueKeysEnum.distractionLevel]: this.value,
    });
  });

  // Fetch the value from storage and set it to the input and styles
  const defaultComputedSliderValue =
    (await getStoredValue("distractionLevel")) ??
    DEFAULT_VALUES[StoredValueKeysEnum.distractionLevel];

  sliderInput.value = defaultComputedSliderValue;
  sliderInput.parentNode.style.setProperty(
    "--value",
    defaultComputedSliderValue
  );
  sliderInput.parentNode.style.setProperty(
    "--text-value",
    JSON.stringify(defaultComputedSliderValue)
  );
}
