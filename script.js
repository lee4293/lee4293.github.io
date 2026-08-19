const mobileDrawer = document.querySelector("[data-mobile-drawer]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const progressBar = document.querySelector(".scroll-progress__bar");
const scrollTopButton = document.querySelector("[data-scroll-top]");
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

  if (scrollTopButton) {
    scrollTopButton.classList.toggle("is-visible", window.scrollY > 400);
  }
}

function updateActiveSection(currentId) {
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
  }
});

if (scrollTopButton) {
  scrollTopButton.addEventListener("click", () => scrollToSection("#home"));
}

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

document.querySelectorAll(".project-card").forEach((projectCard) => {
  projectCard.addEventListener("mouseenter", () => startProjectCarousel(projectCard));
  projectCard.addEventListener("mouseleave", () => stopProjectCarousel(projectCard));
  projectCard.addEventListener("focusin", () => startProjectCarousel(projectCard));
  projectCard.addEventListener("focusout", (event) => {
    if (!projectCard.contains(event.relatedTarget)) {
      stopProjectCarousel(projectCard);
    }
  });
});

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress, { passive: true });
updateProgress();