import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "./Progress";
import { Phc } from "./steps/Phc";
import { Personal } from "./steps/Personal";
// import { EducationStep } from "./steps/EducationStep";
// import { ExperienceStep } from "./steps/ExperienceStep";
// import { CoursesStep } from "./steps/CoursesStep";
// import { CurrentJobStep } from "./steps/CurrentJobStep";
// import { DocumentsStep } from "./steps/DocumentsStep";
import { type FormData, initialFormData } from "./types";
import { toast } from "@/hooks/use-toast";
import logo from "../../../public/images/logo.png";
import { JobDetails } from "./steps/JobDetails";

const TOTAL_STEPS = 7;

type ValidationErrors = Record<string, string>;

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateStep = (step: number): boolean => {
    const newErrors: ValidationErrors = {};

    switch (step) {
      case 1: // Phc Info
        if (!formData.phcInfo.clusterId.trim()) {
          newErrors.clusterName = "Cluster is required";
        }
        if (!formData.phcInfo.phcName.trim()) {
          newErrors.phcName = "Primary Health Care is required";
        }
        if (!formData.phcInfo.zoneId.trim()) {
          newErrors.zoneName = "Zone is required";
        }
        break;

      case 2: // Personal Info
        if (!formData.personalInfo.fullName.trim()) {
          newErrors.fullName = "Full name is required";
        }
        if (!formData.personalInfo.employeeId.trim()) {
          newErrors.employeeId = "National / Iqama ID is required";
        }
        if (!formData.personalInfo.employeeIdType.trim()) {
          newErrors.employeeIdType = "ID Type is required";
        }
        if (!formData.personalInfo.email.trim()) {
          newErrors.email = "Email is required";
        } else if (!validateEmail(formData.personalInfo.email)) {
          newErrors.email = "Please enter a valid email address";
        }
        break;

      case 3: // Education
        formData.education.forEach((edu, index) => {
          if (!edu.degree) {
            newErrors[`degree_${index}`] = "Degree is required";
          }
          if (!edu.institution.trim()) {
            newErrors[`institution_${index}`] = "Institution is required";
          }
        });
        break;

      case 5: // Current Job
        if (!formData.currentJob.jobTitle.trim()) {
          newErrors.jobTitle = "Job title is required";
        }
        if (!formData.currentJob.company.trim()) {
          newErrors.company = "Company name is required";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep((prev) => prev + 1);
        setErrors({});
      }
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
        color: "text-white",
        backgroundColor: "bg-red-600",
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
        color: "text-white",
        backgroundColor: "bg-red-600",
      });
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    console.log("Form submitted:", formData);
    toast({
      title: "Application Submitted!",
      description: "Your information has been successfully submitted.",
      backgroundColor: "bg-green-600",
      color: "text-white",
    });
    // Reset form
    setCurrentStep(1);
    setFormData(initialFormData);
    setErrors({});
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Phc
            data={formData.phcInfo}
            onChange={(data) => setFormData({ ...formData, phcInfo: data })}
            errors={errors}
          />
        );
      case 2:
        return (
          <Personal
            data={formData.personalInfo}
            onChange={(data) =>
              setFormData({ ...formData, personalInfo: data })
            }
            errors={errors}
          />
        );
      case 3:
        return (
          <JobDetails
            data={formData.jobDetailsInfo}
            onChange={(data) =>
              setFormData({ ...formData, jobDetailsInfo: data })
            }
            errors={errors}
            phcId={formData.phcInfo.phcId}
          />
        );
      // case 2:
      //   return (
      //     <EducationStep
      //       data={formData.education}
      //       onChange={(data) => setFormData({ ...formData, education: data })}
      //       errors={errors}
      //     />
      //   );
      // case 3:
      //   return (
      //     <ExperienceStep
      //       data={formData.experiences}
      //       onChange={(data) => setFormData({ ...formData, experiences: data })}
      //     />
      //   );
      // case 4:
      //   return (
      //     <CoursesStep
      //       data={formData.courses}
      //       onChange={(data) => setFormData({ ...formData, courses: data })}
      //     />
      //   );
      // case 5:
      //   return (
      //     <CurrentJobStep
      //       data={formData.currentJob}
      //       onChange={(data) => setFormData({ ...formData, currentJob: data })}
      //       errors={errors}
      //     />
      //   );
      // case 6:
      //   return (
      //     <DocumentsStep
      //       data={formData.documents}
      //       onChange={(data) => setFormData({ ...formData, documents: data })}
      //     />
      //   );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <img src={logo} alt="Logo" className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground">
            Application Form
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete all steps to submit your application
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-xl shadow-card p-8 md:p-10">
          <Progress currentStep={currentStep} totalSteps={TOTAL_STEPS} />

          {/* Step Content */}
          <div className="min-h-[500px]">{renderStep()}</div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setFormData(initialFormData);
                setCurrentStep(1);
                setErrors({});
                toast({
                  title: "Form Reset",
                  description: "All fields have been cleared.",
                  variant: "destructive",
                  color: "text-white",
                  backgroundColor: "bg-red-600",
                });
              }}
              className="px-4 text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="px-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              {currentStep === TOTAL_STEPS ? (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              ) : (
                <Button type="button" onClick={handleNext} className="px-6">
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-sm mt-6">
          Step {currentStep} of {TOTAL_STEPS}
        </p>
      </div>
    </div>
  );
};
