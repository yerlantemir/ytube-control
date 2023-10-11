const DEFAULT_DISTRACTION_LEVEL = 3;

/**
 * Retrieves the stored distraction level from chrome's local storage.
 *
 * @returns {Promise<number>} - A promise that resolves with the stored distraction level.
 */
async function getStoredValue(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, function (data) {
      resolve(data[key]);
    });
  });
}

/*

  setting: basic | advanced
  sliderValue: 0 - 5
  advanced-settings: {
    thumbnails: boolean;
    comments: boolean;
    related: boolean;
    shorts: boolean;
    duration: boolean;
  }

  popup.js:
    - get stored setting
    - get stored sliderValue
    - get stored advanced-settings
    - update popup.html

  content.js:
    - get setting option

  updateElem:
    create shouldShowVariable for each setting
      shouldShow = basic ? computedDistractionLevel >= level : advanced-settings[setting]

  On distraction level change, I should also maintain the state of the advanced settings.
*/
