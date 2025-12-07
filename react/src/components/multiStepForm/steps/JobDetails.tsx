/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { FormInput } from "../FormInput";
import { FormSelect } from "../FormSelect";
import { toast } from "@/hooks/use-toast";
import type { JobDetailsInfo } from "../types";

interface JobDetailsProps {
  data: JobDetailsInfo;
  onChange: (data: JobDetailsInfo) => void;
  errors?: Record<string, string>;
}

export const JobDetails = ({
  data,
  onChange,
  errors = {},
}: JobDetailsProps) => {
  const [departments, setDepartments] = useState([]);
  const [feilds, setFields] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [ranks, setRanks] = useState([]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments/employee");
      if (!response.ok) {
        throw new Error("Failed to fetch departments");
      }

      const json = await response.json();
      const departmentsData = json.departments;

      setDepartments(departmentsData);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartments([]);
      toast({
        title: "Error",
        description: "Failed to load departments. Please try again later.",
        variant: "destructive",
        backgroundColor: "bg-red-600",
        color: "text-white",
      });
    }
  };

  const fetchFields = async () => {
    try {
      const response = await fetch("/api/sectors/employee");
      if (!response.ok) {
        throw new Error("Failed to fetch healthcare fields");
      }

      const json = await response.json();
      const fieldsData = json.sectors;

      setFields(fieldsData);
    } catch (error) {
      console.error("Error fetching healthcare fields:", error);
      setFields([]);
      toast({
        title: "Error",
        description:
          "Failed to load healthcare fields. Please try again later.",
        variant: "destructive",
        backgroundColor: "bg-red-600",
        color: "text-white",
      });
    }
  };

  const fetchSpecialities = async () => {
    try {
      const response = await fetch("/api/specialties/employee");
      if (!response.ok) {
        throw new Error("Failed to fetch healthcare specialties");
      }

      const json = await response.json();
      const specialtiesData = json.specialties;

      setSpecialties(specialtiesData);
    } catch (error) {
      console.error("Error fetching healthcare specialties:", error);
      setSpecialties([]);
      toast({
        title: "Error",
        description:
          "Failed to load healthcare specialties. Please try again later.",
        variant: "destructive",
        backgroundColor: "bg-red-600",
        color: "text-white",
      });
    }
  };

  const fetchRanks = async () => {
    try {
      const response = await fetch("/api/ranks/employee");
      if (!response.ok) {
        throw new Error("Failed to fetch healthcare ranks");
      }

      const json = await response.json();
      const ranksData = json.ranks;

      setRanks(ranksData);
    } catch (error) {
      console.error("Error fetching healthcare ranks:", error);
      setRanks([]);
      toast({
        title: "Error",
        description: "Failed to load healthcare ranks. Please try again later.",
        variant: "destructive",
        backgroundColor: "bg-red-600",
        color: "text-white",
      });
    }
  };

  const fetchShcCategory = async () => {
    try {
      if (!data.hcField || !data.hcSpecialty || !data.hcRank) {
        onChange({ ...data, shcCategory: "" });
        return;
      }

      const query = `?fieldId=${data.hcField}&specialtyId=${data.hcSpecialty}&rankId=${data.hcRank}`;

      const res = await fetch(`/api/categories/category${query}`);
      const json = await res.json();

      onChange({ ...data, shcCategory: json.category || "" });
    } catch (error) {
      console.error("Error fetching Saudi health council category:", error);
      setRanks([]);
      toast({
        title: "Error",
        description:
          "Failed to load Saudi health council category. Please try again later.",
        variant: "destructive",
        backgroundColor: "bg-red-600",
        color: "text-white",
      });
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchFields();
    fetchSpecialities();
    fetchRanks();
  }, []);

  useEffect(() => {
    fetchShcCategory();
  }, [data.hcRank]);

  const handleChange = (field: keyof JobDetailsInfo, value: string) => {
    const newData = { ...data, [field]: value };

    if (["hcField", "hcSpecialty", "hcRank"].includes(field)) {
      newData.shcCategory = "";
    }

    onChange(newData);
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        Current Job Details
      </h2>
      <p className="text-muted-foreground mb-6">
        Tell us about Current Job Details
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSelect
          label="Department Name"
          name="deptName"
          value={data.deptName}
          onChange={(v) => handleChange("deptName", v)}
          options={departments}
          placeholder="Select department name"
          required
          error={errors.deptName}
        />
        <FormSelect
          label="Healthcare Field"
          name="hcField"
          value={data.hcField}
          onChange={(v) => handleChange("hcField", v)}
          options={feilds}
          placeholder="Select healthcare field"
          required
          error={errors.hcField}
        />
        <FormSelect
          label="Healthcare Specialty"
          name="hcSpecialty"
          value={data.hcSpecialty}
          onChange={(v) => handleChange("hcSpecialty", v)}
          options={specialties}
          placeholder="Select healthcare specialty"
          required
          error={errors.hcSpecialty}
        />
        <FormSelect
          label="Healthcare Rank"
          name="hcRank"
          value={data.hcRank}
          onChange={(v) => handleChange("hcRank", v)}
          options={ranks}
          placeholder="Select healthcare rank"
          required
          error={errors.hcRank}
        />
        <FormInput
          label="Saudi Health Council Category"
          name="shcCategory"
          value={data.shcCategory}
          onChange={(v) => handleChange("shcCategory", v)}
          disabled={true}
        />
      </div>
    </div>
  );
};
