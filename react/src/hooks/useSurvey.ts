/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import api from "../axios";
import type { Medication } from "../components/MedicationDynamicTable";

export interface Option {
  en_text: string;
  ar_text: string;
  value: string;
}

export interface Question {
  id: string;
  question: string;
  type: "text" | "select" | "radio" | "textarea" | "rating" | "number";
  required: boolean;
  options?: Option[];
  extra_question?: string;
}

export interface Domain {
  id: string;
  name: string;
  en_label: string;
  ar_label: string;
  questions: Question[];
}

export interface FieldType {
  id: string | number;
  control_type: string;
  options?: { en_text: string; ar_text: string; value: string }[];
  header_id: string | number;
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  questions: {
    id: string;
    type: Question["type"];
    label: string;
    required: boolean;
    options?: string[];
    extra_question?: string;
  }[];
  medications?: Medication[]; // 👈 add this
  availabilityOptions?: { value: string; label: string }[]; // 👈 add this
  headers?: {
    id: string | number;
    header_en: string;
    header_ar: string;
    slug: string;
    order: number;
  }[]; // 👈 NEW: dynamic headers
}

interface BackendResponse {
  survey_section: {
    id: string;
    name: string;
    en_label: string;
    ar_label: string;
    evaluation_type: string;
  };
  queried_section: {
    id: string;
    name: string;
    en_label: string;
    ar_label: string;
  };
  domains: Domain[];
}

export const useSurvey = (
  section: string | undefined,
  evalId: string | undefined,
  toast: any
) => {
  const [surveySteps, setSurveySteps] = useState<FormStep[]>([]);
  const [originalDomains, setOriginalDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!section || !evalId) return;

    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get<BackendResponse>(
          `/api/evaluations/${section}/${evalId}`
        );

        const domains = res.data.domains;
        setOriginalDomains(domains);

        const steps: FormStep[] = [];

        // Loop through all domains
        for (const domain of domains) {
          // Standard questions domain (e.g., General Information on Medications)
          if (domain.en_label !== "Medication Availability") {
            const questions = domain.questions.map((q) => ({
              id: q.id,
              type: q.type,
              label: q.question,
              required: q.required,
              options: q.options?.map((opt) => opt.en_text) || [],
              extra_question: q.extra_question ?? "",
            }));

            steps.push({
              id: domain.id,
              title: domain.en_label,
              description: domain.ar_label,
              questions,
            });
          }
        }

        // Now handle Medication Availability as separate steps
        const medicationDomain = domains.find(
          (d) => d.en_label === "Medication Availability"
        );

        console.log(medicationDomain);

        if (medicationDomain) {
          const isTabular =
            res.data.survey_section.evaluation_type === "tabular";

          if (isTabular) {
            const medsRes = await api.get(
              `/api/evaluations/medications?section=${section}`
            );
            const medications = medsRes.data || [];

            // fetch dynamic headers
            const headersRes = await api.get(
              `/api/evaluations/headers?section=${section}`
            );
            const rawHeaders = headersRes.data || [];

            // ✅ Normalize headers so `fields` is always an array
            const headers = rawHeaders.map((h: any) => ({
              ...h,
              fields: Array.isArray(h.fields) ? h.fields : [],
            }));

            // Divide medications into steps (e.g., 10 medications per step)
            const medicationsPerStep = 10;
            const totalMedicationSteps = Math.ceil(
              medications.length / medicationsPerStep
            );

            for (
              let stepIndex = 0;
              stepIndex < totalMedicationSteps;
              stepIndex++
            ) {
              const startIndex = stepIndex * medicationsPerStep;
              const endIndex = Math.min(
                startIndex + medicationsPerStep,
                medications.length
              );
              const stepMedications = medications.slice(startIndex, endIndex);

              const medicationQuestions = stepMedications.map((med: any) => ({
                id: `med-${med.id}`,
                type: "text",
                label: med.slug,
                required: true,
              }));

              steps.push({
                id: `${medicationDomain.id}-step-${stepIndex + 1}`,
                title: medicationDomain.en_label,
                description: `${medicationDomain.ar_label} (${
                  startIndex + 1
                }-${endIndex} of ${medications.length})`,
                questions: medicationQuestions,
                medications: stepMedications,
                headers,
              });
            }
          } else {
            // Handle non-tabular case as before
            const medicationQuestions: any[] = [];

            steps.push({
              id: medicationDomain.id,
              title: medicationDomain.en_label,
              description: medicationDomain.ar_label,
              questions: medicationQuestions,
              medications: [],
              headers: [],
            });
          }
        }

        setSurveySteps(steps);
      } catch (e) {
        toast({
          title: "Error loading survey",
          description:
            "Could not load evaluation data. Please try again later.",
          variant: "destructive",
          backgroundColor: "bg-red-600",
          color: "text-white",
        });
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [section, evalId]);

  return { surveySteps, originalDomains, loading };
};
