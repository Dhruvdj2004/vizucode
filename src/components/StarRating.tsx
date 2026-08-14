import { useState } from 'react';

/** Interactive 1-5 star picker, and a read-only display mode for past submissions. */
export function StarRating({
  value,
  onChange,
  readOnly = false,
}: {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className={`star-rating${readOnly ? ' readonly' : ''}`} role={readOnly ? undefined : 'radiogroup'} aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className="star"
          disabled={readOnly}
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
          aria-pressed={!readOnly && value === n}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(0)}
        >
          {n <= shown ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
}
