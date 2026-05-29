import React, { useState, useEffect, useCallback } from 'react';

// Instead of plain strings, use an array of objects to allow colored segments.
// The key is the text, the val is the color class.
const TAGLINES = [
  [ { text: 'Manage. ', color: 'text-white/90' }, { text: 'Monitor. ', color: 'text-cyan-400' }, { text: 'Optimize.', color: 'text-teal-400' } ],
  [ { text: 'Real-Time ', color: 'text-white/90' }, { text: 'Network ', color: 'text-sky-400' }, { text: 'Intelligence.', color: 'text-white/90' } ],
  [ { text: 'Built for ', color: 'text-white/90' }, { text: 'Telecom ', color: 'text-amber-500' }, { text: 'Excellence.', color: 'text-white/90' } ],
  [ { text: 'Fiber. ', color: 'text-cyan-300' }, { text: 'Wireless. ', color: 'text-sky-400' }, { text: 'Unified.', color: 'text-white/90' } ],
];

const TYPING_SPEED = 60;       // ms per character
const DELETING_SPEED = 35;     // ms per character (faster delete)
const PAUSE_AFTER_TYPE = 2800; // ms to hold completed text
const PAUSE_AFTER_DELETE = 400; // ms before starting next tagline

const TypingTagline: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const currentTaglineObj = TAGLINES[currentIndex];
  const currentTaglineFull = currentTaglineObj.map((s) => s.text).join('');

  const tick = useCallback(() => {
    if (!isDeleting) {
      if (displayedText.length < currentTaglineFull.length) {
        return TYPING_SPEED;
      } else {
        setIsDeleting(true);
        return PAUSE_AFTER_TYPE;
      }
    } else {
      if (displayedText.length > 0) {
        return DELETING_SPEED;
      } else {
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % TAGLINES.length);
        return PAUSE_AFTER_DELETE;
      }
    }
  }, [displayedText, isDeleting, currentTaglineFull]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayedText.length < currentTaglineFull.length) {
          setDisplayedText(currentTaglineFull.slice(0, displayedText.length + 1));
        } else {
          setIsDeleting(true);
        }
      } else {
        if (displayedText.length > 0) {
          setDisplayedText(displayedText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % TAGLINES.length);
        }
      }
    }, tick());

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentTaglineFull, tick]);

  // Helper to render the currently displayed text with the correct colors per segment
  const renderColoredText = () => {
    let unallocatedText = displayedText;
    const elements = [];

    for (let i = 0; i < currentTaglineObj.length; i++) {
      const segment = currentTaglineObj[i];
      if (unallocatedText.length === 0) break;

      const textToShow = unallocatedText.slice(0, segment.text.length);
      elements.push(
        <span key={i} className={segment.color}>
          {textToShow}
        </span>
      );

      unallocatedText = unallocatedText.slice(segment.text.length);
    }
    return elements;
  };

  return (
    <div className="absolute bottom-24 left-0 right-24 z-10 px-8">
      <div className="flex items-center gap-3">
        {/* Accent line */}
        <div className="w-8 h-px bg-white/40 flex-shrink-0"></div>
        <p className="text-lg font-bold tracking-wide">
          {renderColoredText()}
          <span className="inline-block w-[2px] h-5 bg-white/70 ml-0.5 align-middle animate-blink"></span>
        </p>
      </div>
    </div>
  );
};

export default TypingTagline;
