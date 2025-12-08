import { useEffect, useState } from "react";
import { FormInput } from "../FormInput";
import { FormSelect } from "../FormSelect";
import { type PersonalInfo } from "../types";
import { toast } from "@/hooks/use-toast";

interface PersonalProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
  errors?: Record<string, string>;
}

export const Personal = ({ data, onChange, errors = {} }: PersonalProps) => {
  const [nationalities, setNationalities] = useState([]);

  const fetchNationalities = async () => {
    try {
      const response = await fetch(`/api/nationalities/employee`);
      if (!response.ok) {
        throw new Error("Failed to fetch nationalities");
      }

      const json = await response.json();
      const nationalitiesData = json.nationalities;

      setNationalities(nationalitiesData);
    } catch (error) {
      console.error("Error fetching nationalities:", error);
      setNationalities([]);
      toast({
        title: "Error",
        description: "Failed to load nationalities. Please try again later.",
        variant: "destructive",
        backgroundColor: "bg-red-600",
        color: "text-white",
      });
    }
  };

  useEffect(() => {
    fetchNationalities();
  }, []);

  const handleChange = (field: keyof PersonalInfo, value: string) => {
    const newData = { ...data, [field]: value };

    // Calculate age if dateOfBirth is updated
    if (field === "dateOfBirth" && value) {
      const today = new Date();
      const dob = new Date(value);
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--; // adjust if birthday hasn't occurred yet this year
      }
      newData.age = age.toString();
    }

    onChange(newData);
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        Employee Personal Information
      </h2>
      <p className="text-muted-foreground mb-6">Tell us about yourself</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Full Name"
          name="fullName"
          value={data.fullName}
          onChange={(v) => handleChange("fullName", v)}
          placeholder="Enter employee full name"
          required
          error={errors.fullName}
          className="md:col-span-2"
        />
        <FormSelect
          label="Employee ID Type"
          name="employeeIdType"
          value={data.employeeIdType}
          onChange={(v) => handleChange("employeeIdType", v)}
          options={[
            { value: "National", label: "National" },
            { value: "Iqama", label: "Iqama" },
          ]}
          placeholder="Select ID type"
          required
          error={errors.employeeIdType}
        />
        <FormInput
          label="National / Iqama ID"
          name="employeeId"
          value={data.employeeId}
          onChange={(v) => handleChange("employeeId", v)}
          placeholder="Enter employee National / Iqama ID"
          required
          error={errors.employeeId}
        />
        <FormInput
          label="Email Address"
          name="email"
          type="email"
          value={data.email}
          onChange={(v) => handleChange("email", v)}
          placeholder="john@example.com"
          required
          error={errors.email}
        />
        <FormInput
          label="Mobile Number"
          name="mobile"
          type="tel"
          value={data.mobile}
          onChange={(v) => handleChange("mobile", v)}
          placeholder="05X XXX XXXX"
        />
        <FormSelect
          label="Gender"
          name="gender"
          value={data.gender}
          onChange={(v) => handleChange("gender", v)}
          options={[
            { value: "M", label: "Male" },
            { value: "F", label: "Female" },
          ]}
          placeholder="Select gender"
        />
        <FormInput
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          value={data.dateOfBirth}
          onChange={(v) => handleChange("dateOfBirth", v)}
        />
        <FormInput
          label="Age"
          name="age"
          value={data.age}
          onChange={(v) => handleChange("age", v)}
          disabled={true}
          placeholder="Age"
        />
        <FormSelect
          label="Nationality"
          name="nationalityId"
          value={data.nationalityId}
          onChange={(v) => handleChange("nationalityId", v)}
          options={nationalities}
          placeholder="Select nationality"
        />
        <FormInput
          label="Address"
          name="address"
          value={data.address}
          onChange={(v) => handleChange("address", v)}
          placeholder="Your full address"
          className="md:col-span-2"
        />
      </div>
    </div>
  );
};
