const PATHNAME_CHECK_INTERVAL_IN_MS = 200;

const STYLE_TAG = document.createElement("style");
document.documentElement.appendChild(STYLE_TAG);

/**
 * Runs the updateElem function on first load.
 */
updateElem({ isFirstLoad: true });

/**
 * Checks for changes in the window's pathname at a regular interval.
 * If a change is detected, it updates the distracting elements on the page.
 */
let lastPathname = window.location.pathname;
setInterval(() => {
  if (lastPathname !== window.location.pathname) {
    lastPathname = window.location.pathname;
    updateElem();
  }
}, PATHNAME_CHECK_INTERVAL_IN_MS);

/**
 * Listens for messages from the popup and updates when user changes the slider value.
 */
chrome.runtime.onMessage.addListener(function (message) {
  if (message.distractionLevel) {
    updateElem({
      distractionLevel: message.distractionLevel,
    });
  }
});

const distractingElements = {
  thumbnail: {
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

/**
 * Updates elements on the page based on the set distraction level.
 * @param {object} [options={}] - Configuration options.
 * @param {number} [options.distractionLevel] - The level of distraction to apply (0 to 100).
 * @param {boolean} [options.isFirstLoad=false] - Flag indicating if it's the first time the function is called.
 */
async function updateElem({ distractionLevel, isFirstLoad = false }) {
  const storedDistractionLevel = await getStoredValue("distractionLevel");

  const computedDistractionLevel =
    distractionLevel ?? storedDistractionLevel ?? DEFAULT_DISTRACTION_LEVEL;

  console.log({ storedDistractionLevel, computedDistractionLevel });
  let injectingCss = "";

  Object.keys(distractingElements).forEach((key) => {
    const { css, level, onFirstLoadCallback, hide, show } =
      distractingElements[key];
    // inject css
    if (computedDistractionLevel >= level) {
      injectingCss += css;
    }
    if (
      isFirstLoad &&
      onFirstLoadCallback &&
      computedDistractionLevel >= level
    ) {
      onFirstLoadCallback();
    }
    if (computedDistractionLevel >= level && hide) {
      hide();
    }
    if (computedDistractionLevel < level && show) {
      show();
    }
  });

  STYLE_TAG.innerHTML = `/* Injected by the Chrome extension */
      ${injectingCss}`;
}
