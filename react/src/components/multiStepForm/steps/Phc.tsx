// import { FormInput } from "../FormInput";
import { useEffect, useState } from "react";
import { FormSelect } from "../FormSelect";
import { type PhcInfo } from "../types";
import { toast } from "@/hooks/use-toast";
import { FormInput } from "../FormInput";

interface PhcProps {
  data: PhcInfo;
  onChange: (data: PhcInfo) => void;
  errors?: Record<string, string>;
}

interface PhcItem {
  value: string;
  label: string;
  phcCode?: string;
}

export const Phc = ({ data, onChange, errors = {} }: PhcProps) => {
  const [clusters, setClusters] = useState([]);
  const [zones, setZones] = useState([]);
  const [phc, setPhc] = useState<PhcItem[]>([]);

  const fetchClusters = async () => {
    try {
      const response = await fetch("/api/elts/clusters");
      if (!response.ok) {
        throw new Error("Failed to fetch clusters");
      }

      const json = await response.json();
      const clustersData = json.clusters;

      setClusters(clustersData);
    } catch (error) {
      console.error("Error fetching clusters:", error);
      setClusters([]);
      toast({
        title: "Error",
        description: "Failed to load clusters. Please try again later.",
        variant: "destructive",
        backgroundColor: "bg-red-600",
        color: "text-white",
      });
    }
  };

  const fetchZones = async (clusterId: string) => {
    try {
      if (!clusterId) {
        setZones([]);
        return;
      }

      const response = await fetch(`/api/elts/clusters/${clusterId}/zones`);
      if (!response.ok) {
        throw new Error("Failed to fetch zones");
      }

      const json = await response.json();
      const zonesData = json.zones;

      setZones(zonesData);
    } catch (error) {
      console.error("Error fetching zones:", error);
      setZones([]);
      toast({
        title: "Error",
        description: "Failed to load zones. Please try again later.",
        variant: "destructive",
        backgroundColor: "bg-red-600",
        color: "text-white",
      });
    }
  };

  const fetchPhc = async (zoneId: string) => {
    try {
      if (!zoneId) {
        setPhc([]);
        return;
      }

      const response = await fetch(
        `/api/elts/clusters/zones/${zoneId}/centers`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch primary health care");
      }

      const json = await response.json();
      const phcData = json.centers;

      setPhc(phcData);
    } catch (error) {
      console.error("Error fetching primary health care [PHC]:", error);
      setPhc([]);
      toast({
        title: "Error",
        description:
          "Failed to load primary health care [PHC]. Please try again later.",
        variant: "destructive",
        backgroundColor: "bg-red-600",
        color: "text-white",
      });
    }
  };

  useEffect(() => {
    fetchClusters();
  }, []);

  useEffect(() => {
    fetchZones(data.clusterId); // clusterName should store clusterId
  }, [data.clusterId]);

  useEffect(() => {
    fetchPhc(data.zoneId); // zoneName should store clusterId
  }, [data.zoneId]);

  const handleChange = (field: keyof PhcInfo, value: string) => {
    const newData = { ...data, [field]: value };

    // When cluster changes → reset zone + phc
    if (field === "clusterId") {
      newData.zoneId = "";
      newData.phcId = "";
      newData.phcName = "";
      newData.phcCode = "";
      setZones([]);
      setPhc([]);
    }

    // When zone changes → reset phc
    if (field === "zoneId") {
      newData.phcId = "";
      newData.phcName = "";
      newData.phcCode = "";
      setPhc([]);
    }

    // When PHC is selected → find its code
    if (field === "phcName") {
      const selected = phc.find((item) => item.value === value);

      if (selected) {
        newData.phcId = selected.value;
        newData.phcCode = selected.phcCode ?? "";
      }
    }

    onChange(newData);
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        Primary Health Care Information
      </h2>
      <p className="text-muted-foreground mb-6">
        Tell us about the primary health care
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSelect
          label="Cluster Name"
          name="clusterId"
          value={data.clusterId}
          onChange={(v) => handleChange("clusterId", v)}
          options={clusters}
          placeholder="Select clauster name"
          required
          error={errors.clusterName}
        />
        <FormSelect
          label="Zone Name"
          name="zoneId"
          value={data.zoneId}
          onChange={(v) => handleChange("zoneId", v)}
          options={zones}
          placeholder={
            data.clusterId
              ? zones.length === 0
                ? "Loading zones..."
                : "Select zone name"
              : "Select a cluster first"
          }
          required
          error={errors.zoneName}
        />
        <FormSelect
          label="Primary Health Care Name"
          name="phcName"
          value={data.phcName}
          onChange={(v) => handleChange("phcName", v)}
          options={phc}
          placeholder={
            data.zoneId
              ? phc.length === 0
                ? "Loading primary health care..."
                : "Select primary health care name"
              : "Select a zone first"
          }
          required
          error={errors.phcName}
        />
        <FormInput
          label="Primary Health Care Code"
          name="phcCode"
          value={data.phcCode}
          onChange={(v) => handleChange("phcCode", v)}
          placeholder="Primary health care code"
          disabled={true}
        />
      </div>
    </div>
  );
};
