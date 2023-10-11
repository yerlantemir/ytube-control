const css = {
  hidden: `
    yt-image.ytd-thumbnail img {
        visibility: hidden;
    }

    #time-status.style-scope.ytd-thumbnail-overlay-time-status-renderer,
    [is-shorts],
    a[title="Shorts"],
    ytd-item-section-renderer#sections[section-identifier="comment-item-section"],
    #related {
        display: none;
    }
    `,
};

const elem = document.createElement("style");
document.documentElement.appendChild(elem);

const updateElem = async () => {
  elem.innerHTML = `/* Injected by the Chrome extension */
  ${css.hidden}`;
};

let lastPathname = window.location.pathname;
setInterval(() => {
  if (lastPathname !== window.location.pathname) {
    lastPathname = window.location.pathname;
    updateElem();
  }
}, 200);

const callback = function (mutationsList, observer) {
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

const observer = new MutationObserver(callback);

observer.observe(document.documentElement, { childList: true, subtree: true });

updateElem();
