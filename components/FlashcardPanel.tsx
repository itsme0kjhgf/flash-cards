
import React from 'react';
import { Flashcard as FlashcardComponent } from './Flashcard';
import type { Flashcard } from '../types';
import { LightBulbIcon, SpeakerWaveIcon } from './icons';

interface FlashcardPanelProps {
  flashcards: Flashcard[];
  isLoading: boolean;
  error: string | null;
  onReadAloud: () => void;
  isSpeaking: boolean;
}

export const FlashcardPanel: React.FC<FlashcardPanelProps> = ({ flashcards, isLoading, error, onReadAloud, isSpeaking }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-700">Generated Flashcards</h2>
        {flashcards.length > 0 && (
          <button
            onClick={onReadAloud}
            disabled={isSpeaking || isLoading}
            className="bg-green-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSpeaking ? (
                <>
                  <div className="animate-pulse flex space-x-1">
                    <span className="sr-only">Speaking...</span>
                    <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 bg-white rounded-full animate-bounce"></div>
                  </div>
                  Speaking...
                </>
            ) : (
                <>
                  <SpeakerWaveIcon className="w-5 h-5" />
                  Read Aloud
                </>
            )}
          </button>
        )}
      </div>

      <div className="flex-grow bg-gray-100 p-4 rounded-lg overflow-y-auto min-h-[500px]">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="font-semibold text-lg">AI is thinking...</p>
            <p className="text-sm">Generating your flashcards, please wait.</p>
          </div>
        )}
        
        {error && (
            <div className="flex flex-col items-center justify-center h-full text-red-600 bg-red-50 p-4 rounded-lg">
                <p className="font-bold">An Error Occurred</p>
                <p className="text-sm text-center">{error}</p>
            </div>
        )}

        {!isLoading && !error && flashcards.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <LightBulbIcon className="w-16 h-16 text-gray-300 mb-4"/>
                <h3 className="text-lg font-semibold">Your flashcards will appear here.</h3>
                <p className="mt-1 max-w-md">Provide some text or an image, choose a language, and click "Generate Flashcards" to get started!</p>
            </div>
        )}

        {!isLoading && flashcards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* FIX: Pass the 'status' prop to FlashcardComponent. Other missing props are now optional. */}
            {flashcards.map((card) => (
              <FlashcardComponent key={card.id} question={card.question} answer={card.answer} status={card.status} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
