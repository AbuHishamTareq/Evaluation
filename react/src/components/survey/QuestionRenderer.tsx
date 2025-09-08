import React from 'react';
import { ErrorMessage, Field, type FieldProps } from "formik";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import RatingField from "./RatingField";
import type { QuestionRendererProps } from '@/types/types';

const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question, shouldShow = true }) => {
  if (!shouldShow) return null;

  const fieldProps = {
    name: question.id,
    id: question.id,
    className: "w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={question.id} className="text-blue-900 font-medium">
        {question.label}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {question.type === 'text' || question.type === 'email' || question.type === 'number' ? (
        <Field name={question.id}>
          {({ field, form }: FieldProps<string>) => (
            <Input
              {...field}
              type={question.type}
              placeholder={question.placeholder}
              value={field.value ?? ''} // ✅ Ensure value is always defined
              onChange={(e) => form.setFieldValue(question.id, e.target.value)}
              {...fieldProps}
            />
          )}
        </Field>
      ) : question.type === 'textarea' ? (
        <Field name={question.id}>
          {({ field, form }: FieldProps<string>) => (
            <Textarea
              {...field}
              placeholder={question.placeholder}
              rows={4}
              value={field.value ?? ''} // ✅ Fix uncontrolled warning
              onChange={(e) => form.setFieldValue(question.id, e.target.value)}
              {...fieldProps}
            />
          )}
        </Field>
      ) : question.type === 'select' ? (
        <Field name={question.id}>
          {({ field, form }: FieldProps<string>) => (
            <Select
              value={field.value ?? ''} // ✅ Always a string
              onValueChange={(value: string) => form.setFieldValue(question.id, value)}
            >
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
          )}
        </Field>
      ) : question.type === 'radio' ? (
        <Field name={question.id}>
          {({ field, form }: FieldProps<string>) => (
            <RadioGroup
              value={field.value ?? ''} // ✅ Always defined
              onValueChange={(value: string) => form.setFieldValue(question.id, value)}
              className="space-y-2"
            >
              {question.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option}
                    id={`${question.id}-${option}`}
                    className="border-blue-300 text-blue-600"
                  />
                  <Label
                    htmlFor={`${question.id}-${option}`}
                    className="text-blue-800 cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </Field>
      ) : question.type === 'rating' ? (
        <Field name={question.id}>
          {({ field, form }: FieldProps<number>) => (
            <RatingField
              name={question.id}
              label=""
              value={field.value ?? 0} // ✅ Default to 0
              onChange={(name: string, value: number) => form.setFieldValue(name, value)}
            />
          )}
        </Field>
      ) : null}

      <ErrorMessage name={question.id} component="div" className="text-red-500 text-sm" />
    </div>
  );
};

export default QuestionRenderer;