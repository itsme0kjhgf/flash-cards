
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Flashcard as FlashcardComponent } from './Flashcard';
import type { Deck, CardStatus } from '../types';
import { ArrowLeftIcon, ArrowRightIcon, ArrowPathIcon, SpeakerWaveIcon, CheckCircleIcon, XCircleIcon } from './icons';
import { generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';

interface StudySessionProps {
  deck: Deck;
  onRestart: () => void;
  onUpdateCardStatus: (deckId: string, cardId: string, status: CardStatus) => Promise<void>;
}

export const StudySession: React.FC<StudySessionProps> = ({ deck, onRestart, onUpdateCardStatus }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const currentCard = deck.flashcards[currentIndex];

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % deck.flashcards.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + deck.flashcards.length) % deck.flashcards.length);
  };

  const handleSetStatus = async (status: CardStatus) => {
    await onUpdateCardStatus(deck.id, currentCard.id, status);
    // Always go to the next card, looping back to the start if at the end.
    setTimeout(() => goToNext(), 200); // Small delay for better UX
  };

  const handleReadAloud = useCallback(async () => {
    if (!currentCard || isSpeaking) return;

    setIsSpeaking(true);
    setSpeechError(null);

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const audioContext = audioContextRef.current;

    try {
      const textToRead = `Question: ${currentCard.question}. Answer: ${currentCard.answer}.`;
      const base64Audio = await generateSpeech(textToRead);
      
      const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
      source.onended = () => setIsSpeaking(false);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setSpeechError(`Failed to generate audio. ${errorMessage}`);
      setIsSpeaking(false);
    }
  }, [currentCard, isSpeaking]);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 truncate pr-2" title={deck.title}>{deck.title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Card {currentIndex + 1} of {deck.flashcards.length}</p>
        </div>
        <button
          onClick={onRestart}
          className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
        >
          <ArrowPathIcon className="w-5 h-5" />
          Back to Decks
        </button>
      </div>

      <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / deck.flashcards.length) * 100}%` }}
        />
      </div>

      <FlashcardComponent 
        key={currentCard.id} 
        question={currentCard.question} 
        answer={currentCard.answer} 
        status={currentCard.status}
        isFlipped={isFlipped}
        onFlip={() => setIsFlipped(!isFlipped)}
      />
      
      {isFlipped && (
          <div className="flex justify-center items-center gap-4 mt-4 animate-fade-in">
              <button 
                  onClick={() => handleSetStatus('learning')}
                  className="px-6 py-3 font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors flex items-center gap-2"
              >
                  <XCircleIcon className="w-6 h-6" />
                  Still Learning
              </button>
              <button 
                  onClick={() => handleSetStatus('mastered')}
                  className="px-6 py-3 font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 rounded-lg hover:bg-green-200 dark:hover:bg-green-900 transition-colors flex items-center gap-2"
              >
                  <CheckCircleIcon className="w-6 h-6" />
                  Got It!
              </button>
          </div>
      )}

      <div className={`flex items-center mt-4 ${isFlipped ? 'justify-between' : 'justify-around'}`}>
        {!isFlipped && <button
          onClick={goToPrev}
          className="p-4 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          aria-label="Previous card"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>}
        
        <button
          onClick={handleReadAloud}
          disabled={isSpeaking}
          className="bg-indigo-500 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors duration-300 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
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
        
        {!isFlipped && <button
          onClick={goToNext}
          className="p-4 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          aria-label="Next card"
        >
          <ArrowRightIcon className="w-6 h-6" />
        </button>}
      </div>
      {speechError && (
        <p className="text-center text-red-500 dark:text-red-400 text-sm mt-2">{speechError}</p>
      )}
    </div>
  );
};
