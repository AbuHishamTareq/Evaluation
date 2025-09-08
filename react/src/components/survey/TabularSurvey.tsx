import { Field, ErrorMessage } from 'formik';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { availabilityOptions, products } from '../../types/types';

const TabularSurvey = () => {
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-50">
              <TableHead className="font-semibold text-blue-900">Drug Name</TableHead>
              <TableHead className="font-semibold text-blue-900">Availability</TableHead>
              <TableHead className="font-semibold text-blue-900">Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="hover:bg-blue-25">
                <TableCell className="font-medium text-blue-900">
                  {product.name}
                </TableCell>
                <TableCell className="w-48">
                  <Field name={`${product.id}_availability`}>
                    {({ field, form }: import('formik').FieldProps) => (
                      <div className="space-y-1">
                        <Select
                          value={field.value ?? ''} // 👈 ensure defined value
                          onValueChange={(value) =>
                            form.setFieldValue(`${product.id}_availability`, value)
                          }
                        >
                          <SelectTrigger className="border-blue-200 focus:ring-blue-500">
                            <SelectValue placeholder="Select availability" />
                          </SelectTrigger>
                          <SelectContent>
                            {availabilityOptions.map((option) => (
                              <SelectItem key={option.value} value={option.label}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <ErrorMessage
                          name={`${product.id}_availability`}
                          component="div"
                          className="text-red-500 text-xs"
                        />
                      </div>
                    )}
                  </Field>
                </TableCell>
                <TableCell className="w-32">
                  <Field name={`${product.id}_quantity`}>
                    {({ field, form }: import('formik').FieldProps) => (
                      <div className="space-y-1">
                        <Input
                          {...field}
                          type="number"
                          value={field.value ?? ''} // 👈 ensure controlled input
                          placeholder="0"
                          className="border-blue-200 focus:ring-blue-500"
                          onChange={(e) =>
                            form.setFieldValue(`${product.id}_quantity`, e.target.value)
                          }
                        />
                        <ErrorMessage
                          name={`${product.id}_quantity`}
                          component="div"
                          className="text-red-500 text-xs"
                        />
                      </div>
                    )}
                  </Field>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TabularSurvey;
