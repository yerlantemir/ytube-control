const DEFAULT_DISTRACTION_LEVEL = 100;

/**
 * Retrieves the stored distraction level from chrome's local storage.
 *
 * @returns {Promise<number>} - A promise that resolves with the stored distraction level.
 */
async function getStoredDistractionLevel() {
  return new Promise((resolve) => {
    chrome.storage.local.get("sliderValue", function ({ sliderValue }) {
      resolve(sliderValue);
    });
  });
}
