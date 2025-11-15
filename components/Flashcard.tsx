
import React from 'react';
import type { CardStatus } from '../types';

interface FlashcardProps {
  question: string;
  answer: string;
  status: CardStatus;
  isFlipped?: boolean;
  onFlip?: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ question, answer, status, isFlipped = false, onFlip }) => {
  const languageDirection = /[\u0600-\u06FF]/.test(question) || /[\u0600-\u06FF]/.test(answer) ? 'rtl' : 'ltr';
  const fontClass = languageDirection === 'rtl' ? 'font-arabic' : '';

  const statusColor = {
    new: 'border-slate-300 dark:border-slate-700',
    learning: 'border-amber-400 dark:border-amber-500',
    mastered: 'border-green-500 dark:border-green-600',
  };

  return (
    <div
      // FIX: Make component non-interactive if onFlip is not provided
      className={`group h-80 [perspective:1000px] ${onFlip ? 'cursor-pointer' : ''}`}
      onClick={onFlip}
      aria-live="polite"
      role={onFlip ? "button" : undefined}
      tabIndex={onFlip ? 0 : undefined}
      onKeyDown={(e) => onFlip && (e.key === ' ' || e.key === 'Enter') && onFlip()}
    >
      <div
        className={`relative h-full w-full rounded-xl shadow-lg transition-all duration-500 [transform-style:preserve-3d] ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Front of Card */}
        <div className={`absolute inset-0 bg-white dark:bg-slate-800 border-2 ${statusColor[status]} rounded-xl p-6 flex flex-col justify-center items-center [backface-visibility:hidden]`}>
          <div className="text-center">
            <p className="text-sm font-semibold text-indigo-500 dark:text-indigo-400">QUESTION</p>
            <p className={`mt-2 text-xl text-slate-800 dark:text-slate-200 ${fontClass}`} dir={languageDirection}>{question}</p>
          </div>
          <span className="sr-only">
            {`Question: ${question}. Click to flip for the answer.`}
          </span>
        </div>

        {/* Back of Card */}
        <div className="absolute inset-0 bg-indigo-50 dark:bg-slate-700 border-2 border-transparent rounded-xl p-6 flex flex-col justify-center items-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <div className="text-center">
            <p className="text-sm font-semibold text-green-600 dark:text-green-400">ANSWER</p>
            <p className={`mt-2 text-xl text-slate-800 dark:text-slate-200 ${fontClass}`} dir={languageDirection}>{answer}</p>
          </div>
          <span className="sr-only">
            {`Answer: ${answer}. Click to flip back to the question.`}
          </span>
        </div>
      </div>
    </div>
  );
};
