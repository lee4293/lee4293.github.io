/*
  Project data — the only file you need to edit to add, remove, feature, or reorder projects.

  Fields
    id           unique slug, used for element ids
    title        project name
    kicker       short category line shown above the title
    summary      one or two sentences shown on the page
    description  longer overview shown in the details dialog
    role         optional, e.g. "Solo developer". Hidden when empty.
    stack        optional list of technologies. Hidden when empty.
    users        who the project is for (details dialog, "Users" tab)
    images       first image is the cover; all images appear in the details gallery
    links        buttons; url may be external or an on-page anchor like "#contact"
    tags         optional list of short labels. Hidden when empty.
    status       "live" or "in-progress"
    featured     true = large treatment at the top of the section
    order        lower numbers appear first (within featured and within the rest)
*/
window.PROJECTS = [
  {
    id: "nuveri",
    title: "Nuveri",
    kicker: "Research intelligence",
    summary: "Scientific trust and evidence analysis platform for understanding what a study really shows.",
    description:
      "Nuveri is a reading and research-trust platform built to help people verify scientific claims quickly and confidently. It turns primary research papers into plain-language summaries, surfaces confidence scores and reasoning, and flags issues like retractions, funding conflicts, and weak study design before a user trusts the claim. The product blends a personalized research feed with tools for citation generation, concept lookup, and fast interpretation of scientific evidence.",
    role: "",
    stack: [],
    users: ["Researchers", "Students", "Journalists", "Science communicators", "Healthcare professionals"],
    images: [
      { src: "./assets/NuveriAnalysisPage.png", alt: "Nuveri study details page showing a plain-language summary and a confidence score of 73 out of 100", width: 1229, height: 874 },
      { src: "./assets/NuveriDashboardPage.png", alt: "Nuveri dashboard listing recent studies with confidence scores", width: 1287, height: 960 },
      { src: "./assets/optimized/nuveri-logo.jpg", alt: "Nuveri logo", width: 900, height: 900 },
    ],
    links: [{ label: "Website", url: "https://www.nuveri.app/" }],
    tags: [],
    status: "live",
    featured: true,
    order: 1,
  },
  {
    id: "campusbuzz",
    title: "CampusBuzz",
    kicker: "Featured product",
    summary: "A campus discovery platform built to surface events, fairs, and portfolio-style content.",
    description:
      "CampusBuzz is a campus discovery platform designed to help students learn more about the companies at career fairs while giving corporate representatives a focused way to present opportunities and connect with attendees. Students can leave reviews and feedback on the companies they interact with, including but not limited to wait time, engagement quality, and overall experience with CampusBuzz.",
    role: "",
    stack: [],
    users: ["Students", "Career fair corporate representatives", "Campus event organizers"],
    images: [
      { src: "./assets/campusbuzz_home.png", alt: "CampusBuzz home page with the headline “Your Guide to Career Fair Success”", width: 1913, height: 958 },
      { src: "./assets/campusbuzz_fairs.png", alt: "CampusBuzz career fairs page with search filters and an upcoming fair listing", width: 990, height: 906 },
      { src: "./assets/campusbuzz_portfolio.png", alt: "CampusBuzz company profile with AI sentiment analysis and a review summary", width: 773, height: 929 },
    ],
    links: [
      { label: "GitHub", url: "https://github.com/lee4293/campusbuzz" },
      { label: "Live Demo", url: "https://campusbuzz.live/" },
    ],
    tags: [],
    status: "live",
    featured: true,
    order: 2,
  },
  {
    id: "pathlab",
    title: "PathLab",
    kicker: "Algorithms showcase",
    summary: "Interactive shortest-path visualizer that demonstrates algorithm behavior step by step.",
    description:
      "PathLab is an interactive shortest-path visualizer that makes route-finding algorithms easier to teach and study by showing their behavior step by step on a grid.",
    role: "",
    stack: [],
    users: ["Teachers", "Students", "Computer science learners"],
    images: [
      { src: "./assets/pathlab.png", alt: "PathLab grid with an A* path found between start and target cells", width: 1525, height: 886 },
      { src: "./assets/MazeIMG.png", alt: "Maze with a dotted shortest path from the green start to the blue goal", width: 740, height: 740 },
    ],
    links: [
      { label: "GitHub", url: "https://github.com/lee4293/pathlab" },
      { label: "Live Demo", url: "https://youtu.be/O4fcV65Au0U" },
    ],
    tags: [],
    status: "live",
    featured: false,
    order: 3,
  },
  {
    id: "seam",
    title: "Next build",
    kicker: "In progress",
    summary: "A future project slot reserved for my next project, Seam. Ask about it by connecting with me.",
    description:
      "Seam is currently in development. This project space will be updated with a complete overview, technical details, and working links as the product becomes ready to share.",
    role: "",
    stack: [],
    users: ["Early adopters", "Product collaborators", "Recruiters and engineering teams"],
    images: [],
    links: [{ label: "Ask about it", url: "#contact" }],
    tags: [],
    status: "in-progress",
    featured: false,
    order: 4,
  },
];
