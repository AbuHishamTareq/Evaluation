/* eslint-disable @typescript-eslint/no-explicit-any */
import { ErrorMessage, Field, type FormikProps } from "formik";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { Input } from "./ui/input";

export interface Medication {
  id: string | number;
  [key: string]: any;
  drug_name: string;
  allocation: string;
  standard_quantity: number;
}

export interface FieldType {
  id: string | number;
  control_type: string;
  options?: { en_text: string; ar_text: string; value: string }[];
  header_id: string | number;
}

export interface TableHeaders {
  id: string | number;
  header_en: string;
  header_ar: string;
  slug: string;
  order: number;
  fields?: FieldType[]; // 👈 array of fields now
}

interface MedicationSurveyStepProps {
  formik: FormikProps<any>;
  medications: Medication[];
  headers: TableHeaders[];
}

const MedicationDynamicTable: React.FC<MedicationSurveyStepProps> = ({
  medications,
  headers,
}) => {
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-50">
              {headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="font-semibold text-blue-900 text-center"
                >
                  {header.header_en}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {medications.map((med) => (
              <TableRow key={med.id} className="hover:bg-blue-25 text-center">
                {headers.map((header) => (
                  <TableCell key={header.id}>
                    {header.fields?.map((field) => {
                      const fieldName = `${med.id}_${field.id}`;

                      switch (field.control_type) {
                        case "label": {
                          // Map header to the correct medication property
                          let value: string | number = "-";
                          if (header.slug === "drug-name")
                            value = med.drug_name;
                          else if (header.slug === "allocation")
                            value = med.allocation;
                          else if (header.slug === "standard-quantity")
                            value = med.standard_quantity;

                          return (
                            <span
                              key={field.id}
                              className="font-medium text-blue-900"
                            >
                              {value}
                            </span>
                          );
                        }

                        case "number":
                          return (
                            <Field name={fieldName} key={field.id}>
                              {({ field: formikField }: any) => (
                                <Input
                                  {...formikField}
                                  type="number"
                                  placeholder="0"
                                  min={0}
                                />
                              )}
                            </Field>
                          );

                        case "select":
                          return (
                            <Field name={fieldName} key={field.id}>
                              {({ field: formikField, form }: any) => {
                                type Option = {
                                  en_text: string;
                                  ar_text: string;
                                  value: string;
                                };
                                let options: Option[] = [];

                                if (typeof field.options === "string") {
                                  try {
                                    const parsed = JSON.parse(field.options);
                                    if (
                                      parsed &&
                                      Array.isArray(parsed.options)
                                    ) {
                                      options = parsed.options as Option[];
                                    }
                                  } catch (err) {
                                    console.error(
                                      "Failed to parse options JSON:",
                                      err
                                    );
                                  }
                                }
                                // ✅ object with .options
                                else if (
                                  field.options &&
                                  typeof field.options === "object" &&
                                  "options" in field.options &&
                                  Array.isArray((field.options as any).options)
                                ) {
                                  options = (
                                    field.options as { options: Option[] }
                                  ).options;
                                }
                                // ✅ already an array
                                else if (Array.isArray(field.options)) {
                                  options = field.options as Option[];
                                }

                                return (
                                  <div className="space-y-1">
                                    <Select
                                      value={formikField.value || ""}
                                      onValueChange={(val) =>
                                        form.setFieldValue(fieldName, val)
                                      }
                                    >
                                      <SelectTrigger className="border-blue-200 focus:ring-blue-500">
                                        <SelectValue placeholder="Select" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {options.map((opt) => (
                                          <SelectItem
                                            key={opt.value}
                                            value={opt.value}
                                          >
                                            {opt.en_text}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <ErrorMessage
                                      name={fieldName}
                                      component="div"
                                      className="text-red-500 text-xs"
                                    />
                                  </div>
                                );
                              }}
                            </Field>
                          );

                        case "text":
                        case "textarea":
                          return (
                            <Field name={fieldName} key={field.id}>
                              {({ field: formikField }: any) => (
                                <Input
                                  {...formikField}
                                  type="text"
                                  placeholder=""
                                />
                              )}
                            </Field>
                          );

                        default:
                          return <span key={field.id}>-</span>;
                      }
                    })}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MedicationDynamicTable;
