export interface PhcInfo {
  clusterId: string;
  clusterName: string;
  zoneId: string;
  zoneName: string;
  phcId: string;
  phcName: string;
  phcCode: string;
}

export interface PersonalInfo {
  fullName: string;
  employeeId: string;
  employeeIdType: string;
  email: string;
  mobile: string;
  gender: string;
  dateOfBirth: string;
  age: string;
  nationalityId: string;
  nationality: string;
  address: string;
}

export interface JobDetailsInfo {
  deptName: string;
  hcField: string;
  hcSpecialty: string;
  hcRank: string;
  shcCategory: string;
  clinicName: string;
  hcRoleName: string;
  joiningDate: string;
  hireDate: string;
  isCareProvider: boolean;
  isCareTeam: boolean;
  tbc: string;
  tbcRole: string;
  contract: string;
  empNo: string;
}

export interface Education {
  degree: string;
  institution: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

export interface Experience {
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Course {
  courseName: string;
  provider: string;
  completionDate: string;
  certificateUrl: string;
}

export interface CurrentJob {
  jobTitle: string;
  company: string;
  department: string;
  salary: string;
  startDate: string;
  employmentType: string;
  responsibilities: string;
}

export interface Documents {
  profilePhoto: File | null;
  cv: File | null;
  certificates: File[];
}

export interface FormData {
  phcInfo: PhcInfo;
  personalInfo: PersonalInfo;
  jobDetailsInfo: JobDetailsInfo;
  education: Education[];
  experiences: Experience[];
  courses: Course[];
  currentJob: CurrentJob;
  documents: Documents;
}

export const initialFormData: FormData = {
  phcInfo: {
    clusterId: "",
    clusterName: "",
    zoneId: "",
    zoneName: "",
    phcId: "",
    phcName: "",
    phcCode: "",
  },
  personalInfo: {
    fullName: "",
    employeeId: "",
    employeeIdType: "",
    email: "",
    mobile: "",
    gender: "",
    dateOfBirth: "",
    age: "",
    nationalityId: "",
    nationality: "",
    address: "",
  },
  jobDetailsInfo: {
    deptName: "",
    hcField: "",
    hcSpecialty: "",
    hcRank: "",
    shcCategory: "",
    clinicName: "",
    hcRoleName: "",
    joiningDate: "",
    hireDate: "",
    isCareProvider: false,
    isCareTeam: false,
    tbc: "",
    tbcRole: "",
    contract: "",
    empNo: "",
  },
  education: [
    {
      degree: "",
      institution: "",
      field: "",
      startDate: "",
      endDate: "",
      gpa: "",
    },
  ],
  experiences: [
    {
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  ],
  courses: [
    {
      courseName: "",
      provider: "",
      completionDate: "",
      certificateUrl: "",
    },
  ],
  currentJob: {
    jobTitle: "",
    company: "",
    department: "",
    salary: "",
    startDate: "",
    employmentType: "",
    responsibilities: "",
  },
  documents: {
    profilePhoto: null,
    cv: null,
    certificates: [],
  },
};
