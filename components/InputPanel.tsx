import React, { useState, useCallback } from 'react';
import type { Language } from '../types';
import { PhotoIcon, SparklesIcon, XCircleIcon, ArrowLeftIcon } from './icons';

interface InputPanelProps {
  onGenerate: (sourceImages: File[], language: Language, cardCount: number) => void;
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({ onGenerate, isLoading, error, onBack }) => {
  const [sourceImages, setSourceImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [language, setLanguage] = useState<Language>('English');
  const [cardCount, setCardCount] = useState(25);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
        const newFiles = Array.from(files);
        setSourceImages(prev => [...prev, ...newFiles]);

        const newPreviews: string[] = [];
        // FIX: Explicitly type `file` as `File` to help TypeScript's type inference.
        newFiles.forEach((file: File) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result as string);
                if (newPreviews.length === newFiles.length) {
                    setImagePreviews(prev => [...prev, ...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        });
    }
  };

  const removeImage = (index: number) => {
    setSourceImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = useCallback(() => {
    onGenerate(sourceImages, language, cardCount);
  }, [onGenerate, sourceImages, language, cardCount]);

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition-colors">
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Decks
      </button>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col">
        <div>
          <h2 className="text-xl font-bold mb-4 text-slate-700 dark:text-slate-300">1. Upload Your Notes</h2>
          
          <div className="flex flex-col items-center justify-center w-full">
              <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full min-h-[16rem] border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <PhotoIcon className="w-10 h-10 mb-3 text-slate-400" />
                  <p className="mb-2 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Upload one or more images of notes</p>
                </div>
                <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={isLoading} multiple />
              </label>
              {imagePreviews.length > 0 && (
                  <div className="w-full mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                              <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                              <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full transition opacity-0 group-hover:opacity-100"
                              disabled={isLoading}
                              aria-label="Remove image"
                              >
                              <XCircleIcon className="w-5 h-5" />
                              </button>
                          </div>
                      ))}
                  </div>
              )}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4 text-slate-700 dark:text-slate-300">2. Customize</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="language-select" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Language</label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                disabled={isLoading}
              >
                <option>English</option>
                <option>French</option>
                <option>Arabic</option>
              </select>
            </div>
            <div>
              <label htmlFor="card-count" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Number of Cards ({cardCount})</label>
              <input
                  id="card-count"
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={cardCount}
                  onChange={(e) => setCardCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
                  disabled={isLoading}
                />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          {error && (
              <div className="mb-4 text-center text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-lg">
                  <p className="font-semibold">An Error Occurred</p>
                  <p className="text-sm">{error}</p>
              </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={isLoading || sourceImages.length === 0}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors duration-300 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Brewing Cards...
              </>
            ) : (
              <>
                <SparklesIcon className="w-6 h-6" />
                Generate & Save Deck
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};