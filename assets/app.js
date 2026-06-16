const SOUND_SETS = {
  basic: {
    label: "Basic sound set",
    description: "Short, neutral tones with very little product personality.",
    theme: "basic",
    folder: "basic"
  },
  functional: {
    label: "Functional sound set",
    description: "Layered cues that imply lift, water, confirmation, and recovery.",
    theme: "functional",
    folder: "functional"
  }
};

const CUES = ["digit", "enter", "cancel", "start", "mist", "scan", "dock"];

const KEYPAD = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["Cancel", "0", "Enter"]
];

const ACTIONS = [
  { label: "Start", key: "start" },
  { label: "Mist", key: "mist" },
  { label: "Scan", key: "scan" },
  { label: "Dock", key: "dock" }
];

const audioCache = new Map();

function getSet() {
  const setName = document.body.dataset.soundSet || "basic";
  return SOUND_SETS[setName] || SOUND_SETS.basic;
}

function cuePath(cueName) {
  const soundSet = getSet();
  const safeCue = CUES.includes(cueName) ? cueName : "digit";
  return `../sounds/${soundSet.folder}/${safeCue}.wav`;
}

function preloadSounds() {
  const soundSet = getSet();
  CUES.forEach((cue) => {
    const key = `${soundSet.folder}:${cue}`;
    if (audioCache.has(key)) return;

    const audio = new Audio(cuePath(cue));
    audio.preload = "auto";
    audioCache.set(key, audio);
  });
}

function playCue(cueName) {
  const soundSet = getSet();
  const safeCue = CUES.includes(cueName) ? cueName : "digit";
  const cachedAudio = audioCache.get(`${soundSet.folder}:${safeCue}`);
  const audio = cachedAudio ? cachedAudio.cloneNode(true) : new Audio(cuePath(safeCue));
  audio.play().catch(() => {});
}

function handleKey(label) {
  if (/^\d$/.test(label)) {
    playCue("digit");
    return;
  }

  if (label === "Cancel") {
    playCue("cancel");
    return;
  }

  playCue("enter");
}

function render() {
  const soundSet = getSet();
  const app = document.querySelector("#app");
  preloadSounds();

  app.innerHTML = `
    <section class="demo-shell ${soundSet.theme}">
      <section class="controller" aria-label="${soundSet.label}">
        <div class="product-panel">
          <p class="eyebrow">${soundSet.label}</p>
          <h1>Petal Pal</h1>
          <p>${soundSet.description}</p>
        </div>

        <div class="keypad" aria-label="Petal Pal keypad">
          ${KEYPAD.flat().map((key) => `
            <button class="key ${key.toLowerCase()}" type="button" data-key="${key}">
              ${key}
            </button>
          `).join("")}
        </div>

        <div class="action-grid" aria-label="Drone actions">
          ${ACTIONS.map((action) => `
            <button class="action-button" type="button" data-action="${action.key}">
              ${action.label}
            </button>
          `).join("")}
        </div>
      </section>
    </section>
  `;

  document.querySelectorAll("[data-key]").forEach((button) => {
    button.addEventListener("click", () => handleKey(button.dataset.key));
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      playCue(button.dataset.action);
    });
  });
}

render();
