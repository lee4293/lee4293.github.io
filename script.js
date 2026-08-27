const mobileDrawer = document.querySelector("[data-mobile-drawer]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const progressBar = document.querySelector(".scroll-progress__bar");
const homeJumpButton = document.querySelector("[data-home-jump]");
const copyButtons = document.querySelectorAll("[data-copy-email]");
const sectionLinks = document.querySelectorAll("[data-jump], .site-nav a, .mobile-drawer a");
const sections = [...document.querySelectorAll("main section[id]")];

function toggleMobileMenu(forceState) {
  if (!mobileDrawer || !menuToggle) {
    return;
  }

  const nextOpen = typeof forceState === "boolean" ? forceState : mobileDrawer.hidden;
  mobileDrawer.hidden = !nextOpen;
  menuToggle.classList.toggle("is-open", nextOpen);
  menuToggle.setAttribute("aria-expanded", String(nextOpen));
}

function scrollToSection(target) {
  const element = document.querySelector(target);
  if (!element) {
    return;
  }

  element.scrollIntoView({ behavior: "smooth", block: "start" });
  toggleMobileMenu(false);
}

function updateProgress() {
  if (!progressBar) {
    return;
  }

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;

}

function updateActiveSection(currentId) {
  if (homeJumpButton) {
    homeJumpButton.hidden = currentId === "home"; 
  }

  sectionLinks.forEach((link) => {
    const href = link.getAttribute("href") || link.dataset.jump;
    if (!href) {
      return;
    }

    const isCurrent = href === `#${currentId}`;
    link.classList.toggle("is-active", isCurrent);
    if (link.matches(".site-nav a")) {
      link.setAttribute("aria-current", isCurrent ? "page" : "false");
    }
  });
}

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visibleSection = entries
      .filter((entry) => entry.isIntersecting)
      .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

    if (visibleSection) {
      updateActiveSection(visibleSection.target.id);
    }
  },
  {
    rootMargin: "-35% 0px -45% 0px",
    threshold: [0.2, 0.35, 0.5, 0.65],
  },
);

sections.forEach((section) => sectionObserver.observe(section));

document.querySelectorAll("[data-jump]").forEach((button) => {
  button.addEventListener("click", () => scrollToSection(button.dataset.jump));
});

sectionLinks.forEach((link) => {
  if (!link.matches("[data-jump]")) {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        event.preventDefault();
        scrollToSection(href);
      }
    });
  }
});

if (menuToggle) {
  menuToggle.addEventListener("click", () => toggleMobileMenu());
}

document.addEventListener("click", (event) => {
  if (mobileDrawer && menuToggle && !mobileDrawer.hidden) {
    const target = event.target;
    if (!mobileDrawer.contains(target) && !menuToggle.contains(target)) {
      toggleMobileMenu(false);
    }
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    toggleMobileMenu(false);
    closeProjectModal();
  }
});

copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const email = "danlee4293@gmail.com";
    try {
      await navigator.clipboard.writeText(email);
      button.classList.add("is-copied");
      const originalLabel = button.textContent;
      button.textContent = "Copied";
      window.setTimeout(() => {
        button.classList.remove("is-copied");
        button.textContent = originalLabel;
      }, 1400);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  });
});

function createPlaceholderImage(title, colors, textColor = "#ffffff") {
  const [colorA, colorB, colorC] = colors;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" role="img" aria-label="${title} preview">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${colorA}" />
          <stop offset="55%" stop-color="${colorB}" />
          <stop offset="100%" stop-color="${colorC}" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#bg)" />
      <circle cx="1310" cy="190" r="220" fill="rgba(255,255,255,0.16)" />
      <circle cx="360" cy="820" r="240" fill="rgba(255,255,255,0.1)" />
      <rect x="180" y="150" width="1240" height="700" rx="80" fill="rgba(255,255,255,0.08)" />
      <text x="80" y="140" font-family="Space Grotesk, Arial, sans-serif" font-size="88" font-weight="700" fill="${textColor}">${title}</text>
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const projectSlides = {
  campusbuzz: [
    "./assets/campusbuzz_home.png",
    "./assets/campusbuzz_fairs.png",
    "./assets/campusbuzz_portfolio.png",
  ],
  dijkstra: ["./assets/MazeIMG.png"],
  spotlight: [createPlaceholderImage("Next build", ["#1e293b", "#0f172a", "#08111c"])],
};

const projectStates = new WeakMap();
const projectModal = document.querySelector("[data-project-modal]");
const projectModalDialog = projectModal?.querySelector(".project-modal__dialog");
const projectModalKicker = document.querySelector("[data-project-modal-kicker]");
const projectModalTitle = document.querySelector("[data-project-modal-title]");
const projectModalDescription = document.querySelector("[data-project-modal-description]");
const projectModalUsers = document.querySelector("[data-project-modal-users]");
const projectModalGithub = document.querySelector("[data-project-modal-github]");
const projectModalDemo = document.querySelector("[data-project-modal-demo]");
const projectModalTabs = [...document.querySelectorAll("[data-project-modal-tab]")];
const projectModalPanels = [...document.querySelectorAll("[data-project-modal-panel]")];
let projectModalTrigger = null;

function selectProjectModalTab(tabName) {
  projectModalTabs.forEach((tab) => {
    tab.setAttribute("aria-selected", String(tab.dataset.projectModalTab === tabName));
  });

  projectModalPanels.forEach((panel) => {
    panel.hidden = panel.dataset.projectModalPanel !== tabName;
  });
}

function configureProjectModalAction(action, sourceLink) {
  if (!action) {
    return;
  }

  if (sourceLink) {
    action.href = sourceLink.href;
    action.classList.remove("is-disabled");
    action.removeAttribute("aria-disabled");
    action.removeAttribute("tabindex");
  } else {
    action.removeAttribute("href");
    action.classList.add("is-disabled");
    action.setAttribute("aria-disabled", "true");
    action.setAttribute("tabindex", "-1");
  }
}

function openProjectModal(projectCard, trigger) {
  if (!projectModal || !projectModalKicker || !projectModalTitle || !projectModalDescription || !projectModalUsers) {
    return;
  }

  const overlay = projectCard.querySelector(".project-overlay");
  const actionLinks = [...projectCard.querySelectorAll(".btn-row a")];
  const githubLink = actionLinks.find((link) => link.href.includes("github.com"));
  const demoLink = actionLinks.find((link) => link.textContent.trim().toLowerCase() === "live demo");
  const users = (projectCard.dataset.projectUsers || "People exploring this type of project")
    .split("|")
    .map((user) => user.trim())
    .filter(Boolean);

  projectModalKicker.textContent = overlay?.querySelector(".project-kicker")?.textContent || "Project";
  projectModalTitle.textContent = overlay?.querySelector("h3")?.textContent || "Project details";
  projectModalDescription.textContent = projectCard.dataset.projectModalDescription || "More project details coming soon.";
  projectModalUsers.replaceChildren(...users.map((user) => {
    const item = document.createElement("li");
    item.textContent = user;
    return item;
  }));

  configureProjectModalAction(projectModalGithub, githubLink);
  configureProjectModalAction(projectModalDemo, demoLink);
  selectProjectModalTab("overview");

  projectModalTrigger = trigger;
  projectModal.hidden = false;
  document.body.classList.add("is-modal-open");
  projectModal.querySelector(".project-modal__close")?.focus();
}

function closeProjectModal() {
  if (!projectModal || projectModal.hidden) {
    return;
  }

  projectModal.hidden = true;
  document.body.classList.remove("is-modal-open");
  projectModalTrigger?.focus();
  projectModalTrigger = null;
}

function addProjectExpandButton(projectCard) {
  const buttonRow = projectCard.querySelector(".project-overlay .btn-row");
  if (!buttonRow || buttonRow.querySelector("[data-project-expand]")) {
    return;
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn btn--small btn--expand";
  button.dataset.projectExpand = "";
  button.textContent = "Expand";
  buttonRow.append(button);
}

projectModalTabs.forEach((tab) => {
  tab.addEventListener("click", () => selectProjectModalTab(tab.dataset.projectModalTab));
});

document.addEventListener("click", (event) => {
  const expandButton = event.target.closest("[data-project-expand]");
  if (expandButton) {
    const projectCard = expandButton.closest(".project-card");
    if (projectCard) {
      openProjectModal(projectCard, expandButton);
    }
    return;
  }

  if (event.target.closest("[data-project-modal-close]")) {
    closeProjectModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Tab" || !projectModal || projectModal.hidden || !projectModalDialog) {
    return;
  }

  const focusableElements = [...projectModalDialog.querySelectorAll("button:not([disabled]), a[href]:not([aria-disabled='true'])")];
  const firstElement = focusableElements[0];
  const lastElement = focusableElements.at(-1);

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement?.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement?.focus();
  }
});

function startProjectCarousel(projectCard) {
  const existingState = projectStates.get(projectCard);
  if (existingState?.timerId) {
    return;
  }

  const media = projectCard.querySelector(".project-media");
  const image = projectCard.querySelector(".project-img");
  if (!media || !image) {
    return;
  }

  const originalSource = image.dataset.originalSrc || image.getAttribute("src");
  image.dataset.originalSrc = originalSource;

  const slides = projectSlides[media.dataset.project] || [originalSource];
  if (slides.length < 2) {
    return;
  }

  let currentIndex = Math.max(slides.indexOf(image.getAttribute("src")), 0);
  const state = {
    timerId: null,
    timeoutId: null,
    originalSource,
  };

  const advanceSlide = () => {
    currentIndex = (currentIndex + 1) % slides.length;
    const nextSource = slides[currentIndex];
    const preload = new Image();

    preload.onload = () => {
      image.classList.add("is-fading");
      state.timeoutId = window.setTimeout(() => {
        image.src = nextSource;
        image.classList.remove("is-fading");
      }, 160);
    };

    preload.src = nextSource;
  };

  state.timerId = window.setInterval(advanceSlide, 1800);
  projectStates.set(projectCard, state);
}

function stopProjectCarousel(projectCard) {
  const state = projectStates.get(projectCard);
  if (!state) {
    return;
  }

  if (state.timerId) {
    window.clearInterval(state.timerId);
  }
  if (state.timeoutId) {
    window.clearTimeout(state.timeoutId);
  }

  const image = projectCard.querySelector(".project-img");
  if (image && state.originalSource) {
    image.classList.remove("is-fading");
    image.src = state.originalSource;
  }

  projectStates.delete(projectCard);
}

function initializeProjectCard(projectCard) {
  if (projectCard.dataset.projectInitialized === "true") {
    return;
  }

  projectCard.dataset.projectInitialized = "true";
  addProjectExpandButton(projectCard);
  projectCard.addEventListener("mouseenter", () => startProjectCarousel(projectCard));
  projectCard.addEventListener("mouseleave", () => stopProjectCarousel(projectCard));
  projectCard.addEventListener("focusin", () => startProjectCarousel(projectCard));
  projectCard.addEventListener("focusout", (event) => {
    if (!projectCard.contains(event.relatedTarget)) {
      stopProjectCarousel(projectCard);
    }
  });
}

document.querySelectorAll(".project-card").forEach((projectCard) => {
  initializeProjectCard(projectCard);
});

const projectsGrid = document.querySelector(".projects-grid");
if (projectsGrid) {
  const projectObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) {
          return;
        }

        if (node.matches(".project-card")) {
          initializeProjectCard(node);
        }
        node.querySelectorAll?.(".project-card").forEach(initializeProjectCard);
      });
    });
  });

  projectObserver.observe(projectsGrid, { childList: true, subtree: true });
}

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress, { passive: true });
updateProgress();
