import { createBrowserRouter } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import GuestLayout from "./layouts/GuestLayout";
import DefaultLayout from "./layouts/DefaultLayout";
import Dashboard from "./pages/Dashboard";
import Permission from "./pages/Permission";
import Roles from "./pages/Roles";
import User from "./pages/User";
import Unauthorized from "./pages/Unauthorized";
import Elt from "./pages/Elt";
import Zone from "./pages/Zone";
import Centers from "./pages/Center";
import Tbc from "./pages/Tbc";
import Domain from "./pages/Domain";
import Question from "./pages/Question";
import Section from "./pages/Section";
import Evaluation from "./pages/Evaluation";
import EvaluationForm from "./components/EvaluationForm";
import EvaluationCard from "./components/EvaluationCard";
import DynamicTableBuilder from "./pages/DynamicTableBuilder";
import Medication from "./pages/Medication";
import { Nationality } from "./pages/Nationality";
import { Sector } from "./pages/Sector";
import { Specialty } from "./pages/Specialty";
import { Rank } from "./pages/Rank";
import { Category } from "./pages/Category";
import { Employee } from "./pages/Employee";
import { CreateEmployee } from "./pages/CreateEmployee";
import { Department } from "./pages/Department";
import { Clinic } from "./pages/Clinic";
import { HcRole } from "./pages/HcRole";
import { TbcRole } from "./pages/TbcRole";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/",
    element: <GuestLayout />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
    ],
  },
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      {
        index: true,
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/permissions",
        element: <Permission />,
      },
      {
        path: "/roles",
        element: <Roles />,
      },
      {
        path: "/users",
        element: <User />,
      },
      {
        path: "/unauthorized",
        element: <Unauthorized />,
      },
      {
        path: "/elts",
        element: <Elt />,
      },
      {
        path: "/elts",
        element: <Elt />,
      },
      {
        path: "/zones",
        element: <Zone />,
      },
      {
        path: "/centers",
        element: <Centers />,
      },
      {
        path: "/tbcs",
        element: <Tbc />,
      },
      {
        path: "/sections",
        element: <Section />,
      },
      {
        path: "/domains",
        element: <Domain />,
      },
      {
        path: "/questions",
        element: <Question />,
      },
      {
        path: "/evaluations",
        element: <Evaluation />,
      },
      {
        path: "/evaluations/evaluation-form",
        element: <EvaluationCard />,
      },
      {
        path: "/evaluations/:section/:evalId",
        element: <EvaluationForm />,
      },
      {
        path: "/dynamic-table",
        element: <DynamicTableBuilder />,
      },
      {
        path: "/medications",
        element: <Medication />,
      },
      {
        path: "/nationality",
        element: <Nationality />,
      },
      {
        path: "/sectors",
        element: <Sector />,
      },
      {
        path: "/specialties",
        element: <Specialty />,
      },
      {
        path: "/ranks",
        element: <Rank />,
      },
      {
        path: "/categories",
        element: <Category />,
      },
      {
        path: "/employees",
        element: <Employee />,
      },
      {
        path: "/employees/create",
        element: <CreateEmployee />,
      },
      {
        path: "/departments",
        element: <Department />,
      },
      {
        path: "/clinics",
        element: <Clinic />,
      },
      {
        path: "/healthcareRoles",
        element: <HcRole />,
      },
      {
        path: "/tbcroles",
        element: <TbcRole />,
      },
    ],
  },
]);

export default router;
