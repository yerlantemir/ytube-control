const PATHNAME_CHECK_INTERVAL_IN_MS = 200;
const DEFAULT_DISTRACTION_LEVEL = 100;

const STYLE_TAG = document.createElement("style");
document.documentElement.appendChild(STYLE_TAG);

updateElem({ isFirstLoad: true });

let lastPathname = window.location.pathname;
setInterval(() => {
  if (lastPathname !== window.location.pathname) {
    lastPathname = window.location.pathname;
    updateElem();
  }
}, PATHNAME_CHECK_INTERVAL_IN_MS);

chrome.runtime.onMessage.addListener(function (message) {
  if (message.sliderValue) {
    updateElem({
      distractionLevel: message.sliderValue,
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
    level: 25,
  },
  comments: {
    css: `
        ytd-item-section-renderer#sections[section-identifier="comment-item-section"] {
            display: none;
        }
        `,
    level: 25,
  },
  relatedVideos: {
    css: `
        #related {
            display: none;
        }
    `,
    level: 75,
  },
  shorts: {
    css: `
        [is-shorts],
        a[title="Shorts"] {
            display: none;
        }
    `,
    level: 100,
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
    level: 100,
  },
};

async function updateElem({ distractionLevel, isFirstLoad = false }) {
  const storedDistractionLevel = await getStoredDistractionLevel();

  const computedDistractionLevel =
    distractionLevel ?? storedDistractionLevel ?? DEFAULT_DISTRACTION_LEVEL;

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

async function getStoredDistractionLevel() {
  return new Promise((resolve) => {
    chrome.storage.local.get("sliderValue", function ({ sliderValue }) {
      resolve(sliderValue);
    });
  });
}
