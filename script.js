function toggleMenu() {
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");
    menu.classList.toggle("open");
    icon.classList.toggle("open");
  }

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
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="26" flood-color="#000000" flood-opacity="0.18" />
        </filter>
      </defs>
      <rect width="1600" height="1000" fill="url(#bg)" />
      <circle cx="1310" cy="190" r="220" fill="rgba(255,255,255,0.16)" />
      <circle cx="360" cy="820" r="240" fill="rgba(255,255,255,0.1)" />
      <rect x="180" y="150" width="1240" height="700" rx="80" fill="rgba(255,255,255,0.08)" />
      <text x="80" y="140" font-family="Poppins, Arial, sans-serif" font-size="88" font-weight="700" fill="${textColor}" filter="url(#softShadow)">${title}</text>
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const projectSlides = {
  campusbuzz: [
    "./assets/campusbuzz_home.png",
    "./assets/campusbuzz_fairs.png",
    "./assets/campusbuzz_portfolio.png",
  ],
  dijkstra: [
    "./assets/MazeIMG.png",
  ],
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
      }, 180);
    };

    preload.src = nextSource;
  };

  state.timerId = window.setInterval(advanceSlide, 1500);
  projectStates.set(projectCard, state);
}

function stopProjectCarousel(projectCard) {
  const state = projectStates.get(projectCard);
  if (state) {
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