import { useApp } from "../hooks/useApp";
import Header from "../components/dashboard/Header";
import EvaluationList from "../components/EvaluationList";
import EvaluationCard from "../components/EvaluationCard";

const Evaluation = () => {
  const { user } = useApp();

  const userRole = user?.roles;

  return (
    <Header title="Evaluation List">
      {
        !(userRole?.includes('super-admin') || userRole?.includes('admin')) ? (
          <div className="min-h-screen relative overflow-hidden bg-white">

            {/* Main Content */}
            <div className="relative z-10 flex py-10 px-10 justify-center min-h-screen ">
              <div className="w-full">
                <EvaluationCard />
              </div>
            </div>

            {/* Decorative Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
          </div>
        ) : (
          <EvaluationList />
        )
      }
    </Header>
  );
};

export default Evaluation;