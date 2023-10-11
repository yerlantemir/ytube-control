const StoredValueKeysEnum = {
  setting: "setting",
  // if setting === basic
  distractionLevel: "distractionLevel",
  // if setting === advanced
  advancedSettings: "advancedSettings",
};

const DEFAULT_VALUES = {
  [StoredValueKeysEnum.setting]: "basic",
  [StoredValueKeysEnum.distractionLevel]: 3,
  [StoredValueKeysEnum.advancedSettings]: {
    thumbnails: true,
    comments: true,
    relatedVideos: true,
    shorts: true,
    videoDuration: true,
  },
};

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
