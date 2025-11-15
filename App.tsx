
import React, { useState, useCallback, useEffect } from 'react';
import { InputPanel } from './components/InputPanel';
import { Header } from './components/Header';
import { StudySession } from './components/StudySession';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { generateFlashcardsFromText, getTextFromImages } from './services/geminiService';
import type { Language, Deck, CardStatus } from './types';
import { useTheme } from './hooks/useTheme';
import { useUser } from './hooks/useUser';

type View = 'auth' | 'dashboard' | 'create' | 'studying';

export default function App() {
  const { user, login, logout, addDeck, updateCardStatus, deleteDeck, findDeck } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('auth');
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);

  useTheme();

  useEffect(() => {
    // This effect handles view changes based on authentication state.
    // It should only switch to dashboard upon initial login.
    // It should not interfere when the user object is updated during other activities (e.g., studying).
    if (user && view === 'auth') {
      setView('dashboard');
    } else if (!user) {
      setView('auth');
    }
  }, [user, view]);

  const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve({ base64, mimeType: file.type });
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleGenerate = useCallback(async (
    sourceImages: File[],
    language: Language,
    cardCount: number
  ) => {
    if (sourceImages.length === 0 || !user) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const imagePayloads = await Promise.all(sourceImages.map(fileToBase64));
      const textToProcess = await getTextFromImages(imagePayloads);

      if (!textToProcess.trim()) {
        setError('Could not find any text in the uploaded image(s). Please try with clearer images.');
        setIsLoading(false);
        return;
      }
      
      const generatedFlashcards = await generateFlashcardsFromText(textToProcess, language, cardCount);
      const newDeck = await addDeck(generatedFlashcards, imagePayloads);

      if (newDeck) {
        setActiveDeckId(newDeck.id);
        setView('studying');
      }

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate flashcards. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [user, addDeck]);
  
  const handleStartStudySession = (deck: Deck) => {
    setActiveDeckId(deck.id);
    setView('studying');
  };

  const handleUpdateCardStatus = async (deckId: string, cardId: string, status: CardStatus) => {
    await updateCardStatus(deckId, cardId, status);
  };
  
  const handleGoToDashboard = () => {
    setActiveDeckId(null);
    setError(null);
    setView('dashboard');
  }

  const renderContent = () => {
    if (!user) {
      return <Auth onLogin={login} />;
    }

    switch (view) {
      case 'dashboard':
        return <Dashboard 
                  user={user}
                  onStartStudySession={handleStartStudySession}
                  onCreateNewDeck={() => setView('create')}
                  onDeleteDeck={deleteDeck}
                />;
      case 'create':
        return <InputPanel 
                  onGenerate={handleGenerate} 
                  isLoading={isLoading}
                  error={error}
                  onBack={handleGoToDashboard}
                />;
      case 'studying':
        const activeDeck = findDeck(activeDeckId || '');
        if (activeDeck) {
          return <StudySession
                    deck={activeDeck}
                    onRestart={handleGoToDashboard}
                    onUpdateCardStatus={handleUpdateCardStatus}
                  />;
        }
        // Fallback if deck not found
        handleGoToDashboard();
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {user && <Header user={user} onLogout={logout} />}
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
}
