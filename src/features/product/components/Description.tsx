import { useId, useRef, useState } from 'react';
import { EXCERPT_LENGTH, excerpt } from '../../../utils/text';

interface DescriptionProps {
  html: string;
  text: string;
}

const toggleClass = 'font-semibold text-gray-900 transition hover:underline';

export function Description({ html, text }: DescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const toggledRef = useRef(false);
  const focusIfToggled = (button: HTMLButtonElement | null) => {
    if (button && toggledRef.current) {
      toggledRef.current = false;
      button.focus();
    }
  };
  const toggle = (next: boolean) => {
    toggledRef.current = true;
    setExpanded(next);
  };
  const headingId = useId();
  const contentId = useId();

  if (!html.trim()) {
    return null;
  }

  const truncatable = text.length > EXCERPT_LENGTH;
  const showFull = expanded || !truncatable;

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="text-lg font-bold text-gray-900 lg:text-2xl">
        Description:
      </h2>
      <div
        id={contentId}
        data-testid="description"
        className="mt-3 text-sm leading-relaxed text-gray-500 lg:mt-4 lg:text-base"
      >
        {showFull ? (
          <>
            <div
              className="prose prose-sm max-w-none text-gray-500 lg:prose-base"
              dangerouslySetInnerHTML={{ __html: html }}
            />
            {truncatable && (
              <button
                type="button"
                aria-expanded
                aria-controls={contentId}
                ref={focusIfToggled}
                onClick={() => toggle(false)}
                className={toggleClass}
              >
                See Less....
              </button>
            )}
          </>
        ) : (
          <p>
            {excerpt(text, EXCERPT_LENGTH)}{' '}
            <button
              type="button"
              aria-expanded={false}
              aria-controls={contentId}
              ref={focusIfToggled}
              onClick={() => toggle(true)}
              className={toggleClass}
            >
              See More....
            </button>
          </p>
        )}
      </div>
    </section>
  );
}
