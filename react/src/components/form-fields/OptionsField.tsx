/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, type ReactNode } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Trash2, Plus } from 'lucide-react';
import { v4 as uuid } from 'uuid';

interface Option {
  id: string;
  en_text: string;
  ar_text: string;
  value: string; // percentage value
}

interface OptionsFieldProps {
  id: string;
  name: string;
  label: string | ReactNode;
  value: Option[];
  onChange: (options: Option[]) => void;
  readOnly?: boolean;
  errors?: string[];
}

export const OptionsField: React.FC<OptionsFieldProps> = ({
  id,
  label,
  value = [],
  onChange,
  readOnly = false,
  errors = [],
}) => {
  const [options, setOptions] = useState<Option[]>(value);

  useEffect(() => {
    setOptions(value);
  }, [value]);

  const addOption = () => {
    const newOption: Option = {
      id: uuid(),
      en_text: '',
      ar_text: '',
      value: '',
    };
    const updatedOptions = [...options, newOption];
    setOptions(updatedOptions);
    onChange(updatedOptions);
  };

  const removeOption = (optionId: string) => {
    const updatedOptions = options.filter((option) => option.id !== optionId);
    setOptions(updatedOptions);
    onChange(updatedOptions);
  };

  const updateOption = (optionId: string, field: keyof Option, value: any) => {
    const updatedOptions = options.map((option) =>
      option.id === optionId ? { ...option, [field]: value } : option
    );
    setOptions(updatedOptions);
    onChange(updatedOptions);
  };

  const validatePercentage = (value: string): boolean => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 100;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </Label>
        {!readOnly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
            className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            <Plus size={16} />
            Add Option
          </Button>
        )}
      </div>

      {errors.length > 0 && (
        <div className="text-red-500 text-sm">
          {errors.map((error, index) => (
            <p key={`${index}-${error}`}>{error}</p>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {options.map((option, index) => (
          <div
            key={option.id}
            className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                Option {index + 1}
              </span>
              {!readOnly && options.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(option.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label
                  htmlFor={`en_text_${option.id}`}
                  className="text-xs font-medium text-gray-600"
                >
                  Option Text (EN)
                </Label>
                <Input
                  id={`en_text_${option.id}`}
                  type="text"
                  value={option.en_text}
                  onChange={(e) =>
                    updateOption(option.id, 'en_text', e.target.value)
                  }
                  placeholder="Enter option text (English)"
                  readOnly={readOnly}
                  className="mt-1"
                />
              </div>

              <div>
                <Label
                  htmlFor={`ar_text_${option.id}`}
                  className="text-xs font-medium text-gray-600"
                >
                  Option Text (AR)
                </Label>
                <Input
                  id={`ar_text_${option.id}`}
                  type="text"
                  value={option.ar_text}
                  onChange={(e) =>
                    updateOption(option.id, 'ar_text', e.target.value)
                  }
                  placeholder="Enter option text (Arabic)"
                  readOnly={readOnly}
                  className="mt-1"
                />
              </div>

              <div>
                <Label
                  htmlFor={`value_${option.id}`}
                  className="text-xs font-medium text-gray-600"
                >
                  Value (%)
                </Label>
                <Input
                  id={`value_${option.id}`}
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={option.value === '' ? '' : Number(option.value)}
                  onChange={(e) =>
                    updateOption(option.id, 'value', e.target.value)
                  }
                  placeholder="0-100"
                  readOnly={readOnly}
                  className={`mt-1 ${
                    option.value && !validatePercentage(option.value)
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }`}
                />
                {option.value && !validatePercentage(option.value) && (
                  <p className="text-red-500 text-xs mt-1">
                    Please enter a valid percentage (0–100)
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        {options.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No options added yet.</p>
            {!readOnly && (
              <p className="text-xs mt-1">Click "Add Option" to get started.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};