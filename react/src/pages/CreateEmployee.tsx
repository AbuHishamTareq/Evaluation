import Header from "@/components/dashboard/Header";
import { MultiStepForm } from "../components/multiStepForm/MultiStepsForm";

export const CreateEmployee = () => {
  return (
    <Header title={"Create Employee"}>
      <MultiStepForm />
    </Header>
  );
};
