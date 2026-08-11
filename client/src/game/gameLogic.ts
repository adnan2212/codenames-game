import { words } from "@/src/data/words";
import type { Team, CardType, GameCard, GameState } from "@shared/types/game";

export function createGame(): GameState {
  const startingTeam: Team = Math.random() < 0.5 ? "red" : "blue";

  const types: CardType[] = [
    ...Array(8 + (startingTeam === "red" ? 1 : 0)).fill("red"),
    ...Array(8 + (startingTeam === "blue" ? 1 : 0)).fill("blue"),
    ...Array(7).fill("neutral"),
    "assassin"
  ];

  // Fisher-Yates shuffle
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]];
  }

  const cards: GameCard[] = words.map((word, index) => ({
    id: `card-${index + 1}`,
    word,
    type: types[index],
    isRevealed: false
  }));

  return {
    cards,
    startingTeam,
    currentTeam: startingTeam,
    status: "playing",
    phase: "clue",
    clue: null,
    guessCount: 0
  };
}

export function selectCard(
  game: GameState,
  cardId: string,
): GameState {
  if (game.status !== "playing" || game.phase !== "guessing") {
    return game;
  }

  const selectedCard = game.cards.find((card) => card.id === cardId);
  if (!selectedCard || selectedCard.isRevealed) return game;

  const updatedCards = game.cards.map((card) => {
    if (card.id === cardId) {
      return { ...card, isRevealed: true };
    }
    return card;
  });

  const newGuessCount = game.guessCount + 1;

  // Assassin = opponent team wins
  if (selectedCard.type === "assassin") {
    return {
      ...game,
      cards: updatedCards,
      status: game.currentTeam === "red" ? "blue-won" : "red-won"
    };
  }

  // check whether the current team has revealed all of their cards 
  const teamHasWon = updatedCards 
    .filter((card) => card.type === game.currentTeam)
    .every((card) => card.isRevealed);

  if (teamHasWon) {
    return {
      ...game,
      cards: updatedCards,
      status: game.currentTeam === "red" ? "red-won" : "blue-won"
    };
  }
  
  // Guess-limit condition
  if (game.clue && newGuessCount >= game.clue.number + 1) {
    return endTurn({
      ...game,
      cards: updatedCards,
      guessCount: newGuessCount
    })
  } 

  return { 
    ...game, 
    cards: updatedCards,
    guessCount: newGuessCount
  };
}

export function giveClue(
  game: GameState,
  word: string,
  number: number
): GameState {
  if (game.status !== "playing" || game.phase !== "clue" || game.clue !== null) return game;

 return {
  ...game,
  clue: {
    word,
    number
  },
  guessCount: 0,
  phase: "guessing"
 }
}

export function endTurn(game: GameState): GameState {
  if (game.status !== "playing" || game.phase !== "guessing") return game;

  return {
    ...game,
    clue: null,
    currentTeam: game.currentTeam === "red" ? "blue" : "red",
    guessCount: 0,
    phase: "clue"
  }
}
