/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { FormInput } from "../FormInput";
import { FormSelect } from "../FormSelect";
import { toast } from "@/hooks/use-toast";
import type { JobDetailsInfo } from "../types";
import { parseISO, isValid, intervalToDuration } from "date-fns";
import { FormCheckbox } from "../FormCheckbox";

interface JobDetailsProps {
  data: JobDetailsInfo;
  onChange: (data: JobDetailsInfo) => void;
  errors?: Record<string, string>;
  phcId: string;
}

export const JobDetails = ({
  data,
  onChange,
  errors = {},
  phcId,
}: JobDetailsProps) => {
  const [departments, setDepartments] = useState([]);
  const [feilds, setFields] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [ranks, setRanks] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [hcRoles, setHcRoles] = useState([]);
  const [tenure, setTenure] = useState<{
    years: string;
    months: string;
    days: string;
  }>({ years: "", months: "", days: "" });
  const [hireTenure, setHireTenure] = useState<{
    hireYears: string;
    hireMonths: string;
    hireDays: string;
  }>({ hireYears: "", hireMonths: "", hireDays: "" });
  const [tbcs, setTbcs] = useState([]);
  const [tbcRoles, setTbcRoles] = useState([]);

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

  const fetchClinics = async () => {
    try {
      const response = await fetch("/api/clinics/employee");
      if (!response.ok) {
        throw new Error("Failed to fetch clinics");
      }

      const json = await response.json();
      const clinicsData = json.clinics;

      setClinics(clinicsData);
    } catch (error) {
      console.error("Error fetching clinics:", error);
      setClinics([]);
      toast({
        title: "Error",
        description: "Failed to load clinics. Please try again later.",
        variant: "destructive",
        backgroundColor: "bg-red-600",
        color: "text-white",
      });
    }
  };

  const fetchHcRoles = async () => {
    try {
      const response = await fetch("/api/healthcareRoles/employee");
      if (!response.ok) {
        throw new Error("Failed to fetch healthcare roles");
      }

      const json = await response.json();
      const hcRolesData = json.hcRoles;

      setHcRoles(hcRolesData);
    } catch (error) {
      console.error("Error fetching healthcare roles:", error);
      setHcRoles([]);
      toast({
        title: "Error",
        description: "Failed to load healthcare roles. Please try again later.",
        variant: "destructive",
        backgroundColor: "bg-red-600",
        color: "text-white",
      });
    }
  };

  const fetchTbcs = async (phcId: string) => {
    try {
      console.log("Fetching team based code for PHC ID:", phcId);
      const response = await fetch(`/api/tbcs/phc/${phcId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch team based code");
      }

      const json = await response.json();
      const tbcsData = json.tbcs;

      console.log("Fetched team based code:", tbcsData);
      setTbcs(tbcsData);
    } catch (error) {
      console.error("Error fetching team based code:", error);
      setTbcs([]);
      toast({
        title: "Error",
        description: "Failed to load team based code. Please try again later.",
        variant: "destructive",
        backgroundColor: "bg-red-600",
        color: "text-white",
      });
    }
  };

  const fetchTbcRoles = async () => {
    try {
      const response = await fetch("/api/tbcRoles/employee");
      if (!response.ok) {
        throw new Error("Failed to fetch team base code roles");
      }

      const json = await response.json();
      const tbcRolesData = json.tbcRoles;

      setTbcRoles(tbcRolesData);
    } catch (error) {
      console.error("Error fetching tean based code roles:", error);
      setHcRoles([]);
      toast({
        title: "Error",
        description:
          "Failed to load team based code roles. Please try again later.",
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
    fetchClinics();
    fetchHcRoles();
  }, []);

  useEffect(() => {
    fetchShcCategory();
  }, [data.hcRank]);

  useEffect(() => {
    if (!data.joiningDate) {
      setTenure({ years: "", months: "", days: "" });
      return;
    }

    const joinDate = parseISO(data.joiningDate);
    const today = new Date();

    if (!isValid(joinDate) || joinDate > today) {
      setTenure({ years: "", months: "", days: "" });
      return;
    }

    const duration = intervalToDuration({ start: joinDate, end: today });

    setTenure({
      years: String(duration.years ?? 0),
      months: String(duration.months ?? 0),
      days: String(duration.days ?? 0),
    });
  }, [data.joiningDate]);

  useEffect(() => {
    if (!data.hireDate) {
      setHireTenure({ hireYears: "", hireMonths: "", hireDays: "" });
      return;
    }

    const hireDate = parseISO(data.hireDate);
    const today = new Date();

    if (!isValid(hireDate) || hireDate > today) {
      setHireTenure({ hireYears: "", hireMonths: "", hireDays: "" });
      return;
    }

    const duration = intervalToDuration({ start: hireDate, end: today });

    setHireTenure({
      hireYears: String(duration.years ?? 0),
      hireMonths: String(duration.months ?? 0),
      hireDays: String(duration.days ?? 0),
    });
  }, [data.hireDate]);

  useEffect(() => {
    if (data.isCareTeam && phcId) {
      fetchTbcs(phcId);
      fetchTbcRoles();
    } else {
      setTbcs([]);
      setTbcRoles([]);
      if (data.tbc) handleChange("tbc", "");
      if (data.tbcRole) handleChange("tbcRole", "");
    }
  }, [phcId, data.isCareTeam]);

  const handleChange = (
    field: keyof JobDetailsInfo,
    value: string | boolean
  ) => {
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
        <FormInput
          label="Employee No."
          name="empNo"
          value={data.empNo}
          onChange={(v) => handleChange("empNo", v)}
          placeholder="Enter employee Employee No."
          required
          error={errors.empNo}
          className="md:col-span-2"
        />
        <FormInput
          label="Hire Date"
          name="hireDate"
          type="date"
          value={data.hireDate}
          onChange={(v) => handleChange("hireDate", v)}
          required
          error={errors.hireDate}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <FormInput
            label="Years"
            name="hireYear"
            value={hireTenure.hireYears}
            disabled={true}
            placeholder="Years"
          />
          <FormInput
            label="Months"
            name="hireMonth"
            value={hireTenure.hireMonths}
            disabled={true}
            placeholder="Months"
          />
          <FormInput
            label="Days"
            name="hireDay"
            value={hireTenure.hireDays}
            disabled={true}
            placeholder="Days"
          />
        </div>
        <FormInput
          label="Joining Date"
          name="joiningDate"
          type="date"
          value={data.joiningDate}
          onChange={(v) => handleChange("joiningDate", v)}
          required
          error={errors.joiningDate}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <FormInput
            label="Years"
            name="year"
            value={tenure.years}
            disabled={true}
            placeholder="Years"
          />
          <FormInput
            label="Months"
            name="month"
            value={tenure.months}
            disabled={true}
            placeholder="Months"
          />
          <FormInput
            label="Days"
            name="day"
            value={tenure.days}
            disabled={true}
            placeholder="Days"
          />
        </div>
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
          label="Clinic Assignment"
          name="clinicName"
          value={data.clinicName}
          onChange={(v) => handleChange("clinicName", v)}
          options={clinics}
          placeholder="Select clinic Assignment"
          required
          error={errors.clinicName}
        />
        <FormSelect
          label="Healthcare Role & administration"
          name="hcRoleName"
          value={data.hcRoleName}
          onChange={(v) => handleChange("hcRoleName", v)}
          options={hcRoles}
          placeholder="Select healthcare Role & administration"
          required
          error={errors.hcRoleName}
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
          placeholder="Saudi Health Council Category"
        />
        <FormSelect
          label="Contract Type"
          name="contract"
          value={data.contract}
          onChange={(v) => handleChange("contract", v)}
          options={[
            { value: "moh", label: "MOH" },
            { value: "auto", label: "Auto Contract" },
          ]}
          placeholder="Select contract type"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <FormCheckbox
          label="Is Care Provider"
          name="isCareProvider"
          checked={data.isCareProvider}
          onChange={(checked) => handleChange("isCareProvider", checked)}
          className="md:col-span-2 mt-2"
        />
        <FormCheckbox
          label="Is Care Team"
          name="isCareTeam"
          checked={data.isCareTeam}
          onChange={(checked) => handleChange("isCareTeam", checked)}
          className="md:col-span-2 mt-2"
        />
        {data.isCareTeam && (
          <>
            <FormSelect
              label="Team Based Code"
              name="tbc"
              value={data.tbc ?? ""}
              onChange={(v) => handleChange("tbc", v)}
              options={tbcs}
              placeholder="Select team based code"
            />
            <FormSelect
              label="Team Based Code Role"
              name="tbcRole"
              value={data.tbcRole}
              onChange={(v) => handleChange("tbcRole", v)}
              options={tbcRoles}
              placeholder="Select team based code Role"
            />
          </>
        )}
      </div>
    </div>
  );
};
