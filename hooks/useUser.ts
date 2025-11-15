
import { useState, useEffect, useCallback } from 'react';
import type { User, Deck, Flashcard, CardStatus } from '../types';

const USERS_STORAGE_KEY = 'flashcard_app_users';
const CURRENT_USER_STORAGE_KEY = 'flashcard_app_currentUser';
const SIMULATED_DELAY = 300; // ms for fake network latency

// Helper functions to interact with localStorage
const getUsers = (): Record<string, User> => {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : {};
};

const saveUsers = (users: Record<string, User>) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// Simulate an API call
const fakeApiCall = <T>(data: T): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), SIMULATED_DELAY));
};

export const useUser = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Check for a logged-in user on initial load
        const currentUsername = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
        if (currentUsername) {
            const users = getUsers();
            if (users[currentUsername]) {
                setUser(users[currentUsername]);
            }
        }
    }, []);

    const login = useCallback(async (username: string) => {
        const normalizedUsername = username.toLowerCase().trim();
        if (!normalizedUsername) return;

        await fakeApiCall(null); // Simulate network call

        const users = getUsers();
        let currentUser = users[normalizedUsername];

        if (!currentUser) {
            // Create a new user if one doesn't exist
            currentUser = { username: normalizedUsername, decks: [] };
            users[normalizedUsername] = currentUser;
            saveUsers(users);
        }

        localStorage.setItem(CURRENT_USER_STORAGE_KEY, normalizedUsername);
        setUser(currentUser);
    }, []);

    const logout = useCallback(async () => {
        await fakeApiCall(null);
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        setUser(null);
    }, []);

    const addDeck = useCallback(async (
        newFlashcards: Array<{ question: string; answer: string }>,
        sourceImages: { base64: string; mimeType: string }[]
    ) => {
        if (!user) return null;

        await fakeApiCall(null);

        const flashcardsWithDetails: Flashcard[] = newFlashcards.map((fc, index) => ({
            ...fc,
            id: `fc-${Date.now()}-${index}`,
            status: 'new',
        }));

        const newDeck: Deck = {
            id: `deck-${Date.now()}`,
            title: `Notes - ${new Date().toLocaleString()}`,
            createdAt: new Date().toISOString(),
            flashcards: flashcardsWithDetails,
            sourceImages: sourceImages, // Save the images
        };

        const updatedUser = {
            ...user,
            decks: [...user.decks, newDeck],
        };

        const users = getUsers();
        users[user.username] = updatedUser;
        saveUsers(users);
        setUser(updatedUser);
        return newDeck; // Return the new deck so the app can navigate to it
    }, [user]);

    const updateCardStatus = useCallback(async (deckId: string, cardId: string, status: CardStatus) => {
        if (!user) return;

        await fakeApiCall(null);

        const updatedDecks = user.decks.map(deck => {
            if (deck.id === deckId) {
                const updatedFlashcards = deck.flashcards.map(card =>
                    card.id === cardId ? { ...card, status } : card
                );
                return { ...deck, flashcards: updatedFlashcards };
            }
            return deck;
        });

        const updatedUser = { ...user, decks: updatedDecks };

        const users = getUsers();
        users[user.username] = updatedUser;
        saveUsers(users);
        setUser(updatedUser);
    }, [user]);
    
    const deleteDeck = useCallback(async (deckId: string) => {
        if (!user) return;

        await fakeApiCall(null);

        const updatedDecks = user.decks.filter(deck => deck.id !== deckId);
        const updatedUser = { ...user, decks: updatedDecks };

        const users = getUsers();
        users[user.username] = updatedUser;
        saveUsers(users);
        setUser(updatedUser);
    }, [user]);

    const findDeck = useCallback((deckId: string): Deck | undefined => {
        return user?.decks.find(deck => deck.id === deckId);
    }, [user]);

    return { user, login, logout, addDeck, updateCardStatus, deleteDeck, findDeck };
};
