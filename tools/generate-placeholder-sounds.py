from __future__ import annotations

import math
import struct
import wave
from pathlib import Path

SAMPLE_RATE = 44100
CUES = {
    "basic": {
        "digit": [{"frequency": 560, "duration": 0.09, "type": "sine", "gain": 0.18}],
        "enter": [{"frequency": 720, "duration": 0.16, "type": "sine", "gain": 0.2}],
        "cancel": [{"frequency": 220, "duration": 0.14, "type": "square", "gain": 0.12}],
        "start": [{"frequency": 640, "duration": 0.13, "type": "triangle", "gain": 0.16}],
        "mist": [{"frequency": 840, "duration": 0.1, "type": "sine", "gain": 0.13}],
        "scan": [{"frequency": 440, "duration": 0.12, "type": "sine", "gain": 0.15}],
        "dock": [{"frequency": 300, "duration": 0.15, "type": "triangle", "gain": 0.16}],
    },
    "functional": {
        "digit": [
            {"frequency": 510, "duration": 0.045, "type": "triangle", "gain": 0.12},
            {"frequency": 770, "duration": 0.08, "type": "sine", "gain": 0.08, "delay": 0.035},
        ],
        "enter": [
            {"frequency": 520, "duration": 0.08, "type": "triangle", "gain": 0.14},
            {"frequency": 780, "duration": 0.12, "type": "sine", "gain": 0.12, "delay": 0.055},
            {"frequency": 1040, "duration": 0.16, "type": "sine", "gain": 0.09, "delay": 0.11},
        ],
        "cancel": [
            {"frequency": 420, "duration": 0.08, "type": "triangle", "gain": 0.13},
            {"frequency": 260, "duration": 0.14, "type": "sine", "gain": 0.12, "delay": 0.06},
        ],
        "start": [
            {"frequency": 180, "duration": 0.18, "type": "sawtooth", "gain": 0.08},
            {"frequency": 620, "duration": 0.18, "type": "triangle", "gain": 0.12, "delay": 0.09},
            {"frequency": 930, "duration": 0.2, "type": "sine", "gain": 0.08, "delay": 0.18},
        ],
        "mist": [
            {"frequency": 1100, "duration": 0.07, "type": "sine", "gain": 0.09},
            {"frequency": 1320, "duration": 0.08, "type": "sine", "gain": 0.07, "delay": 0.045},
            {"frequency": 1580, "duration": 0.11, "type": "sine", "gain": 0.05, "delay": 0.09},
        ],
        "scan": [
            {"frequency": 360, "duration": 0.08, "type": "triangle", "gain": 0.1},
            {"frequency": 540, "duration": 0.08, "type": "triangle", "gain": 0.09, "delay": 0.07},
            {"frequency": 720, "duration": 0.08, "type": "triangle", "gain": 0.08, "delay": 0.14},
        ],
        "dock": [
            {"frequency": 620, "duration": 0.08, "type": "triangle", "gain": 0.1},
            {"frequency": 420, "duration": 0.11, "type": "sine", "gain": 0.11, "delay": 0.07},
            {"frequency": 260, "duration": 0.16, "type": "sine", "gain": 0.1, "delay": 0.15},
        ],
    },
}


def oscillator(kind: str, phase: float) -> float:
    if kind == "sine":
        return math.sin(phase)
    cycle = (phase / (2 * math.pi)) % 1
    if kind == "square":
        return 1 if cycle < 0.5 else -1
    if kind == "triangle":
        return 4 * abs(cycle - 0.5) - 1
    if kind == "sawtooth":
        return 2 * cycle - 1
    raise ValueError(f"Unknown oscillator type: {kind}")


def envelope(position: float, duration: float, gain: float) -> float:
    attack = min(0.012, duration * 0.35)
    if position < attack:
        return gain * (position / attack)
    fade = max(duration - attack, 0.001)
    return gain * max(0, 1 - ((position - attack) / fade)) ** 2


def render(notes: list[dict[str, float | str]]) -> bytes:
    length = max((note.get("delay", 0) + note["duration"] for note in notes), default=0) + 0.05
    sample_count = int(length * SAMPLE_RATE)
    samples = [0.0] * sample_count

    for note in notes:
        delay = float(note.get("delay", 0))
        duration = float(note["duration"])
        frequency = float(note["frequency"])
        kind = str(note["type"])
        gain = float(note["gain"])
        start = int(delay * SAMPLE_RATE)
        end = min(sample_count, start + int(duration * SAMPLE_RATE))

        for index in range(start, end):
            position = (index - start) / SAMPLE_RATE
            phase = 2 * math.pi * frequency * position
            samples[index] += oscillator(kind, phase) * envelope(position, duration, gain)

    peak = max(max(samples, default=0), abs(min(samples, default=0)), 1)
    if peak > 0.98:
        samples = [(sample / peak) * 0.98 for sample in samples]

    return b"".join(struct.pack("<h", int(max(-1, min(1, sample)) * 32767)) for sample in samples)


def write_wav(path: Path, pcm: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        wav.writeframes(pcm)


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    for sound_set, cues in CUES.items():
        for cue, notes in cues.items():
            write_wav(root / "sounds" / sound_set / f"{cue}.wav", render(notes))


if __name__ == "__main__":
    main()
