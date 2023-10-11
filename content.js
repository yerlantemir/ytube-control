const PATHNAME_CHECK_INTERVAL_IN_MS = 200;
const STYLE_TAG = document.createElement("style");
document.documentElement.appendChild(STYLE_TAG);

/**
 * Runs the updateElem function on first load.
 */
updateUI();

/**
 * Checks for changes in the window's pathname at a regular interval.
 * If a change is detected, it updates the distracting elements on the page.
 */
let lastPathname = window.location.pathname;
setInterval(() => {
  if (lastPathname !== window.location.pathname) {
    lastPathname = window.location.pathname;
    updateUI();
  }
}, PATHNAME_CHECK_INTERVAL_IN_MS);

/**
 * Listens for messages from the popup and updates when user changes the slider value.
 */
chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (let key in changes) {
    let storageChange = changes[key];
    updateUI({
      [key]: storageChange.newValue,
    });
  }
});

const distractingElements = {
  thumbnails: {
    css: `
        yt-image.ytd-thumbnail img {
            visibility: hidden;
        }
        `,
    level: 1,
  },
  comments: {
    css: `
        ytd-item-section-renderer#sections[section-identifier="comment-item-section"] {
            display: none;
        }
        `,
    level: 1,
  },
  relatedVideos: {
    css: `
        #related {
            display: none;
        }
    `,
    level: 2,
  },
  shorts: {
    css: `
        [is-shorts],
        a[title="Shorts"] {
            display: none;
        }
    `,
    level: 3,
    show: () => {
      const element = document.querySelector('[title="Shorts"]');
      if (element) {
        element.style.display = "block";
      }
    },
    hide: () => {
      const element = document.querySelector('[title="Shorts"]');
      if (element) {
        element.style.display = "none";
      }
    },
    onFirstLoadCallback: () => {
      const observeAndHideShortsTab = function (mutationsList, observer) {
        for (let mutation of mutationsList) {
          if (mutation.addedNodes.length) {
            const element = document.querySelector('[title="Shorts"]');
            if (element) {
              element.style.display = "none";
              observer.disconnect();
            }
          }
        }
      };

      const observer = new MutationObserver(observeAndHideShortsTab);

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    },
  },
  videoDuration: {
    css: `
        #time-status.style-scope.ytd-thumbnail-overlay-time-status-renderer {
            display: none;
        }
    `,
    level: 3,
  },
};

async function getPersistedSettings() {
  const setting = await getStoredValue(StoredValueKeysEnum.setting);
  const distractionLevel = await getStoredValue(
    StoredValueKeysEnum.distractionLevel
  );
  const advancedSettings = await getStoredValue(
    StoredValueKeysEnum.advancedSettings
  );
  return {
    ...(setting && { setting }),
    ...(distractionLevel && { distractionLevel }),
    ...(advancedSettings && { advancedSettings }),
  };
}

/**
 * @typedef {Object} CustomSettings
 * @property {("basic"|"advanced")} [setting] - Specifies the setting type.
 * @property {number} [distractionLevel] - The level of distraction, ranging from 0 to 5.
 * @property {Object} [advancedSettings] - Contains settings for advanced configuration.
 * @property {boolean} [advancedSettings.thumbnails] - Indicates whether thumbnails should be shown.
 * @property {boolean} [advancedSettings.comments] - Indicates whether comments should be shown.
 * @property {boolean} [advancedSettings.relatedVideos] - Indicates whether related videos should be shown.
 * @property {boolean} [advancedSettings.shorts] - Indicates whether shorts should be shown.
 * @property {boolean} [advancedSettings.videoDuration] - Indicates whether video duration should be shown.
 */

/**
 * Updates the UI based on custom settings.
 *
 * @param {CustomSettings} customSettings - An object containing custom settings.
 */
let mounted = false;
async function updateUI(customSettings = {}) {
  const persistedSettings = await getPersistedSettings();
  const settings = {
    ...DEFAULT_VALUES,
    ...persistedSettings,
    ...customSettings,
  };

  const isBasicSetting = settings.setting === "basic";

  let injectingCss = "";

  Object.keys(distractingElements).forEach((key) => {
    const { css, level, onFirstLoadCallback, hide, show } =
      distractingElements[key];

    const shouldHide = isBasicSetting
      ? settings.distractionLevel >= level
      : settings.advancedSettings[key];

    const shouldShow = isBasicSetting
      ? settings.distractionLevel < level
      : !settings.advancedSettings[key];

    if (shouldHide) {
      injectingCss += css;
    }
    if (!mounted && onFirstLoadCallback && shouldShow) {
      onFirstLoadCallback();
    }
    if (shouldHide && hide) {
      hide();
    }
    if (shouldShow && show) {
      show();
    }

    mounted = true;
  });

  STYLE_TAG.innerHTML = `/* Injected by the Chrome extension */
      ${injectingCss}`;
}
