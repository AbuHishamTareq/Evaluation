/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useCallback, useRef } from "react";
import { Formik } from "formik";
import { useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  // Save,
  // AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { useToast } from "../hooks/use-toast";
// import { Alert, AlertDescription } from "./ui/alert";
import api from "../axios";
import { useSurvey } from "../hooks/useSurvey";
import { useResponseId } from "../hooks/useResponseId";
import { useDraftManager } from "../hooks/useDraftManager";
import { QuestionRenderer } from "./QuestionRenderer";
import { ProgressHeader } from "./ProgressHeader";
import { StepIndicators } from "./StepIndicators";
import { TrackInProgress } from "./TrackInProgress";
import MedicationDynamicTable from "./MedicationDynamicTable";
import Header from "./dashboard/Header";
import DraftStatusIndicator from "./DraftStatusIndicator";

type FormData = Record<string, any>;

const EvaluationForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [completionPercent, setCompletionPercent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  const { toast } = useToast();
  const formikRef = useRef<any>(null);
  const isLoadingInitialDataRef = useRef(false);

  const { section, evalId } = useParams<{
    section?: string;
    evalId?: string;
  }>();
  const responseId = useResponseId(section, evalId);
  const { surveySteps, originalDomains, loading } = useSurvey(
    section,
    evalId,
    toast
  );

  // Initialize draft manager
  const {
    draftStatus,
    loadDraft,
    scheduleAutoSave,
    saveNow,
    clearDraft,
    clearError,
  } = useDraftManager({
    responseId,
    autoSaveDelay: 3000,
    onSaveSuccess: (answerCount) => {
      toast({
        title: "Draft Saved",
        description: `Saved ${answerCount} answers as draft.`,
        backgroundColor: "bg-green-600",
        color: "text-white",
      });
    },
    onSaveError: (error) => {
      toast({
        title: "Draft Save Failed",
        description: error,
        variant: "destructive",
        backgroundColor: "bg-red-600",
        color: "text-white",
      });
    },
    onLoadSuccess: (answerCount) => {
      if (answerCount > 0) {
        toast({
          title: "Draft Loaded",
          description: `Resumed your evaluation with ${answerCount} saved answers.`,
          backgroundColor: "bg-blue-600",
          color: "text-white",
        });
      }
    },
  });

  // Load draft data when component mounts (ONE TIME ONLY)
  useEffect(() => {
    const initializeFormData = async () => {
      if (!responseId || isInitialLoadComplete || isLoadingInitialDataRef.current) return;

      isLoadingInitialDataRef.current = true;

      try {
        const loadedData = await loadDraft();
        setFormData(loadedData);
        setIsInitialLoadComplete(true);
      } catch (error) {
        console.error("Failed to initialize form data:", error);
        setIsInitialLoadComplete(true);
      } finally {
        isLoadingInitialDataRef.current = false;
      }
    };

    initializeFormData();
  }, [responseId]); // Only depend on responseId, not loadDraft

  // Auto-save when form data changes (FIXED to prevent infinite loops)
  const handleAutoSave = useCallback((newFormData: FormData) => {
    if (!isInitialLoadComplete) return; // Don\"t auto-save during initial load
    
    scheduleAutoSave(newFormData);
  }, [scheduleAutoSave, isInitialLoadComplete]);

  // Poll progress if responseId exists
  useEffect(() => {
    if (!responseId) return;
    
    const interval = setInterval(async () => {
      try {
        const prog = await api.get(`/api/responses/${responseId}/progress`);
        setCompletionPercent(prog.data.completion_percent || 0);
      } catch {
        // ignore
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [responseId]);

  // Handle form data updates from Formik (CONTROLLED to prevent loops)
  const handleFormDataChange = useCallback((values: FormData) => {
    setFormData(prevData => {
      // Only update if data actually changed
      const prevDataString = JSON.stringify(prevData);
      const newDataString = JSON.stringify(values);
      
      if (prevDataString !== newDataString) {
        // Schedule auto-save for the new data
        handleAutoSave(values);
        return values;
      }
      
      return prevData;
    });
  }, [handleAutoSave]);

  // Manual save draft function
  const handleManualSaveDraft = useCallback(() => {
    saveNow(formData);
  }, [saveNow, formData]);

  // This function is now ONLY for advancing steps, not for final submission
  const handleNextStep = () => {
    // Ensure Formik\"s current values are captured before advancing
    if (formikRef.current) {
      setFormData(prev => ({ ...prev, ...formikRef.current.values }));
    }
    setCurrentStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Manually trigger Formik validation
      if (formikRef.current) {
        const errors = await formikRef.current.validateForm();
        if (Object.keys(errors).length > 0) {
          console.error("Validation errors:", errors);
          toast({
            title: "Submission Error",
            description: "Please correct the errors in the form before submitting.",
            variant: "destructive",
            backgroundColor: "bg-red-600",
            color: "text-white",
          });
          setIsSubmitting(false);
          return;
        }
      }

      const finalData = formikRef.current ? formikRef.current.values : formData;

      if (Object.keys(finalData).length === 0) {
        toast({
          title: "No Data to Submit",
          description: "Please fill out the survey before submitting.",
          variant: "destructive",
          backgroundColor: "bg-red-600",
          color: "text-white",
        });
        setIsSubmitting(false);
        return;
      }

      // Convert form data to API format for bulk submission
      const answers: any[] = [];
      
      // Process regular survey questions
      surveySteps.forEach((domain) => {
        domain.questions.forEach((q) => {
          const rawAnswer = finalData[q.id];

          if (rawAnswer !== undefined && rawAnswer !== "") {
            let score = 0;
            const originalQuestion = originalDomains
              .find((d) => d.id === domain.id)
              ?.questions.find((origQ) => origQ.id === q.id);

            if (originalQuestion?.options) {
              const matchedOption = originalQuestion.options.find(
                (opt) =>
                  String(opt.en_text) === String(rawAnswer) ||
                  String(opt.ar_text) === String(rawAnswer)
              );

              if (matchedOption) {
                score = parseInt(matchedOption.value);
              }
            }

            answers.push({
              question_id: q.id,
              answer: rawAnswer,
              score,
            });
          }
        });
      });

      // Process tabular data (medications) - keep composite keys
      Object.keys(finalData).forEach((key) => {
        // Ensure the key matches the expected tabular format (e.g., \"1_2\" for med_id_field_id)
        if (key.match(/^\d+_\d+$/) && finalData[key] !== undefined && finalData[key] !== "") {
          answers.push({
            question_id: key, // Keep the composite key as-is
            answer: finalData[key],
            score: 0,
          });
        }
      });

      if (answers.length === 0) {
        toast({
          title: "No Answers to Submit",
          description: "Please answer at least one question before submitting.",
          variant: "destructive",
          backgroundColor: "bg-red-600",
          color: "text-white",
        });
        setIsSubmitting(false);
        return;
      }

      // Submit via bulk submission endpoint
      await api.post(`/api/responses/${responseId}/submit`, { answers });

      // Clear draft data after successful submission
      await clearDraft();

      setIsSubmitted(true);

      toast({
        title: "Survey Submitted Successfully!",
        description: `Thank you for your feedback. ${answers.length} answers were submitted.`,
        backgroundColor: "bg-green-600",
        color: "text-white",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Error",
        description: error.response?.data?.error || "Please try again later.",
        variant: "destructive",
        backgroundColor: "bg-red-600",
        color: "text-white",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  if (loading || !isInitialLoadComplete) {
    return (
      <div className="text-center p-8 text-blue-700">
        {loading ? "Loading survey..." : "Loading your progress..."}
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-blue-200">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">
              Thank You!
            </h2>
            <p className="text-blue-700 mb-6">
              Your survey has been submitted successfully.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Another Survey
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (surveySteps.length === 0) {
    return (
      <div className="text-center p-8 text-blue-700">
        No survey steps found.
      </div>
    );
  }

  const currentStepData = surveySteps[currentStep];

  return (
    <Header title="Evaluation Form">
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <ProgressHeader
            currentStep={currentStep}
            totalSteps={surveySteps.length}
            completionPercent={completionPercent}
          />

          {/* Enhanced Draft Status Indicator */}
          <DraftStatusIndicator
            isSaving={draftStatus.isSaving}
            lastSaved={draftStatus.lastSaved}
            hasUnsavedChanges={draftStatus.hasUnsavedChanges}
            error={draftStatus.error}
            onManualSave={handleManualSaveDraft}
            onClearError={clearError}
            className="mb-4"
          />

          <StepIndicators surveySteps={surveySteps} currentStep={currentStep} />

          <Formik
            innerRef={formikRef} // Use innerRef to get a ref to the Formik instance
            initialValues={formData}
            enableReinitialize
            onSubmit={() => {}} // No-op onSubmit for Formik, we will manually trigger submission
            validateOnBlur={false}
            validateOnChange={false}
          >
            {(formik) => {
              // Update form data when Formik values change (CONTROLLED)
              useEffect(() => {
                // Only update if we\"re not in the middle of loading initial data
                if (isInitialLoadComplete && !isLoadingInitialDataRef.current) {
                  handleFormDataChange(formik.values);
                }
              }, [formik.values, handleFormDataChange, isInitialLoadComplete]);

              return (
                <>
                  <TrackInProgress
                    values={formik.values}
                    responseId={responseId || null}
                  />

                  {/* The form\"s onSubmit is now tied to the final submit button */}
                  <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-6"> {/* Prevent default form submission */}
                    <Card className="shadow-xl border-blue-200">
                      <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                        <CardTitle className="flex items-center">
                          {currentStepData.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="p-8">
                        {currentStepData.medications &&
                        currentStepData.medications.length > 0 ? (
                          <MedicationDynamicTable
                            formik={formik}
                            medications={currentStepData.medications}
                            headers={currentStepData.headers || []}
                          />
                        ) : (
                          currentStepData.questions.map((question, index) => (
                            <div key={question.id} className="space-y-4">
                              <QuestionRenderer
                                question={question}
                                index={index}
                                originalDomains={originalDomains}
                              />
                              {index < currentStepData.questions.length - 1 && (
                                <hr className="border-t border-blue-100 py-2" />
                              )}
                            </div>
                          ))
                        )}
                      </CardContent>

                      <CardFooter className="flex justify-between pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={goToPreviousStep}
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          disabled={currentStep === 0}
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Previous
                        </Button>

                        {/* Conditional rendering for Next/Submit button */}
                        {currentStep === surveySteps.length - 1 ? (
                          <Button
                            type="button" // Change to button to prevent implicit form submission
                            onClick={handleFinalSubmit} // Manually call the submit handler
                            className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                            disabled={isSubmitting}
                          >
                            <span>
                              {isSubmitting ? "Submitting..." : "Submit Survey"}
                            </span>
                            {!isSubmitting && (
                              <ChevronRight className="w-4 h-4 ml-2" />
                            )}
                          </Button>
                        ) : (
                          <Button
                            type="button" // This button will NOT trigger Formik\"s onSubmit
                            onClick={handleNextStep} // Calls the new handleNextStep function
                            className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                          >
                            <span>Next</span>
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </form>
                </>
              );
            }}
          </Formik>

          <div className="text-center mt-8 text-blue-600 text-sm">
            <p>
              Your progress is automatically saved every few seconds. You can
              return anytime to complete the survey within the same month.
            </p>
          </div>
        </div>
      </div>
    </Header>
  );
};

export default EvaluationForm;
