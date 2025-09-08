/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '../axios';

export interface SubmissionAnswer {
  question_id: number;
  answer: string | number | boolean;
  score: number;
}

export interface FormDataAnswer {
  [questionId: string]: any;
}

export interface SurveyStep {
  id: number;
  title: string;
  questions: Array<{
    id: number;
    [key: string]: any;
  }>;
}

export interface OriginalDomain {
  id: number;
  questions: Array<{
    id: number;
    options?: Array<{
      en_text: string;
      ar_text: string;
      value: string;
    }>;
  }>;
}

export class SurveySubmissionService {
  /**
   * Convert form data to API submission format
   */
  static convertFormDataToSubmission(
    formData: FormDataAnswer,
    surveySteps: SurveyStep[],
    originalDomains: OriginalDomain[]
  ): SubmissionAnswer[] {
    const answers: SubmissionAnswer[] = [];

    surveySteps.forEach((domain) => {
      domain.questions.forEach((q) => {
        const rawAnswer = formData[q.id];

        if (rawAnswer !== undefined && rawAnswer !== '') {
          let score = 0;
          
          // Find the original question to get scoring information
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
              score = parseInt(matchedOption.value) || 0;
            }
          }

          answers.push({
            question_id: q.id,
            answer: String(rawAnswer),
            score,
          });
        }
      });
    });

    return answers;
  }

  /**
   * Save answers as draft
   */
  static async saveDraft(
    responseId: string,
    answers: SubmissionAnswer[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await api.post(`/api/responses/${responseId}/draft`, { answers });
      return { success: true };
    } catch (error: any) {
      console.error('Draft save error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to save draft',
      };
    }
  }

  /**
   * Submit survey with bulk submission
   */
  static async submitSurvey(
    responseId: string,
    answers: SubmissionAnswer[]
  ): Promise<{ success: boolean; error?: string; overallScore?: number }> {
    try {
      const response = await api.post(`/api/responses/${responseId}/submit`, { answers });
      return {
        success: true,
        overallScore: response.data.overall_score,
      };
    } catch (error: any) {
      console.error('Survey submission error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to submit survey',
      };
    }
  }

  /**
   * Load draft answers
   */
  static async loadDraft(responseId: string): Promise<{
    success: boolean;
    answers?: SubmissionAnswer[];
    error?: string;
  }> {
    try {
      const response = await api.get(`/api/responses/${responseId}/draft`);
      return {
        success: true,
        answers: response.data.draft_answers || [],
      };
    } catch (error: any) {
      console.error('Draft load error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to load draft',
      };
    }
  }

  /**
   * Get survey progress statistics
   */
  static async getProgress(responseId: string): Promise<{
    success: boolean;
    totalQuestions?: number;
    answeredCount?: number;
    completionPercent?: number;
    status?: string;
    error?: string;
  }> {
    try {
      const response = await api.get(`/api/responses/${responseId}/progress`);
      return {
        success: true,
        ...response.data,
      };
    } catch (error: any) {
      console.error('Progress fetch error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch progress',
      };
    }
  }

  /**
   * Check if user has resumable surveys
   */
  static async checkResumable(
    centerId: string,
    surveyId: string
  ): Promise<{
    success: boolean;
    hasResumable?: boolean;
    response?: {
      id: string;
      status: string;
      completionPercentage: number;
      lastActivityAt: string;
    };
    error?: string;
  }> {
    try {
      const response = await api.get('/api/evaluations/resumable', {
        params: { center_id: centerId, survey_id: surveyId },
      });
      return {
        success: true,
        hasResumable: response.data.has_resumable,
        response: response.data.response,
      };
    } catch (error: any) {
      console.error('Resumable check error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to check resumable surveys',
      };
    }
  }

  /**
   * Validate answers before submission
   */
  static validateAnswers(
    answers: SubmissionAnswer[],
    requiredQuestions?: number[]
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (answers.length === 0) {
      errors.push('No answers provided');
    }

    // Check for required questions if specified
    if (requiredQuestions && requiredQuestions.length > 0) {
      const answeredQuestionIds = answers.map(a => a.question_id);
      const missingRequired = requiredQuestions.filter(
        qId => !answeredQuestionIds.includes(qId)
      );

      if (missingRequired.length > 0) {
        errors.push(`Missing required questions: ${missingRequired.join(', ')}`);
      }
    }

    // Validate answer format
    answers.forEach((answer, index) => {
      if (!answer.question_id) {
        errors.push(`Answer ${index + 1}: Missing question_id`);
      }
      if (answer.answer === undefined || answer.answer === null) {
        errors.push(`Answer ${index + 1}: Missing answer value`);
      }
      if (typeof answer.score !== 'number') {
        errors.push(`Answer ${index + 1}: Invalid score value`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert draft answers back to form data format
   */
  static convertDraftToFormData(draftAnswers: SubmissionAnswer[]): FormDataAnswer {
    const formData: FormDataAnswer = {};
    
    draftAnswers.forEach((answer) => {
      formData[answer.question_id] = answer.answer;
    });

    return formData;
  }

  /**
   * Calculate completion statistics
   */
  static calculateCompletionStats(
    formData: FormDataAnswer,
    totalQuestions: number
  ): {
    answeredCount: number;
    completionPercent: number;
    unansweredQuestions: number;
  } {
    const answeredCount = Object.values(formData).filter(
      value => value !== undefined && value !== null && value !== ''
    ).length;

    const completionPercent = totalQuestions > 0 
      ? Math.round((answeredCount / totalQuestions) * 100) 
      : 0;

    return {
      answeredCount,
      completionPercent,
      unansweredQuestions: totalQuestions - answeredCount,
    };
  }
}