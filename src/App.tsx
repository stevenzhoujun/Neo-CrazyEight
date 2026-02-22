import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCrazyEights } from './hooks/useCrazyEights';
import { Card } from './components/Card';
import { SuitSelector } from './components/SuitSelector';
import { Suit, Rank } from './types';
import { Trophy, RotateCcw, Play, Info, Heart, Spade, Club, Diamond } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const { state, startGame, playCard, drawCard } = useCrazyEights();
  const [pendingEight, setPendingEight] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    if (state.status === 'game_over' && state.winner === 'player') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6']
      });
    }
  }, [state.status, state.winner]);

  const handleCardClick = (cardId: string) => {
    const card = state.playerHand.find(c => c.id === cardId);
    if (card?.rank === Rank.EIGHT) {
      setPendingEight(cardId);
    } else {
      playCard(cardId, 'player');
    }
  };

  const handleSuitSelect = (suit: Suit) => {
    if (pendingEight) {
      playCard(pendingEight, 'player', suit);
      setPendingEight(null);
    }
  };

  const topDiscard = state.discardPile[state.discardPile.length - 1];

  const isCardPlayable = (cardId: string) => {
    if (state.currentTurn !== 'player' || state.status !== 'playing') return false;
    const card = state.playerHand.find(c => c.id === cardId);
    if (!card) return false;
    if (card.rank === Rank.EIGHT) return true;
    const targetSuit = state.wildSuit || topDiscard.suit;
    return card.suit === targetSuit || card.rank === topDiscard.rank;
  };

  const SuitIndicator = ({ suit }: { suit: Suit }) => {
    const icons = {
      [Suit.HEARTS]: <Heart className="text-red-500 fill-red-500" />,
      [Suit.DIAMONDS]: <Diamond className="text-red-500 fill-red-500" />,
      [Suit.CLUBS]: <Club className="text-slate-900 fill-slate-900" />,
      [Suit.SPADES]: <Spade className="text-slate-900 fill-slate-900" />,
    };
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-white/90 rounded-full shadow-sm border border-slate-200">
        <span className="text-xs font-bold uppercase text-slate-500">Active Suit:</span>
        {icons[suit]}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#1a472a] text-white font-sans selection:bg-yellow-400 selection:text-slate-900 overflow-hidden">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center shadow-lg rotate-3">
            <span className="text-2xl font-black text-slate-900">8</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight italic">Neo 疯狂8点</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowRules(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Info size={24} />
          </button>
          {state.status !== 'waiting' && (
            <button 
              onClick={startGame}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <RotateCcw size={24} />
            </button>
          )}
        </div>
      </header>

      <main className="relative h-[calc(100vh-72px)] max-w-6xl mx-auto p-4 flex flex-col justify-between">
        {state.status === 'waiting' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/10 backdrop-blur-md p-12 rounded-3xl border border-white/20 shadow-2xl"
            >
              <h2 className="text-5xl font-black mb-6 drop-shadow-lg">Ready to Play?</h2>
              <p className="text-white/70 mb-8 max-w-md mx-auto">
                Challenge the AI in this classic card game. Be the first to clear your hand to win!
              </p>
              <button
                onClick={startGame}
                className="group relative px-8 py-4 bg-yellow-400 text-slate-900 rounded-2xl font-bold text-xl shadow-xl hover:bg-yellow-300 transition-all hover:scale-105 active:scale-95"
              >
                <span className="flex items-center gap-2">
                  <Play fill="currentColor" /> Start Game
                </span>
              </button>
            </motion.div>
          </div>
        ) : (
          <>
            {/* AI Hand */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-1 bg-black/30 rounded-full border border-white/10">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-medium">AI Opponent ({state.aiHand.length} cards)</span>
              </div>
              <div className="flex -space-x-12 sm:-space-x-16 justify-center py-4">
                {state.aiHand.map((card, i) => (
                  <Card key={card.id} card={card} isFaceUp={false} className="rotate-180" />
                ))}
              </div>
            </div>

            {/* Center Area: Deck and Discard */}
            <div className="flex-1 flex items-center justify-center gap-8 sm:gap-16">
              {/* Draw Pile */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  {state.deck.length > 0 ? (
                    <div 
                      onClick={() => state.currentTurn === 'player' && drawCard('player')}
                      className={`
                        cursor-pointer transition-transform hover:scale-105 active:scale-95
                        ${state.currentTurn === 'player' ? 'ring-4 ring-yellow-400 ring-offset-4 ring-offset-[#1a472a] rounded-lg' : ''}
                      `}
                    >
                      <Card card={state.deck[0]} isFaceUp={false} />
                      {/* Stack effect */}
                      <div className="absolute -top-1 -left-1 w-full h-full bg-indigo-900 border-2 border-indigo-400 rounded-lg -z-10" />
                      <div className="absolute -top-2 -left-2 w-full h-full bg-indigo-900 border-2 border-indigo-400 rounded-lg -z-20" />
                    </div>
                  ) : (
                    <div className="w-20 h-28 sm:w-24 sm:h-36 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-white/30 font-bold uppercase">Empty</span>
                    </div>
                  )}
                </div>
                <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Draw ({state.deck.length})</span>
              </div>

              {/* Discard Pile */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <AnimatePresence mode="popLayout">
                    <Card 
                      key={topDiscard.id} 
                      card={topDiscard} 
                      className="shadow-2xl"
                    />
                  </AnimatePresence>
                  {state.wildSuit && (
                    <div className="absolute -top-4 -right-4">
                      <SuitIndicator suit={state.wildSuit} />
                    </div>
                  )}
                </div>
                <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Discard</span>
              </div>
            </div>

            {/* Player Hand */}
            <div className="flex flex-col items-center gap-4">
              <div className={`
                flex items-center gap-2 px-4 py-1 rounded-full border transition-all
                ${state.currentTurn === 'player' ? 'bg-yellow-400 text-slate-900 border-yellow-500 shadow-lg' : 'bg-black/30 text-white/50 border-white/10'}
              `}>
                {state.currentTurn === 'player' && <div className="w-2 h-2 rounded-full bg-slate-900 animate-pulse" />}
                <span className="text-sm font-bold uppercase tracking-wider">
                  {state.currentTurn === 'player' ? "Your Turn" : "AI is thinking..."}
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 max-w-4xl px-4 pb-8">
                {state.playerHand.map((card) => (
                  <Card 
                    key={card.id} 
                    card={card} 
                    isPlayable={isCardPlayable(card.id)}
                    onClick={() => handleCardClick(card.id)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      <SuitSelector 
        isOpen={!!pendingEight} 
        onSelect={handleSuitSelect} 
      />

      <AnimatePresence>
        {state.status === 'game_over' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white text-slate-900 p-8 sm:p-12 rounded-3xl shadow-2xl max-w-md w-full text-center"
            >
              <div className={`
                w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center
                ${state.winner === 'player' ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-100 text-slate-600'}
              `}>
                <Trophy size={48} />
              </div>
              <h2 className="text-4xl font-black mb-2">
                {state.winner === 'player' ? 'Victory!' : 'Defeat!'}
              </h2>
              <p className="text-slate-500 mb-8">
                {state.winner === 'player' 
                  ? 'Incredible! You outsmarted the AI and cleared your hand.' 
                  : 'The AI was faster this time. Better luck in the next round!'}
              </p>
              <button
                onClick={startGame}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xl hover:bg-slate-800 transition-all shadow-xl"
              >
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}

        {showRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowRules(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white text-slate-900 p-8 rounded-3xl shadow-2xl max-w-lg w-full"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-3xl font-black mb-6 flex items-center gap-2">
                <Info className="text-blue-500" /> How to Play
              </h2>
              <div className="space-y-4 text-slate-600">
                <p><strong className="text-slate-900">Objective:</strong> Be the first to play all your cards.</p>
                <p><strong className="text-slate-900">Matching:</strong> You can play a card if it matches the <span className="font-bold">Suit</span> or <span className="font-bold">Rank</span> of the top card in the discard pile.</p>
                <p><strong className="text-slate-900">Crazy 8s:</strong> An <span className="font-bold text-yellow-600">8</span> is wild! You can play it anytime and choose a new suit.</p>
                <p><strong className="text-slate-900">Drawing:</strong> If you can't play, draw a card from the deck. If that card is playable, you can play it immediately.</p>
              </div>
              <button
                onClick={() => setShowRules(false)}
                className="mt-8 w-full py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
