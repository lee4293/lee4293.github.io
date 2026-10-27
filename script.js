/*
  Workspace: an index of every item on the left, one item open in the reader on the right.
  Routes are plain URL hashes that match pane ids (#about, #project-nuveri), so links are shareable
  and still work as ordinary anchors without JavaScript.
*/

const EMAIL = "danlee4293@gmail.com";
const SITE_TITLE = "Daniel Lee";
const GALLERY_FADE_MS = 150;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const wideLayout = window.matchMedia("(min-width: 900px)");

const app = document.querySelector("[data-app]");
const reader = document.querySelector("[data-reader]");
const indexNav = document.querySelector("[data-index-nav]");
const indexMarker = document.querySelector("[data-index-marker]");

/* ---------- Element helper ---------- */

function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  const { className, text, attrs } = options;
  if (className) {
    node.className = className;
  }
  if (text !== undefined) {
    node.textContent = text;
  }
  Object.entries(attrs || {}).forEach(([name, value]) => {
    if (value !== undefined && value !== null && value !== false) {
      node.setAttribute(name, value === true ? "" : value);
    }
  });
  node.append(...children.filter(Boolean));
  return node;
}

function isExternal(url) {
  return /^https?:\/\//.test(url);
}

/* ---------- Project data ---------- */

const projects = (Array.isArray(window.PROJECTS) ? [...window.PROJECTS] : []).sort(
  (left, right) => (left.order ?? Infinity) - (right.order ?? Infinity),
);
const featuredProjects = projects.filter((project) => project.featured);
const otherProjects = projects.filter((project) => !project.featured);
// Featured first, then the rest: the order used by the index and by previous/next links.
const projectSequence = [...featuredProjects, ...otherProjects];

const projectRoute = (project) => `project-${project.id}`;

/* ---------- Index entries ---------- */

function renderIndexEntry(project) {
  const cover = project.images?.[0];
  const modifiers = [
    project.featured ? "index__item--featured" : "",
    project.status === "in-progress" ? "index__item--in-progress" : "",
  ].join(" ");
  const link = el(
    "a",
    {
      className: `index__item index__item--project ${modifiers}`.trim(),
      attrs: { href: `#${projectRoute(project)}`, "data-route": projectRoute(project) },
    },
    [
      project.featured
        ? el("span", { className: "index__thumb", attrs: { "aria-hidden": "true" } }, [
            cover ? el("img", { attrs: { src: cover.src, alt: "", width: cover.width, height: cover.height, loading: "lazy" } }) : null,
          ])
        : null,
      el("span", { className: "index__text" }, [
        el("span", { className: "index__title", text: project.title }),
        el("span", { className: "index__kicker", text: project.kicker }),
      ]),
    ],
  );
  return el("li", {}, [link]);
}

/* ---------- Project panes ---------- */

function renderLinks(project, className) {
  return el(
    "div",
    { className },
    (project.links || []).map((link, index) =>
      el("a", {
        className: index === 0 ? "btn btn--primary" : "btn",
        text: link.label,
        attrs: {
          href: link.url,
          target: isExternal(link.url) ? "_blank" : null,
          rel: isExternal(link.url) ? "noreferrer" : null,
        },
      }),
    ),
  );
}

function renderMeta(project) {
  const rows = [
    ["Role", project.role],
    ["Stack", (project.stack || []).join(", ")],
    ["Tags", (project.tags || []).join(", ")],
  ].filter(([, value]) => value);

  if (!rows.length) {
    return null;
  }
  return el(
    "dl",
    { className: "project__meta" },
    rows.map(([label, value]) => el("div", {}, [el("dt", { text: label }), el("dd", { text: value })])),
  );
}

function renderGallery(project) {
  const images = project.images || [];
  if (!images.length) {
    return el("div", { className: "project__empty" }, [
      el("p", { className: "project__empty-title", text: project.status === "in-progress" ? "In progress" : "No screenshots yet" }),
      el("p", { text: "Screenshots will appear here once the project is ready to share." }),
    ]);
  }

  const first = images[0];
  const image = el("img", {
    className: "gallery__image",
    attrs: { src: first.src, alt: first.alt, width: first.width, height: first.height, decoding: "async" },
  });
  const figure = el("figure", { className: "gallery", attrs: { "data-gallery": true } }, [
    el("div", { className: "gallery__frame" }, [image]),
  ]);

  if (images.length > 1) {
    const count = el("span", {
      className: "gallery__count",
      text: `1 of ${images.length}`,
      attrs: { "aria-live": "polite" },
    });
    const thumbs = images.map((item, index) =>
      el(
        "button",
        {
          className: "gallery__thumb",
          attrs: {
            type: "button",
            "aria-label": `Show screenshot ${index + 1} of ${images.length}`,
            "aria-pressed": String(index === 0),
            "data-gallery-index": index,
          },
        },
        [el("img", { attrs: { src: item.src, alt: "", width: item.width, height: item.height, loading: "lazy" } })],
      ),
    );
    figure.append(
      el("figcaption", { className: "gallery__controls" }, [
        el("button", { className: "gallery__step", text: "‹", attrs: { type: "button", "aria-label": "Previous screenshot", "data-gallery-step": "-1" } }),
        count,
        el("button", { className: "gallery__step", text: "›", attrs: { type: "button", "aria-label": "Next screenshot", "data-gallery-step": "1" } }),
        el("div", { className: "gallery__thumbs" }, thumbs),
      ]),
    );
    galleries.set(figure, { images, index: 0, image, count, thumbs, timeoutId: null });
  }

  return figure;
}

function renderPager(project) {
  const position = projectSequence.indexOf(project);
  const previous = projectSequence[position - 1];
  const next = projectSequence[position + 1];
  if (!previous && !next) {
    return null;
  }

  const pagerLink = (target, direction) =>
    el("a", { className: `pager__link pager__link--${direction}`, attrs: { href: `#${projectRoute(target)}` } }, [
      el("span", { className: "pager__label", text: direction === "previous" ? "Previous project" : "Next project" }),
      el("span", { className: "pager__title", text: target.title }),
    ]);

  return el("nav", { className: "pager", attrs: { "aria-label": "More projects" } }, [
    previous ? pagerLink(previous, "previous") : el("span"),
    next ? pagerLink(next, "next") : null,
  ]);
}

function renderProjectPane(project) {
  const titleId = `${projectRoute(project)}-title`;
  return el(
    "article",
    {
      className: `pane pane--project${project.featured ? " pane--featured" : ""}`,
      attrs: { id: projectRoute(project), "data-pane": projectRoute(project), "aria-labelledby": titleId, "data-title": project.title },
    },
    [
      el("header", { className: "project__head" }, [
        el("p", { className: "project__kicker", text: project.kicker }),
        el("h2", { className: "project__title", text: project.title, attrs: { id: titleId, tabindex: "-1" } }),
        el("p", { className: "project__summary", text: project.summary }),
        renderLinks(project, "project__links"),
      ]),
      renderGallery(project),
      el("div", { className: "project__body" }, [
        el("section", { className: "project__section", attrs: { "aria-labelledby": `${titleId}-overview` } }, [
          el("h3", { text: "Overview", attrs: { id: `${titleId}-overview` } }),
          el("p", { text: project.description || project.summary }),
        ]),
        el("section", { className: "project__section project__section--side", attrs: { "aria-labelledby": `${titleId}-users` } }, [
          renderMeta(project),
          el("h3", { text: "Users", attrs: { id: `${titleId}-users` } }),
          el("p", { text: "People who may find this project useful:" }),
          el("ul", { className: "project__users" }, (project.users || []).map((user) => el("li", { text: user }))),
        ]),
      ]),
      renderPager(project),
    ],
  );
}

const galleries = new Map();

function renderProjects() {
  const featuredList = document.querySelector("[data-index-featured]");
  const restList = document.querySelector("[data-index-rest]");
  const restLabel = document.querySelector("[data-index-rest-label]");
  const paneMount = document.querySelector("[data-project-panes]");

  featuredList.replaceChildren(...featuredProjects.map(renderIndexEntry));
  restList.replaceChildren(...otherProjects.map(renderIndexEntry));
  featuredList.hidden = featuredProjects.length === 0;
  featuredList.previousElementSibling.hidden = featuredProjects.length === 0;
  restList.hidden = otherProjects.length === 0;
  restLabel.hidden = otherProjects.length === 0;

  paneMount.replaceWith(...projectSequence.map(renderProjectPane));

  // Stagger index for the page-load entrance.
  indexLinks().forEach((link, position) => link.style.setProperty("--i", position));
}

/* ---------- Gallery ---------- */

function showGalleryImage(figure, nextIndex) {
  const state = galleries.get(figure);
  if (!state) {
    return;
  }

  state.index = (nextIndex + state.images.length) % state.images.length;
  const item = state.images[state.index];
  state.count.textContent = `${state.index + 1} of ${state.images.length}`;
  state.thumbs.forEach((thumb, index) => thumb.setAttribute("aria-pressed", String(index === state.index)));

  const apply = () => {
    state.image.src = item.src;
    state.image.alt = item.alt;
    state.image.width = item.width;
    state.image.height = item.height;
    state.image.classList.remove("is-swapping");
  };

  window.clearTimeout(state.timeoutId);
  if (reducedMotion.matches) {
    apply();
    return;
  }
  state.image.classList.add("is-swapping");
  state.timeoutId = window.setTimeout(apply, GALLERY_FADE_MS);
}

reader.addEventListener("click", (event) => {
  const step = event.target.closest("[data-gallery-step]");
  const thumb = event.target.closest("[data-gallery-index]");
  const figure = event.target.closest("[data-gallery]");
  if (!figure || (!step && !thumb)) {
    return;
  }
  const state = galleries.get(figure);
  showGalleryImage(figure, thumb ? Number(thumb.dataset.galleryIndex) : state.index + Number(step.dataset.galleryStep));
});

/* ---------- Routing ---------- */

const panes = () => [...document.querySelectorAll("[data-pane]")];
const indexLinks = () => [...document.querySelectorAll(".index__item[data-route]")];
let currentRoute = null;
let indexScrollY = 0;

function resolveRoute(hash) {
  const name = decodeURIComponent(hash.replace(/^#\/?/, ""));
  if (name === "index" || name === "") {
    return wideLayout.matches ? "overview" : "index";
  }
  if (name === "home") {
    return "overview";
  }
  if (name === "projects") {
    return projectSequence[0] ? projectRoute(projectSequence[0]) : "overview";
  }
  return document.querySelector(`[data-pane="${CSS.escape(name)}"]`) ? name : "overview";
}

function positionMarker() {
  const active = indexLinks().find((link) => link.dataset.route === currentRoute);
  if (!indexMarker || !active) {
    indexMarker?.classList.remove("is-visible");
    return;
  }
  const navTop = indexNav.getBoundingClientRect().top;
  const linkBox = active.getBoundingClientRect();
  indexMarker.style.transform = `translateY(${linkBox.top - navTop}px) scaleY(${linkBox.height})`;
  indexMarker.classList.add("is-visible");
}

function showRoute(route, { moveFocus }) {
  const isIndex = route === "index";
  const leavingIndex = app.dataset.view === "index" && !isIndex;
  if (leavingIndex) {
    indexScrollY = window.scrollY;
  }
  app.dataset.view = isIndex ? "index" : "reader";

  if (!isIndex) {
    let shown = null;
    panes().forEach((pane) => {
      const match = pane.dataset.pane === route;
      pane.hidden = !match;
      if (match) {
        shown = pane;
      }
    });

    if (route !== currentRoute && shown) {
      shown.classList.remove("is-entering");
      void shown.offsetWidth;
      shown.classList.add("is-entering");
    }

    if (route === "resume") {
      const frame = shown?.querySelector("iframe[data-src]");
      if (frame && !frame.getAttribute("src")) {
        frame.src = frame.dataset.src;
      }
    }

    const heading = shown?.querySelector("[tabindex='-1']");
    const title = route === "overview" ? null : shown?.dataset.title || heading?.textContent;
    document.title = title ? `${title} | ${SITE_TITLE}` : `${SITE_TITLE} | Portfolio`;
    currentRoute = route;
    reader.scrollTop = 0;

    if (!wideLayout.matches) {
      window.scrollTo(0, 0);
    }
    if (moveFocus) {
      heading?.focus({ preventScroll: true });
    }
  } else {
    document.title = `${SITE_TITLE} | Portfolio`;
    window.scrollTo(0, indexScrollY);
    if (moveFocus) {
      indexLinks().find((link) => link.dataset.route === currentRoute)?.focus({ preventScroll: true });
    }
  }

  indexLinks().forEach((link) => {
    if (link.dataset.route === currentRoute) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
  positionMarker();
}

window.addEventListener("hashchange", () => showRoute(resolveRoute(location.hash), { moveFocus: true }));

wideLayout.addEventListener("change", () => {
  if (app.dataset.view === "index" && wideLayout.matches) {
    showRoute(currentRoute || "overview", { moveFocus: false });
  }
  positionMarker();
});

/* ---------- Index keyboard navigation ---------- */

indexNav.addEventListener("keydown", (event) => {
  const keys = { ArrowDown: 1, ArrowUp: -1, Home: "first", End: "last" };
  if (!(event.key in keys)) {
    return;
  }
  const links = indexLinks();
  const position = links.indexOf(document.activeElement);
  if (position < 0) {
    return;
  }
  event.preventDefault();
  const step = keys[event.key];
  const target = step === "first" ? 0 : step === "last" ? links.length - 1 : Math.min(links.length - 1, Math.max(0, position + step));
  links[target].focus();
});

/* ---------- Copy email ---------- */

const copyStatus = document.querySelector("[data-copy-status]");

document.querySelectorAll("[data-copy-email]").forEach((button) => {
  const originalLabel = button.textContent;
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      button.textContent = "Copied";
      button.classList.add("is-copied");
      copyStatus.textContent = "Email address copied";
      window.setTimeout(() => {
        button.textContent = originalLabel;
        button.classList.remove("is-copied");
        copyStatus.textContent = "";
      }, 1400);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  });
});

/* ---------- Start ---------- */

renderProjects();
showRoute(resolveRoute(location.hash), { moveFocus: false });
// The index entrance plays once; drop the class so returning to the index on mobile doesn't replay it.
app.classList.add("is-ready");
window.setTimeout(() => app.classList.remove("is-ready"), 1000);

if ("ResizeObserver" in window) {
  new ResizeObserver(positionMarker).observe(indexNav);
}
document.fonts?.ready.then(positionMarker);
