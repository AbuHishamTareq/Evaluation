/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, type FormEvent } from "react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  TextField,
  TextareaField,
  SelectField,
  RadioGroupField,
  CheckboxField,
  GroupedCheckboxField,
} from "./form-fields";
import { OptionsField } from "./form-fields/OptionsField";
import type { CustomModelFormProps, FieldsProps } from "../types/types";
import { useApp } from "../hooks/useApp";
import { hasPermission } from "../lib/authorization";
import { SelectWithSearchField } from "./form-fields/SelectWithSearchField";
import { MultiSelect } from "./form-fields/MultiSelectList";
import { FilePickerField } from "./form-fields/FilePickerField";

export function CustomModelForm({
  addButton,
  title,
  description,
  fields,
  buttons,
  onSubmit,
  open,
  onOpenChange,
  initialValues,
  readOnly = false,
  mode = "create",
  extraData,
}: CustomModelFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const { user } = useApp();

  useEffect(() => {
    setFormData(
      fields.reduce((acc, field) => {
        const initial = field.value ?? initialValues?.[field.name];

        if (field.type === "checkbox") {
          acc[field.name] = initial !== undefined ? initial : false;
        } else if (field.type === "grouped-checkboxes") {
          acc[field.name] = Array.isArray(initial) ? initial : [];
        } else if (field.type === "select") {
          acc[field.name] = initial !== undefined ? initial : "";
        } else if (field.type === "options") {
          acc[field.name] = Array.isArray(initial) ? initial : [];
        } else if (field.type === "file") {
          // For file fields, handle both File objects and string paths
          if (initial instanceof File) {
            acc[field.name] = initial;
          } else if (typeof initial === "string" && initial !== "") {
            // This is an existing image path from the server
            acc[field.name] = initial;
          } else {
            acc[field.name] = null;
          }
        } else {
          acc[field.name] = initial !== undefined ? initial : "";
        }

        return acc;
      }, {} as Record<string, any>)
    );
  }, [fields, initialValues]);

  useEffect(() => {
    if (!open) {
      setErrors({});
    }
  }, [open]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, type, value } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: [] }));
  };

  const handleSelectChange = (fieldName: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    setErrors((prev) => ({ ...prev, [fieldName]: [] }));
  };

  const handleOptionsChange = (fieldName: string) => (options: any[]) => {
    setFormData((prev) => ({ ...prev, [fieldName]: options }));
    setErrors((prev) => ({ ...prev, [fieldName]: [] }));
  };

  const handleFileChange = (fieldName: string) => (file: File | null) => {
    setFormData((prev) => ({ ...prev, [fieldName]: file }));
    setErrors((prev) => ({ ...prev, [fieldName]: [] }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      onSubmit(formData, setErrors);
    } catch {
      // Form submission failed, don't close dialog
    }
  };

  const shouldShowField = (field: FieldsProps): boolean => {
    // Check if field has conditional display based on another field's value
    if (field.conditionalDisplay && Array.isArray(field.conditionalDisplay)) {
      const typeField = fields.find((f) => f.name === "type");
      if (typeField) {
        const currentType = formData["type"];
        return field.conditionalDisplay.includes(currentType);
      }
    }
    return true;
  };

  const renderField = (field: FieldsProps) => {
    const isHiddenPassword = field.type === "password" && mode !== "create";
    const isRestrictedCenter = field.name === "center" && user?.center_id;

    if (isHiddenPassword) return null;
    if (isRestrictedCenter) return null;
    if (!shouldShowField(field)) return null;

    const commonProps = {
      id: field.id,
      name: field.name,
      label: field.label,
      value: formData[field.name],
      readOnly,
      errors: errors[field.name] || [],
    };

    switch (field.type) {
      case "text":
      case "number":
      case "date":
      case "password":
      case "email":
        return (
          <TextField
            key={field.key}
            {...commonProps}
            type={field.type}
            onChange={handleInputChange}
            placeholder={field.placeholder}
            autocomplete={field.autocomplete}
            tabIndex={field.tabIndex}
            autoFocus={field.autoFocus}
            mode={mode}
            isArabic={field.isArabic}
          />
        );
      case "textarea":
        return (
          <TextareaField
            key={field.key}
            {...commonProps}
            onChange={handleInputChange}
            rows={field.rows}
            placeholder={field.placeholder}
            autocomplete={field.autocomplete}
            tabIndex={field.tabIndex}
            mode={mode}
            isArabic={field.isArabic}
          />
        );

      case "select":
        return (
          <SelectField
            key={field.key}
            {...commonProps}
            options={field.options}
            selectLabel={field.selectLabel}
            extraData={extraData}
            onValueChange={handleSelectChange(field.name)}
            onChange={handleInputChange}
            mode={mode}
          />
        );

      case "radio":
        return (
          <RadioGroupField
            key={field.key}
            {...commonProps}
            options={field.options || []}
            onChange={handleInputChange}
          />
        );

      case "checkbox":
        return (
          <CheckboxField
            key={field.key}
            {...commonProps}
            checked={formData[field.name]}
            onChange={handleInputChange}
          />
        );

      case "grouped-checkboxes":
        return (
          <GroupedCheckboxField
            key={field.key}
            {...commonProps}
            extraData={extraData}
            setFormData={setFormData}
            setErrors={setErrors}
            onChange={handleInputChange} // This is required by the interface but not used
          />
        );

      case "options":
        return (
          <OptionsField
            key={field.key}
            {...commonProps}
            label={field.label ?? ""}
            onChange={handleOptionsChange(field.name)}
          />
        );
      case "select-with-search":
        return (
          <SelectWithSearchField
            key={field.key}
            id={field.id}
            name={field.name}
            label={field.label}
            selectLabel={field.selectLabel}
            value={formData[field.name]}
            onValueChange={handleSelectChange(field.name)}
            onChange={handleInputChange}
            extraData={extraData}
            readOnly={readOnly}
            errors={errors[field.name] || []}
            mode={mode}
          />
        );
      case "multi-select":
        return (
          <MultiSelect
            key={field.key}
            {...commonProps}
            extraData={extraData}
            onValueChange={(value: string[]) => {
              setFormData((prev) => ({ ...prev, [field.name]: value }));
              setErrors((prev) => ({ ...prev, [field.name]: [] }));
            }}
            variant="inverted"
            maxCount={7}
            defaultValue={
              Array.isArray(formData[field.name]) ? formData[field.name] : []
            }
            readOnly={readOnly}
          />
        );
      case "file":
        return (
          <FilePickerField
            key={field.key}
            {...commonProps}
            value={formData[field.name]}
            onChange={handleInputChange}
            onFileChange={handleFileChange(field.name)}
            accept={field.accept}
            maxSize={field.maxSize}
            placeholder={field.placeholder}
            showPreview={field.showPreview}
          />
        );
      default:
        return null;
    }
  };

  const showAddButton =
    !addButton.permission ||
    (user?.permissions &&
      hasPermission(addButton.permission, user.permissions));

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      {showAddButton && (
        <DialogTrigger asChild>
          <Button
            label={addButton.label}
            key={addButton.key}
            type={addButton.type}
            id={addButton.id}
            variant={addButton.variant}
            className={addButton.className}
          >
            {addButton.icon && <addButton.icon />}
            {addButton.label}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:max-w-[830px] border-cyan-200 bg-gradient-to-br from-cyan-100 to-blue-400"
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-cyan-200 pb-4">
            <DialogTitle className="text-cyan-800 text-xl font-semibold">
              {title}
            </DialogTitle>
            <DialogDescription className="text-cyan-600">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2 bg-transparent scrollbar-thin scrollbar-thumb-cyan-300 scrollbar-track-cyan-100">
            {fields.map(renderField)}
          </div>

          <DialogFooter className="gap-2 mt-4 pt-4 border-t border-cyan-200">
            <DialogClose asChild>
              <Button
                key="cancel-btn"
                id="cancel-btn"
                label=""
                type="button"
                variant="outline"
                className="bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl"
              >
                Cancel
              </Button>
            </DialogClose>

            {mode !== "view" &&
              buttons.map((button) => (
                <Button
                  label={button.label}
                  key={button.key}
                  id={button.id}
                  type={button.type}
                  variant={button.variant}
                  className={button.className}
                >
                  {button.label}
                </Button>
              ))}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
