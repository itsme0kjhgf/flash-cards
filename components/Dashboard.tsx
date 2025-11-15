
import React from 'react';
import type { User, Deck } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface DashboardProps {
    user: User;
    onStartStudySession: (deck: Deck) => void;
    onCreateNewDeck: () => void;
    onDeleteDeck: (deckId: string) => Promise<void>;
}

const DeckCard: React.FC<{ deck: Deck, onSelect: () => void, onDelete: () => Promise<void> }> = ({ deck, onSelect, onDelete }) => {
    const totalCards = deck.flashcards.length;
    const masteredCards = deck.flashcards.filter(c => c.status === 'mastered').length;
    const progress = totalCards > 0 ? (masteredCards / totalCards) * 100 : 0;

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete "${deck.title}"?`)) {
            await onDelete();
        }
    };

    return (
        <div 
            onClick={onSelect} 
            className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group"
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate pr-2">{deck.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{totalCards} cards</p>
                </div>
                <button
                    onClick={handleDelete}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-slate-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    aria-label={`Delete deck ${deck.title}`}
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Progress</span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ user, onStartStudySession, onCreateNewDeck, onDeleteDeck }) => {
    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Welcome, {user.username}!</h2>
                <button
                    onClick={onCreateNewDeck}
                    className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    Create New Deck
                </button>
            </div>
            {user.decks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {user.decks.slice().reverse().map(deck => (
                        <DeckCard 
                            key={deck.id} 
                            deck={deck} 
                            onSelect={() => onStartStudySession(deck)}
                            onDelete={() => onDeleteDeck(deck.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No decks yet!</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Click "Create New Deck" to turn your notes into flashcards.</p>
                </div>
            )}
        </div>
    );
};
