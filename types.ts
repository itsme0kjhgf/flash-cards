
export type CardStatus = 'new' | 'learning' | 'mastered';

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  status: CardStatus;
}

export interface Deck {
  id: string;
  title: string;
  createdAt: string;
  flashcards: Flashcard[];
  sourceImages?: { base64: string; mimeType: string }[];
}

export interface User {
  username: string;
  decks: Deck[];
}

export type Language = 'English' | 'French' | 'Arabic';
