/* eslint-disable @typescript-eslint/no-explicit-any */
import { Field, ErrorMessage } from 'formik';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { RatingField } from './RatingField';
import type { FormStep, Domain } from '../hooks/useSurvey';

export const QuestionRenderer = ({
  question,
  index,
}: {
  question: FormStep['questions'][number];
  index: number;
  originalDomains: Domain[];
}) => {
  const fieldProps = {
    name: question.id,
    id: question.id,
    className:
      'w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200',
  };

  return (
    <div className="space-y-2" key={question.id}>
      <Label htmlFor={question.id} className="text-blue-900 font-medium">
        <span className="text-blue-700 font-semibold mr-2">Q{index + 1}:</span>
        {question.label}
        {question.required && <span className="text-red-500 ml-1">*</span>}
        {question.extra_question && (
          <div className="text-sm text-gray-500 italic py-2 px-7">{question.extra_question}</div>
        )}
      </Label>

      {(question.type === 'text' || question.type === 'number') && (
        <Field as={Input} type={question.type} {...fieldProps} />
      )}

      {question.type === 'textarea' && <Field as={Textarea} rows={4} {...fieldProps} />}

      {(question.type === 'select' || question.type === 'radio') && (
        <Field name={question.id}>
          {({ field, form }: any) =>
            question.type === 'select' ? (
              <Select value={field.value || ''} onValueChange={(v) => form.setFieldValue(question.id, v)}>
                <SelectTrigger className="border-blue-200 focus:ring-blue-500">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {question.options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <RadioGroup
                value={field.value || ''}
                onValueChange={(v: string) => form.setFieldValue(question.id, v)}
                className="space-y-2"
              >
                {question.options?.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                    <Label htmlFor={`${question.id}-${option}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )
          }
        </Field>
      )}

      {question.type === 'rating' && (
        <Field name={question.id}>
          {({ field, form }: any) => (
            <RatingField
              name={question.id}
              value={field.value || 0}
              onChange={(n: string, v: number) => form.setFieldValue(n, v)}
            />
          )}
        </Field>
      )}

      <ErrorMessage name={question.id} component="div" className="text-red-500 text-sm" />
    </div>
  );
};
