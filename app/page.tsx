"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";

type Key = "social" | "video" | "games" | "study";

type Category = { key: Key; label: string; color: string };

type Results =
  | { empty: true }
  | { empty: false; hours: number; minutes: number; mostUsedApp: string };

// Requirement 1: the four app categories
const CATEGORIES: Category[] = [
  { key: "social", label: "Social media", color: "var(--social)" },
  { key: "video", label: "Video apps", color: "var(--video)" },
  { key: "games", label: "Games", color: "var(--games)" },
  { key: "study", label: "Study apps", color: "var(--study)" },
];

const STEP = 5;
const SLIDER_MAX = 480; // 8 hours; typing in the box can go higher

const toMinutes = (value: string): number => {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export default function Home() {
  const [inputs, setInputs] = useState<Record<Key, string>>({
    social: "",
    video: "",
    games: "",
    study: "",
  });
  const [results, setResults] = useState<Results | null>(null);

  // Hint 2: dictionary of category name -> minutes
  const appTimes: Record<string, number> = Object.fromEntries(
    CATEGORIES.map((c) => [c.label, toMinutes(inputs[c.key])])
  );

  // Live total, only for the preview bar while the user types
  const liveTotal = Object.values(appTimes).reduce((a, b) => a + b, 0);
  const liveHours = Math.floor(liveTotal / 60);
  const liveMins = liveTotal % 60;

  const update = (key: Key, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
    setResults(null); // results go stale once an input changes
  };

  const nudge = (key: Key, delta: number) => {
    update(key, String(Math.max(0, toMinutes(inputs[key]) + delta)));
  };

  // Requirements 2 to 5, run when the button is clicked
  const calculate = () => {
    // Hint 3: sum of all minutes
    const totalMinutes = Object.values(appTimes).reduce((a, b) => a + b, 0);

    // Requirement 5 / Hint 6: nothing entered
    if (totalMinutes === 0) {
      setResults({ empty: true });
      return;
    }

    // Hint 4: category with the most minutes
    const mostUsedApp = Object.keys(appTimes).reduce((best, name) =>
      appTimes[name] > appTimes[best] ? name : best
    );

    // Hint 5: hours and minutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    setResults({ empty: false, hours, minutes, mostUsedApp });
  };

  const reset = () => {
    setInputs({ social: "", video: "", games: "", study: "" });
    setResults(null);
  };

  const mostUsedColor =
    results && !results.empty
      ? CATEGORIES.find((c) => c.label === results.mostUsedApp)?.color
      : undefined;

  return (
    <main className="page">
      <header className="head">
        <h1>Screen Time Calculator</h1>
        <p>Enter how many minutes you spent on each app today.</p>
      </header>

      <div className="layout">
        {/* ---------- Inputs ---------- */}
        <section className="panel" aria-label="Minutes per app category">
          <ul className="fields">
            {CATEGORIES.map((c) => {
              const minutes = appTimes[c.label];
              return (
                <li className="field" key={c.key}>
                  <label htmlFor={c.key}>
                    <span className="dot" style={{ background: c.color }} />
                    {c.label} (minutes)
                  </label>

                  <div className="stepper">
                    <button
                      type="button"
                      onClick={() => nudge(c.key, -STEP)}
                      aria-label={`Remove ${STEP} minutes from ${c.label}`}
                    >
                      −
                    </button>
                    <input
                      id={c.key}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={STEP}
                      placeholder="0"
                      value={inputs[c.key]}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        update(c.key, e.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => nudge(c.key, STEP)}
                      aria-label={`Add ${STEP} minutes to ${c.label}`}
                    >
                      +
                    </button>
                  </div>

                  <input
                    className="slider"
                    type="range"
                    min={0}
                    max={SLIDER_MAX}
                    step={STEP}
                    value={Math.min(minutes, SLIDER_MAX)}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      update(c.key, e.target.value)
                    }
                    style={{ accentColor: c.color }}
                    aria-label={`${c.label} slider`}
                  />
                </li>
              );
            })}
          </ul>

          <div className="actions">
            <button type="button" className="primary" onClick={calculate}>
              Calculate screen time
            </button>
            <button type="button" className="ghost" onClick={reset}>
              Clear all
            </button>
          </div>
        </section>

        {/* ---------- Live bar + results ---------- */}
        <aside className="panel side" aria-live="polite">
          <div className="live-head">
            <h2>Your day so far</h2>
            <span className="live-total">
              {liveHours}h {liveMins}m
            </span>
          </div>

          <div
            className="bar"
            role="img"
            aria-label={
              liveTotal === 0
                ? "No minutes entered yet"
                : CATEGORIES.map(
                    (c) => `${c.label}: ${appTimes[c.label]} minutes`
                  ).join(", ")
            }
          >
            {CATEGORIES.map((c) => (
              <span
                key={c.key}
                className="seg"
                style={{
                  width: liveTotal
                    ? `${(appTimes[c.label] / liveTotal) * 100}%`
                    : "0%",
                  background: c.color,
                }}
              />
            ))}
          </div>

          <ul className="legend">
            {CATEGORIES.map((c) => {
              const pct = liveTotal
                ? Math.round((appTimes[c.label] / liveTotal) * 100)
                : 0;
              return (
                <li key={c.key}>
                  <span className="dot" style={{ background: c.color }} />
                  <span className="name">{c.label}</span>
                  <span className="num">
                    {appTimes[c.label]} min · {pct}%
                  </span>
                </li>
              );
            })}
          </ul>

          <h2 className="results-title">Your results</h2>

          {results === null && (
            <p className="hint">
              Select “Calculate screen time” to see your totals.
            </p>
          )}

          {results?.empty && (
            <div className="notice info" role="status">
              <span className="icon" aria-hidden="true">
                i
              </span>
              Enter some screen time to see your most-used app.
            </div>
          )}

          {results && !results.empty && (
            <div
              className="notice success"
              role="status"
              key={`${results.hours}-${results.minutes}-${results.mostUsedApp}`}
            >
              <p className="big">
                {results.hours}
                <small>hr</small> {results.minutes}
                <small>min</small>
              </p>
              <p>
                <strong>Total screen time:</strong> {results.hours} hour(s) and{" "}
                {results.minutes} minute(s)
              </p>
              <p>
                <strong>Most-used app category:</strong>{" "}
                <span className="chip">
                  <span className="dot" style={{ background: mostUsedColor }} />
                  {results.mostUsedApp}
                </span>
              </p>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}