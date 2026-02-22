import { useState, useCallback, useEffect } from 'react';
import { Card, GameState, Suit, Rank } from '../types';
import { createDeck, INITIAL_HAND_SIZE } from '../constants';

export const useCrazyEights = () => {
  const [state, setState] = useState<GameState>({
    deck: [],
    playerHand: [],
    aiHand: [],
    discardPile: [],
    currentTurn: 'player',
    status: 'waiting',
    winner: null,
    wildSuit: null,
  });

  const startGame = useCallback(() => {
    const fullDeck = createDeck();
    const playerHand = fullDeck.splice(0, INITIAL_HAND_SIZE);
    const aiHand = fullDeck.splice(0, INITIAL_HAND_SIZE);
    
    // Ensure the first discard is not an 8 for simplicity, or handle it
    let firstDiscard = fullDeck.pop()!;
    while (firstDiscard.rank === Rank.EIGHT) {
      fullDeck.unshift(firstDiscard);
      firstDiscard = fullDeck.pop()!;
    }

    setState({
      deck: fullDeck,
      playerHand,
      aiHand,
      discardPile: [firstDiscard],
      currentTurn: 'player',
      status: 'playing',
      winner: null,
      wildSuit: null,
    });
  }, []);

  const isPlayable = useCallback((card: Card, topCard: Card, wildSuit: Suit | null) => {
    if (card.rank === Rank.EIGHT) return true;
    const targetSuit = wildSuit || topCard.suit;
    return card.suit === targetSuit || card.rank === topCard.rank;
  }, []);

  const playCard = useCallback((cardId: string, player: 'player' | 'ai', newWildSuit?: Suit) => {
    setState(prev => {
      if (prev.status !== 'playing' || prev.currentTurn !== player) return prev;

      const hand = player === 'player' ? prev.playerHand : prev.aiHand;
      const cardIndex = hand.findIndex(c => c.id === cardId);
      if (cardIndex === -1) return prev;

      const card = hand[cardIndex];
      const topCard = prev.discardPile[prev.discardPile.length - 1];

      if (!isPlayable(card, topCard, prev.wildSuit)) return prev;

      const newHand = [...hand];
      newHand.splice(cardIndex, 1);

      const nextTurn = player === 'player' ? 'ai' : 'player';
      const isWinner = newHand.length === 0;

      return {
        ...prev,
        [player === 'player' ? 'playerHand' : 'aiHand']: newHand,
        discardPile: [...prev.discardPile, card],
        currentTurn: isWinner ? prev.currentTurn : nextTurn,
        status: isWinner ? 'game_over' : 'playing',
        winner: isWinner ? player : null,
        wildSuit: card.rank === Rank.EIGHT ? (newWildSuit || null) : null,
      };
    });
  }, [isPlayable]);

  const drawCard = useCallback((player: 'player' | 'ai') => {
    setState(prev => {
      if (prev.status !== 'playing' || prev.currentTurn !== player) return prev;
      if (prev.deck.length === 0) {
        // Skip turn if deck is empty
        return { ...prev, currentTurn: player === 'player' ? 'ai' : 'player' };
      }

      const newDeck = [...prev.deck];
      const drawnCard = newDeck.pop()!;
      const hand = player === 'player' ? prev.playerHand : prev.aiHand;
      const newHand = [...hand, drawnCard];

      // Check if the drawn card is playable immediately
      const topCard = prev.discardPile[prev.discardPile.length - 1];
      const canPlayDrawn = isPlayable(drawnCard, topCard, prev.wildSuit);

      // In some variations, you draw until you can play. 
      // Here we draw one and if it's not playable, turn ends.
      // If it IS playable, we let the player decide (or AI will play it next turn logic)
      // Actually, standard rules often say draw one, if playable, play it or keep it.
      // Let's simplify: draw one, if not playable, turn ends.
      
      if (!canPlayDrawn) {
        return {
          ...prev,
          deck: newDeck,
          [player === 'player' ? 'playerHand' : 'aiHand']: newHand,
          currentTurn: player === 'player' ? 'ai' : 'player',
        };
      }

      return {
        ...prev,
        deck: newDeck,
        [player === 'player' ? 'playerHand' : 'aiHand']: newHand,
      };
    });
  }, [isPlayable]);

  // AI Logic
  useEffect(() => {
    if (state.status === 'playing' && state.currentTurn === 'ai') {
      const timer = setTimeout(() => {
        const topCard = state.discardPile[state.discardPile.length - 1];
        const playableCard = state.aiHand.find(c => isPlayable(c, topCard, state.wildSuit));

        if (playableCard) {
          let aiWildSuit: Suit | undefined;
          if (playableCard.rank === Rank.EIGHT) {
            // AI picks its most frequent suit
            const suitCounts: Record<string, number> = {};
            state.aiHand.forEach(c => {
              if (c.rank !== Rank.EIGHT) {
                suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
              }
            });
            aiWildSuit = (Object.entries(suitCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as Suit) || Suit.HEARTS;
          }
          playCard(playableCard.id, 'ai', aiWildSuit);
        } else {
          drawCard('ai');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.status, state.currentTurn, state.aiHand, state.discardPile, state.wildSuit, isPlayable, playCard, drawCard]);

  return {
    state,
    startGame,
    playCard,
    drawCard,
  };
};
