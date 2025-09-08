import { useState } from "react";
import { Label } from "../ui/label";
import { Star } from "lucide-react";
import type { RatingFieldProps } from "@/types/types";

const RatingField: React.FC<RatingFieldProps> = ({ name, label, value, onChange }) => {
  const [hover, setHover] = useState<number>(0);
  
  return (
    <div className="space-y-2">
      <Label className="text-blue-900 font-medium">{label}</Label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`transition-colors ${
              star <= (hover || value) ? 'text-blue-500' : 'text-gray-300'
            }`}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(name, star)}
          >
            <Star className="w-6 h-6 fill-current" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default RatingField;