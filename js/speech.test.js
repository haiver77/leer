// speech.test.js — pure unit tests for Spanish-voice selection (iteration 5,
// D2 / AC-I2.1). pickSpanishVoice + hasSpanishVoice take plain voice objects and
// use no browser globals, so they run in Node.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  pickSpanishVoice,
  hasSpanishVoice,
  voiceId,
  resolveVoice,
  availableVoices,
  setPreferredVoice,
  getPreferredVoice,
} from "./speech.js";

const v = (lang, name = "", extra = {}) => ({ lang, name, ...extra });

test("pickSpanishVoice prefers es-ES over es-MX and en-US", () => {
  const voices = [v("en-US", "Alex"), v("es-MX", "Paulina"), v("es-ES", "Mónica")];
  assert.equal(pickSpanishVoice(voices).lang, "es-ES");
});

test("pickSpanishVoice follows the full preference order es-ES > es-MX > es-US > es-419", () => {
  assert.equal(pickSpanishVoice([v("es-419"), v("es-US"), v("es-MX")]).lang, "es-MX");
  assert.equal(pickSpanishVoice([v("es-419"), v("es-US")]).lang, "es-US");
  assert.equal(pickSpanishVoice([v("es-419"), v("en-GB")]).lang, "es-419");
});

test("pickSpanishVoice picks any es-* when no exact regional match (case/-/_ insensitive)", () => {
  assert.equal(pickSpanishVoice([v("en-US"), v("es_AR", "Diego")]).lang, "es_AR");
  assert.equal(pickSpanishVoice([v("EN"), v("ES")]).lang, "ES");
  assert.equal(pickSpanishVoice([v("fr-FR"), v("es-CO")]).lang, "es-CO");
});

test("pickSpanishVoice name-matches Spanish / español when lang is not es-*", () => {
  assert.equal(pickSpanishVoice([v("en-US", "Spanish (Latin America)")]).name, "Spanish (Latin America)");
  assert.equal(pickSpanishVoice([v("und", "Voz en Español")]).name, "Voz en Español");
});

test("pickSpanishVoice returns null when no Spanish voice exists", () => {
  assert.equal(pickSpanishVoice([v("en-US", "Alex"), v("fr-FR", "Thomas")]), null);
  assert.equal(pickSpanishVoice([]), null);
  assert.equal(pickSpanishVoice(null), null);
  assert.equal(pickSpanishVoice(undefined), null);
});

test("pickSpanishVoice: lang match beats a name-only match", () => {
  const voices = [v("en-US", "Spanish helper"), v("es-MX", "Paulina")];
  assert.equal(pickSpanishVoice(voices).lang, "es-MX");
});

test("pickSpanishVoice: localService preferred as a tiebreak within the same bucket", () => {
  const remote = v("es-ES", "Remote", { localService: false });
  const local = v("es-ES", "Local", { localService: true });
  assert.equal(pickSpanishVoice([remote, local]).name, "Local");
  // default also breaks a tie when neither is local
  const plain = v("es-ES", "Plain");
  const def = v("es-ES", "Default", { default: true });
  assert.equal(pickSpanishVoice([plain, def]).name, "Default");
});

test("pickSpanishVoice: tiebreak never overrides a better language bucket", () => {
  const localMX = v("es-MX", "LocalMX", { localService: true });
  const remoteES = v("es-ES", "RemoteES", { localService: false });
  // es-ES (bucket 0) wins even though es-MX is local
  assert.equal(pickSpanishVoice([localMX, remoteES]).lang, "es-ES");
});

test("hasSpanishVoice reflects presence of any Spanish voice", () => {
  assert.equal(hasSpanishVoice([v("es-ES")]), true);
  assert.equal(hasSpanishVoice([v("en-US", "español helper")]), true);
  assert.equal(hasSpanishVoice([v("es_AR")]), true);
  assert.equal(hasSpanishVoice([v("en-US"), v("fr-FR")]), false);
  assert.equal(hasSpanishVoice([]), false);
  assert.equal(hasSpanishVoice(null), false);
});

// ===========================================================================
// Iteration 7 — voice picker helpers (D3 / AC-K3): voiceId, resolveVoice,
// availableVoices, setPreferredVoice/getPreferredVoice. All pure/Node-safe.
// ===========================================================================

test("voiceId prefers voiceURI, else name|lang (stable)", () => {
  assert.equal(voiceId({ voiceURI: "urn:voice:paulina", name: "Paulina", lang: "es-MX" }), "urn:voice:paulina");
  assert.equal(voiceId({ name: "Mónica", lang: "es-ES" }), "Mónica|es-ES");
  assert.equal(voiceId({ name: "", lang: "" }), "|");
  assert.equal(voiceId(null), "");
  // same voice → same id (stability)
  const a = { name: "Jorge", lang: "es-ES" };
  assert.equal(voiceId(a), voiceId({ ...a }));
});

test("resolveVoice: preferred-present returns the chosen voice (AC-K3.4)", () => {
  const monica = v("es-ES", "Mónica");
  const paulina = v("es-MX", "Paulina");
  const voices = [monica, paulina];
  // choose Paulina by its id even though Mónica (es-ES) is the auto-pick
  assert.equal(resolveVoice(voices, voiceId(paulina)).name, "Paulina");
});

test("resolveVoice: preferred-absent falls back to the Spanish auto-pick (AC-K3.4)", () => {
  const voices = [v("en-US", "Alex"), v("es-ES", "Mónica")];
  assert.equal(resolveVoice(voices, "urn:voice:not-installed").lang, "es-ES");
});

test("resolveVoice: no voices (or none Spanish, no preferred) → null", () => {
  assert.equal(resolveVoice([], "anything"), null);
  assert.equal(resolveVoice(null, "anything"), null);
  assert.equal(resolveVoice([v("en-US", "Alex")], null), null);
});

test("resolveVoice: null preferred → Spanish auto-pick", () => {
  const voices = [v("es-MX", "Paulina"), v("es-ES", "Mónica")];
  assert.equal(resolveVoice(voices, null).lang, "es-ES");
});

test("setPreferredVoice / getPreferredVoice round-trip (null = Automática)", () => {
  setPreferredVoice("urn:voice:paulina");
  assert.equal(getPreferredVoice(), "urn:voice:paulina");
  setPreferredVoice("");
  assert.equal(getPreferredVoice(), null);
  setPreferredVoice(null);
  assert.equal(getPreferredVoice(), null);
});

test("availableVoices returns [] under Node (no synthesis) and never throws", () => {
  const list = availableVoices();
  assert.ok(Array.isArray(list));
  assert.equal(list.length, 0);
});
