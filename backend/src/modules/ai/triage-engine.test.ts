import { describe, expect, it } from "vitest";
import { analyzeSymptoms, preprocessSymptoms } from "./triage-engine";

describe("triage engine", () => {
  it("normalizes duplicate symptom aliases", () => {
    expect(preprocessSymptoms(["High Fever", " high temperature ", "HEADACHE"])).toEqual([
      "fever",
      "headache"
    ]);
  });

  it("escalates emergency symptoms immediately", () => {
    const result = analyzeSymptoms(["chest pain", "dizziness"]);
    expect(result.triageLevel).toBe("EMERGENCY");
    expect(result.emergencyFlag).toBe(true);
    expect(result.confidenceBand).toBe("HIGH");
  });

  it("classifies common campus illnesses with an explanation", () => {
    const result = analyzeSymptoms(["fever", "chills", "headache", "fatigue"]);
    expect(result.condition).toContain("malaria");
    expect(result.explanation.length).toBeGreaterThan(20);
    expect(["MEDIUM", "HIGH"]).toContain(result.confidenceBand);
  });

  it("keeps mild upper respiratory patterns out of the emergency path", () => {
    const result = analyzeSymptoms(["runny nose", "sore throat", "sneezing"]);
    expect(result.triageLevel).toBe("MILD");
    expect(result.emergencyFlag).toBe(false);
  });

  it("separates moderate dehydration-style illness from mild discomfort", () => {
    const result = analyzeSymptoms(["vomiting", "dizziness", "weakness"]);
    expect(result.triageLevel).toBe("MODERATE");
    expect(result.condition).toContain("dehydration");
  });
});
