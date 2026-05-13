export const TRIAGE_ENGINE_VERSION = "2.0.0";

export type EngineTriageLevel = "MILD" | "MODERATE" | "EMERGENCY";
export type ConfidenceBand = "LOW" | "MEDIUM" | "HIGH";

export interface TriageAssessmentResult {
  condition: string;
  triageLevel: EngineTriageLevel;
  confidence: number;
  confidenceBand: ConfidenceBand;
  matchedSignals: string[];
  explanation: string;
  recommendation: string;
  emergencyFlag: boolean;
  engineVersion: string;
}

interface RuleDefinition {
  name: string;
  symptoms: string[];
  optionalSymptoms: string[];
  condition: string;
  triageLevel: EngineTriageLevel;
  medicalFocus: string;
  explanation: string;
  recommendation: string;
}

const symptomAliases: Record<string, string> = {
  "high temperature": "fever",
  "high fever": "fever",
  "running nose": "runny nose",
  "short of breath": "shortness of breath",
  "difficulty breathing": "shortness of breath",
  "chest tightness": "chest pain",
  "tummy pain": "stomach pain",
  "abdominal pain": "stomach pain",
  "throwing up": "vomiting",
  "body pain": "body aches",
  "lightheadedness": "dizziness",
  "hot body": "fever",
  "loss of appetite": "poor appetite",
  "can not breathe": "shortness of breath",
  "cant breathe": "shortness of breath",
  "difficulty swallowing": "throat swelling",
  "passed out": "unconsciousness",
  "fainted": "unconsciousness",
  "heart racing": "rapid heartbeat",
  "stooling": "diarrhea"
};

const hardEmergencySignals = new Set([
  "chest pain",
  "shortness of breath",
  "severe bleeding",
  "unconsciousness",
  "seizure",
  "throat swelling"
]);

const softEmergencySignals = new Set([
  "confusion",
  "rapid heartbeat",
  "severe headache",
  "stiff neck"
]);

const emergencyCombinations = [
  ["rash", "shortness of breath"],
  ["swelling", "shortness of breath"],
  ["fever", "confusion"],
  ["severe headache", "stiff neck"],
  ["vomiting", "diarrhea", "dizziness"],
  ["chest pain", "sweating"]
];

const symptomWeights: Record<string, number> = {
  fever: 2,
  chills: 2,
  headache: 1,
  "severe headache": 3,
  vomiting: 2,
  diarrhea: 2,
  "stomach pain": 2,
  cough: 1,
  fatigue: 1,
  "body aches": 1,
  "shortness of breath": 4,
  "chest pain": 4,
  confusion: 4,
  dizziness: 2,
  sweating: 1,
  rash: 1,
  swelling: 2,
  wheezing: 3,
  "sore throat": 1,
  "runny nose": 1,
  sneezing: 1,
  "poor appetite": 1,
  weakness: 2,
  "rapid heartbeat": 3,
  "stiff neck": 3,
  "throat swelling": 4,
  dehydration: 2,
  itching: 1
};

const rules: RuleDefinition[] = [
  {
    name: "Malaria Pattern",
    symptoms: ["fever", "chills", "headache"],
    optionalSymptoms: ["fatigue", "body aches", "vomiting"],
    condition: "Possible malaria",
    triageLevel: "MODERATE",
    medicalFocus: "febrile infectious illness",
    explanation:
      "Fever, chills, and headache form a malaria-like febrile cluster, especially when accompanied by fatigue, vomiting, or generalized body pain.",
    recommendation:
      "Visit the campus clinic within 24 to 48 hours for testing, hydration support, and clinician review."
  },
  {
    name: "Severe Malaria Pattern",
    symptoms: ["fever", "chills", "vomiting"],
    optionalSymptoms: ["confusion", "weakness", "dizziness"],
    condition: "Possible severe malaria",
    triageLevel: "EMERGENCY",
    medicalFocus: "high-risk infectious illness",
    explanation:
      "Fever with chills and repeated vomiting can indicate a more severe malaria presentation, particularly when weakness, confusion, or dizziness are also present.",
    recommendation:
      "Seek urgent clinical review immediately because the symptom pattern suggests a potentially high-risk infectious illness."
  },
  {
    name: "Typhoid Pattern",
    symptoms: ["fever", "stomach pain", "headache"],
    optionalSymptoms: ["diarrhea", "vomiting", "fatigue", "poor appetite"],
    condition: "Possible typhoid fever",
    triageLevel: "MODERATE",
    medicalFocus: "systemic gastrointestinal infection",
    explanation:
      "Persistent fever with abdominal discomfort and headache fits a typhoid-like systemic gastrointestinal infection pattern.",
    recommendation:
      "Book a clinic visit soon for assessment, hydration advice, and medical review."
  },
  {
    name: "Respiratory Infection Pattern",
    symptoms: ["fever", "cough", "fatigue"],
    optionalSymptoms: ["sore throat", "runny nose", "body aches"],
    condition: "Possible viral respiratory illness",
    triageLevel: "MODERATE",
    medicalFocus: "acute respiratory infection",
    explanation:
      "This symptom combination points to an acute respiratory infection, especially when fever is paired with cough and low energy.",
    recommendation:
      "Rest, hydrate, and schedule a clinic visit if symptoms continue or worsen."
  },
  {
    name: "Mild Cold Pattern",
    symptoms: ["runny nose", "sore throat"],
    optionalSymptoms: ["sneezing", "cough", "headache"],
    condition: "Possible common cold",
    triageLevel: "MILD",
    medicalFocus: "upper respiratory irritation",
    explanation:
      "Runny nose and sore throat with mild upper-airway symptoms are commonly seen in self-limiting viral upper respiratory illnesses.",
    recommendation:
      "Hydrate, rest, and monitor for fever, breathing difficulty, or symptoms that worsen over the next few days."
  },
  {
    name: "Food Poisoning Pattern",
    symptoms: ["vomiting", "diarrhea", "stomach pain"],
    optionalSymptoms: ["fever", "weakness", "fatigue"],
    condition: "Possible food poisoning",
    triageLevel: "MODERATE",
    medicalFocus: "acute gastrointestinal illness",
    explanation:
      "Sudden vomiting, diarrhea, and abdominal pain commonly point to foodborne illness or acute gastroenteritis.",
    recommendation:
      "Increase fluid intake and visit the clinic for persistent vomiting, dehydration, or worsening pain."
  },
  {
    name: "Dehydration Pattern",
    symptoms: ["dizziness", "weakness", "vomiting"],
    optionalSymptoms: ["diarrhea", "poor appetite", "rapid heartbeat"],
    condition: "Possible dehydration",
    triageLevel: "MODERATE",
    medicalFocus: "fluid-loss complication",
    explanation:
      "Dizziness and weakness after vomiting or poor intake suggest fluid loss, and the risk rises when diarrhea or a rapid heartbeat is also present.",
    recommendation:
      "Increase oral fluids promptly and seek clinic review the same day if you cannot keep fluids down."
  },
  {
    name: "Allergic Reaction Pattern",
    symptoms: ["rash", "itching", "swelling"],
    optionalSymptoms: ["runny nose", "sneezing", "shortness of breath"],
    condition: "Possible allergic reaction",
    triageLevel: "MODERATE",
    medicalFocus: "immune hypersensitivity reaction",
    explanation:
      "Rash, itching, and swelling suggest an allergic response that needs close monitoring for escalation toward airway compromise.",
    recommendation:
      "Avoid likely triggers and seek urgent care immediately if breathing becomes difficult."
  },
  {
    name: "Anaphylaxis Pattern",
    symptoms: ["swelling", "shortness of breath", "rash"],
    optionalSymptoms: ["rapid heartbeat", "dizziness", "throat swelling"],
    condition: "Possible anaphylaxis",
    triageLevel: "EMERGENCY",
    medicalFocus: "life-threatening allergic emergency",
    explanation:
      "Swelling with breathing difficulty and rash is a dangerous allergic emergency pattern because it may reflect airway involvement.",
    recommendation:
      "Seek emergency care immediately and activate emergency support without delay."
  },
  {
    name: "Meningitis Warning Pattern",
    symptoms: ["fever", "severe headache", "stiff neck"],
    optionalSymptoms: ["vomiting", "confusion", "sensitivity to light"],
    condition: "Possible meningitis warning signs",
    triageLevel: "EMERGENCY",
    medicalFocus: "neurological emergency",
    explanation:
      "Fever, severe headache, and neck stiffness form a high-risk neurological warning pattern that requires urgent exclusion of meningitis or another severe cause.",
    recommendation:
      "Get urgent medical attention immediately for full emergency assessment."
  },
  {
    name: "Asthma Exacerbation Pattern",
    symptoms: ["shortness of breath", "wheezing", "cough"],
    optionalSymptoms: ["chest pain", "rapid heartbeat", "fatigue"],
    condition: "Possible asthma exacerbation",
    triageLevel: "EMERGENCY",
    medicalFocus: "respiratory compromise",
    explanation:
      "Breathing difficulty with wheezing and cough suggests airway narrowing that can escalate quickly without treatment.",
    recommendation:
      "Seek urgent medical attention immediately, especially if speaking or walking feels difficult."
  },
  {
    name: "Tension Pattern",
    symptoms: ["headache", "fatigue"],
    optionalSymptoms: ["neck stiffness", "stress", "eye strain"],
    condition: "Possible tension-related headache",
    triageLevel: "MILD",
    medicalFocus: "stress-related discomfort",
    explanation:
      "This pattern fits stress-related or tension-associated discomfort when the symptoms are present without fever, breathing trouble, or major gastrointestinal illness.",
    recommendation:
      "Prioritize hydration, rest, and follow up at the clinic if symptoms persist for more than a few days."
  },
  {
    name: "Migraine-Like Pattern",
    symptoms: ["severe headache", "vomiting"],
    optionalSymptoms: ["dizziness", "sensitivity to light", "fatigue"],
    condition: "Possible migraine-like episode",
    triageLevel: "MODERATE",
    medicalFocus: "neurological pain syndrome",
    explanation:
      "A severe headache with vomiting can fit a migraine-like presentation, though persistent or unusual neurological symptoms still require careful review.",
    recommendation:
      "Reduce stimulation, hydrate, and seek clinic review if the headache is new, severe, or not improving."
  },
  {
    name: "Stress and Exhaustion Pattern",
    symptoms: ["fatigue", "poor appetite"],
    optionalSymptoms: ["headache", "dizziness", "stress"],
    condition: "Possible stress-related exhaustion",
    triageLevel: "MILD",
    medicalFocus: "non-emergency functional decline",
    explanation:
      "Fatigue with poor appetite and stress-associated symptoms can reflect exhaustion or reduced self-care rather than a high-acuity condition.",
    recommendation:
      "Prioritize food, fluids, sleep, and book a clinic check if symptoms continue or start worsening."
  }
];

const conditionProfiles: Record<string, string[]> = {
  "Possible malaria": ["fever", "chills", "headache", "fatigue", "body aches", "vomiting"],
  "Possible severe malaria": ["fever", "chills", "vomiting", "weakness", "confusion", "dizziness"],
  "Possible typhoid fever": ["fever", "stomach pain", "headache", "diarrhea", "vomiting"],
  "Possible viral respiratory illness": ["fever", "cough", "fatigue", "sore throat", "runny nose"],
  "Possible common cold": ["runny nose", "sore throat", "sneezing", "cough", "headache"],
  "Possible food poisoning": ["vomiting", "diarrhea", "stomach pain", "weakness"],
  "Possible allergic reaction": ["rash", "itching", "swelling", "shortness of breath"],
  "Possible dehydration": ["dizziness", "weakness", "vomiting", "diarrhea", "rapid heartbeat"],
  "Possible meningitis warning signs": ["fever", "severe headache", "stiff neck", "vomiting", "confusion"],
  "Possible migraine-like episode": ["severe headache", "vomiting", "dizziness", "sensitivity to light"],
  "Possible stress-related exhaustion": ["fatigue", "poor appetite", "stress", "headache"],
  "Possible asthma exacerbation": ["shortness of breath", "wheezing", "cough", "rapid heartbeat"]
};

function normalizeSymptom(symptom: string) {
  return symptomAliases[symptom] ?? symptom;
}

export function preprocessSymptoms(rawSymptoms: string[]) {
  const values = rawSymptoms
    .map((symptom) => symptom.toLowerCase().trim())
    .map((symptom) => symptom.replace(/^[^a-z]+|[^a-z]+$/g, ""))
    .filter(Boolean)
    .map(normalizeSymptom);

  return Array.from(new Set(values));
}

function getRiskScore(symptoms: string[]) {
  return Math.min(
    symptoms.reduce((sum, symptom) => sum + (symptomWeights[symptom] ?? 0), 0),
    10
  );
}

function getLevelFromRisk(riskScore: number, symptoms: string[]): EngineTriageLevel {
  const systemicCount = symptoms.filter((symptom) =>
    ["fever", "vomiting", "diarrhea", "weakness", "dizziness", "shortness of breath"].includes(
      symptom
    )
  ).length;

  if (riskScore >= 8 || systemicCount >= 4) {
    return "EMERGENCY";
  }

  if (riskScore >= 8) {
    return "EMERGENCY";
  }

  if (riskScore >= 4 || systemicCount >= 2) {
    return "MODERATE";
  }

  return "MILD";
}

function getConfidenceBand(confidence: number): ConfidenceBand {
  if (confidence >= 0.75) {
    return "HIGH";
  }

  if (confidence >= 0.45) {
    return "MEDIUM";
  }

  return "LOW";
}

function findEmergencyCombination(symptoms: string[]) {
  const symptomSet = new Set(symptoms);
  return emergencyCombinations.find((combination) =>
    combination.every((symptom) => symptomSet.has(symptom))
  );
}

function getCarePath(level: EngineTriageLevel) {
  if (level === "EMERGENCY") {
    return "This case falls into the emergency pathway and should bypass routine clinic queueing.";
  }

  if (level === "MODERATE") {
    return "This case falls into the moderate pathway and should receive prompt clinic follow-up.";
  }

  return "This case falls into the mild pathway and can begin with self-care plus observation.";
}

function runRuleMatch(symptoms: string[]) {
  const symptomSet = new Set(symptoms);
  let best:
    | {
        rule: RuleDefinition;
        confidence: number;
        matchedSignals: string[];
      }
    | undefined;

  for (const rule of rules) {
    const requiredMatches = rule.symptoms.filter((symptom) => symptomSet.has(symptom));
    if (requiredMatches.length === 0) {
      continue;
    }

    const optionalMatches = rule.optionalSymptoms.filter((symptom) =>
      symptomSet.has(symptom)
    );
    const confidence = Math.min(
      Number(
        (
          requiredMatches.length / rule.symptoms.length +
          optionalMatches.length / Math.max(rule.optionalSymptoms.length, 1) * 0.2
        ).toFixed(2)
      ),
      1
    );

    if (!best || confidence > best.confidence) {
      best = {
        rule,
        confidence,
        matchedSignals: [...requiredMatches, ...optionalMatches]
      };
    }
  }

  return best;
}

function runSimilarityFallback(symptoms: string[]) {
  const symptomSet = new Set(symptoms);
  const results = Object.entries(conditionProfiles)
    .map(([condition, profile]) => {
      const matched = profile.filter((item) => symptomSet.has(item));
      return {
        condition,
        matchedSignals: matched,
        score: Number((matched.length / profile.length).toFixed(2))
      };
    })
    .filter((item) => item.score > 0.15)
    .sort((left, right) => right.score - left.score);

  return results[0];
}

export function analyzeSymptoms(rawSymptoms: string[]): TriageAssessmentResult {
  const normalizedSymptoms = preprocessSymptoms(rawSymptoms);

  if (normalizedSymptoms.length === 0) {
    return {
      condition: "No valid symptoms submitted",
      triageLevel: "MILD",
      confidence: 0,
      confidenceBand: "LOW",
      matchedSignals: [],
      explanation:
        "No usable symptoms were provided, so the assistant could not run a medical triage assessment.",
      recommendation: "Please enter symptoms separated clearly so the system can assess them.",
      emergencyFlag: false,
      engineVersion: TRIAGE_ENGINE_VERSION
    };
  }

  const hardRedFlags = normalizedSymptoms.filter((symptom) => hardEmergencySignals.has(symptom));
  const softRedFlags = normalizedSymptoms.filter((symptom) => softEmergencySignals.has(symptom));
  const emergencyCombination = findEmergencyCombination(normalizedSymptoms);

  if (hardRedFlags.length > 0 || emergencyCombination) {
    const triggers = hardRedFlags.length > 0 ? hardRedFlags : emergencyCombination ?? [];
    return {
      condition: "Emergency symptoms detected",
      triageLevel: "EMERGENCY",
      confidence: 1,
      confidenceBand: "HIGH",
      matchedSignals: triggers,
      explanation: `The system detected emergency red-flag ${
        hardRedFlags.length > 0 ? `symptoms (${hardRedFlags.join(", ")})` : `combination (${triggers.join(", ")})`
      }, so the case was escalated immediately before routine rule matching. ${getCarePath("EMERGENCY")}`,
      recommendation:
        "Seek urgent medical attention immediately and notify campus emergency responders or the nearest clinic.",
      emergencyFlag: true,
      engineVersion: TRIAGE_ENGINE_VERSION
    };
  }

  const ruleResult = runRuleMatch(normalizedSymptoms);
  const similarityResult = runSimilarityFallback(normalizedSymptoms);
  const riskScore = getRiskScore(normalizedSymptoms);
  const riskLevel = getLevelFromRisk(riskScore, normalizedSymptoms);
  const softEmergencyEscalation = softRedFlags.length >= 2 && riskScore >= 6;

  if (ruleResult) {
    const finalLevel =
      ruleResult.rule.triageLevel === "EMERGENCY" || riskLevel === "EMERGENCY" || softEmergencyEscalation
        ? "EMERGENCY"
        : ruleResult.rule.triageLevel === "MODERATE" || riskLevel === "MODERATE"
          ? "MODERATE"
          : "MILD";
    const confidenceBand = getConfidenceBand(ruleResult.confidence);
    const severityText =
      finalLevel === "EMERGENCY"
        ? "The symptom pattern crossed the emergency threshold because of high-acuity signals or accumulated severity."
        : finalLevel === "MODERATE"
          ? "The symptom pattern is concerning enough for timely clinic review, but it does not currently meet the emergency pathway."
          : "The symptom pattern is currently low-acuity and suitable for self-care with monitoring.";

    return {
      condition: ruleResult.rule.condition,
      triageLevel: finalLevel,
      confidence: ruleResult.confidence,
      confidenceBand,
      matchedSignals: ruleResult.matchedSignals,
      explanation:
        `${ruleResult.rule.explanation} Clinical focus: ${ruleResult.rule.medicalFocus}. The engine matched ${ruleResult.matchedSignals.join(
          ", "
        )} and computed a risk score of ${riskScore}/10. ${severityText} Confidence band: ${confidenceBand.toLowerCase()}. ${getCarePath(finalLevel)}`,
      recommendation:
        finalLevel === "EMERGENCY"
          ? "Seek urgent medical attention immediately and raise an emergency alert."
          : ruleResult.rule.recommendation,
      emergencyFlag: finalLevel === "EMERGENCY",
      engineVersion: TRIAGE_ENGINE_VERSION
    };
  }

  if (similarityResult) {
    const confidence = Number((similarityResult.score * 0.8).toFixed(2));
    const confidenceBand = getConfidenceBand(confidence);
    return {
      condition: similarityResult.condition,
      triageLevel: riskLevel,
      confidence,
      confidenceBand,
      matchedSignals: similarityResult.matchedSignals,
      explanation:
        `No exact rule fully matched the symptoms, so the engine used similarity scoring. ${similarityResult.condition} had the strongest overlap (${Math.round(
          similarityResult.score * 100
        )}%), and the final triage level was adjusted using the ${riskScore}/10 risk score. Confidence band: ${confidenceBand.toLowerCase()}. ${getCarePath(
          riskLevel
        )}`,
      recommendation:
        riskLevel === "MILD"
          ? "Rest, monitor symptoms, and book a clinic visit if you do not improve."
          : riskLevel === "MODERATE"
            ? "Schedule a clinic appointment soon for professional review."
            : "Seek urgent medical attention immediately and raise an emergency alert.",
      emergencyFlag: riskLevel === "EMERGENCY",
      engineVersion: TRIAGE_ENGINE_VERSION
    };
  }

  return {
    condition: "Uncertain condition",
    triageLevel: riskLevel,
    confidence: 0.2,
    confidenceBand: "LOW",
    matchedSignals: normalizedSymptoms,
    explanation:
      `The current rule base did not strongly match this symptom combination, so the result is conservative and based on a ${riskScore}/10 risk score. Confidence band: low. ${getCarePath(
        riskLevel
      )}`,
    recommendation:
      riskLevel === "MILD"
        ? "Monitor symptoms and visit the clinic if they persist."
        : riskLevel === "MODERATE"
          ? "Book a clinic appointment soon for further evaluation."
          : "Seek urgent medical attention immediately.",
    emergencyFlag: riskLevel === "EMERGENCY",
    engineVersion: TRIAGE_ENGINE_VERSION
  };
}
