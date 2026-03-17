import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
}

export default function StarRating({ rating, maxRating = 5, onRate, readonly = false, size = 20 }: StarRatingProps) {
  return (
    <div className="flex items-center space-x-1">
      {[...Array(maxRating)].map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= Math.round(rating);
        
        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            onClick={() => onRate?.(starValue)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'} focus:outline-none`}
          >
            <Star
              size={size}
              className={`${isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
            />
          </button>
        );
      })}
      {rating > 0 && (
        <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
