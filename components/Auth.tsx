
import React, { useState } from 'react';
import { SparklesIcon } from './icons';

interface AuthProps {
    onLogin: (username: string) => Promise<void>;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading || !username.trim()) return;
        setIsLoading(true);
        await onLogin(username);
        // No need to set isLoading to false, as the component will unmount on successful login
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md text-center">
                <div className="flex flex-col items-center justify-center mb-8">
                    <SparklesIcon className="w-12 h-12 text-indigo-500" />
                    <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mt-4">
                        Quick Cards
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Your personal flashcard generator.</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">Welcome!</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Enter a username to begin or access your decks.</p>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="username" className="sr-only">Username</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="e.g. study-master"
                                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-800 dark:text-slate-200"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!username.trim() || isLoading}
                            className="w-full mt-4 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors duration-300 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Logging in...
                                </>
                            ) : (
                                'Login / Get Started'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
