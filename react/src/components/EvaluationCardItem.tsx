/* eslint-disable react-hooks/exhaustive-deps */
import { Card, CardFooter, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useApp } from "../hooks/useApp";
import api from "../axios";
import { useEffect } from "react";

type Section = {
    en_label: string;
    name: string;
};

type Evaluation = {
    image_url?: string;
    section: Section;
    title: string;
    name: string;
    en_description?: string;
};

interface EvaluationCardItemProps {
    evaluation: Evaluation;
}

const EvaluationCardItem: React.FC<EvaluationCardItemProps> = ({ evaluation }) => {
    const navigate = useNavigate();
    const { user } = useApp();

    const fetchFromCenterSurveyResponse = async () => {
        const today = new Date();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();

        const res = await api.get('/api/evaluations/center-survey-response', {
            params: {
                center_id: user?.center_id,
                section_id: evaluation.name,
                month: month,
                year: year,
            }
        });

        console.log(res.data);
    }

    useEffect(() => {
        fetchFromCenterSurveyResponse();
    }, []);

    const handleStartEvaluation = () => {
        const section = evaluation.section.name;
        const evalId = encodeURIComponent(evaluation.name); // Or use a real ID
        navigate(`/evaluations/${section}/${evalId}`);
    };

    return (
        <Card className="group overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-105 border-0 bg-card">
            <div className="relative overflow-hidden">
                <img
                    src={evaluation.image_url || './images/logo.png'}
                    alt={evaluation.title}
                    onError={(e) => {
                        e.currentTarget.onerror = null; // prevent infinite loop
                        e.currentTarget.src = './images/logo.png';
                    }}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                    <Badge className="bg-primary/90 backdrop-blur-sm text-black ">
                        {evaluation.section.en_label}
                    </Badge>
                </div>
            </div>

            <CardHeader className="pb-3">
                <h3 className="text-xl font-semibold text-card-foreground group-hover:text-sky-600 transition-colors">
                    {evaluation.title}
                </h3>
                {evaluation.en_description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {evaluation.en_description}
                    </p>
                )}
            </CardHeader>

            <CardFooter className="pt-0">
                <Button
                    onClick={handleStartEvaluation}
                    className="w-full bg-primary-gradient hover:opacity-90 transition-opacity shadow-lg"
                >
                    Start Evaluation
                </Button>
            </CardFooter>
        </Card>
    );
};

export default EvaluationCardItem;