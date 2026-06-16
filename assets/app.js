const SOUND_SETS = {
  basic: {
    label: "Basic sound set",
    description: "Short, neutral tones with very little product personality.",
    theme: "basic",
    sounds: {
      digit: [{ frequency: 560, duration: 0.09, type: "sine", gain: 0.18 }],
      enter: [{ frequency: 720, duration: 0.16, type: "sine", gain: 0.2 }],
      cancel: [{ frequency: 220, duration: 0.14, type: "square", gain: 0.12 }],
      start: [{ frequency: 640, duration: 0.13, type: "triangle", gain: 0.16 }],
      mist: [{ frequency: 840, duration: 0.1, type: "sine", gain: 0.13 }],
      scan: [{ frequency: 440, duration: 0.12, type: "sine", gain: 0.15 }],
      dock: [{ frequency: 300, duration: 0.15, type: "triangle", gain: 0.16 }]
    }
  },
  functional: {
    label: "Functional sound set",
    description: "Layered cues that imply lift, water, confirmation, and recovery.",
    theme: "functional",
    sounds: {
      digit: [
        { frequency: 510, duration: 0.045, type: "triangle", gain: 0.12 },
        { frequency: 770, duration: 0.08, type: "sine", gain: 0.08, delay: 0.035 }
      ],
      enter: [
        { frequency: 520, duration: 0.08, type: "triangle", gain: 0.14 },
        { frequency: 780, duration: 0.12, type: "sine", gain: 0.12, delay: 0.055 },
        { frequency: 1040, duration: 0.16, type: "sine", gain: 0.09, delay: 0.11 }
      ],
      cancel: [
        { frequency: 420, duration: 0.08, type: "triangle", gain: 0.13 },
        { frequency: 260, duration: 0.14, type: "sine", gain: 0.12, delay: 0.06 }
      ],
      start: [
        { frequency: 180, duration: 0.18, type: "sawtooth", gain: 0.08 },
        { frequency: 620, duration: 0.18, type: "triangle", gain: 0.12, delay: 0.09 },
        { frequency: 930, duration: 0.2, type: "sine", gain: 0.08, delay: 0.18 }
      ],
      mist: [
        { frequency: 1100, duration: 0.07, type: "sine", gain: 0.09 },
        { frequency: 1320, duration: 0.08, type: "sine", gain: 0.07, delay: 0.045 },
        { frequency: 1580, duration: 0.11, type: "sine", gain: 0.05, delay: 0.09 }
      ],
      scan: [
        { frequency: 360, duration: 0.08, type: "triangle", gain: 0.1 },
        { frequency: 540, duration: 0.08, type: "triangle", gain: 0.09, delay: 0.07 },
        { frequency: 720, duration: 0.08, type: "triangle", gain: 0.08, delay: 0.14 }
      ],
      dock: [
        { frequency: 620, duration: 0.08, type: "triangle", gain: 0.1 },
        { frequency: 420, duration: 0.11, type: "sine", gain: 0.11, delay: 0.07 },
        { frequency: 260, duration: 0.16, type: "sine", gain: 0.1, delay: 0.15 }
      ]
    }
  }
};

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

let audioContext;

function getSet() {
  const setName = document.body.dataset.soundSet || "basic";
  return SOUND_SETS[setName] || SOUND_SETS.basic;
}

function ensureAudio() {
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  audioContext ||= new AudioEngine();
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

function playCue(cueName) {
  const context = ensureAudio();
  const soundSet = getSet();
  const notes = soundSet.sounds[cueName] || soundSet.sounds.digit;
  const now = context.currentTime;

  notes.forEach((note) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = now + (note.delay || 0);
    const end = start + note.duration;

    oscillator.type = note.type;
    oscillator.frequency.setValueAtTime(note.frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(note.gain, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(end + 0.03);
  });
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
