/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Star } from 'lucide-react';

export const RatingField = ({ name, value, onChange }: any) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="space-y-2">
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`transition-colors ${star <= (hover || value) ? 'text-blue-500' : 'text-gray-300'}`}
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
