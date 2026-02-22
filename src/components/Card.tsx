import React from 'react';
import { motion } from 'motion/react';
import { Card as CardType, Suit, Rank } from '../types';
import { Heart, Spade, Club, Diamond } from 'lucide-react';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  isFaceUp?: boolean;
  isPlayable?: boolean;
  className?: string;
}

const SuitIcon = ({ suit, size = 20 }: { suit: Suit; size?: number }) => {
  switch (suit) {
    case Suit.HEARTS: return <Heart size={size} className="text-red-600 fill-red-600" />;
    case Suit.DIAMONDS: return <Diamond size={size} className="text-red-600 fill-red-600" />;
    case Suit.CLUBS: return <Club size={size} className="text-slate-900 fill-slate-900" />;
    case Suit.SPADES: return <Spade size={size} className="text-slate-900 fill-slate-900" />;
  }
};

export const Card: React.FC<CardProps> = ({ card, onClick, isFaceUp = true, isPlayable = false, className = "" }) => {
  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      whileHover={isPlayable ? { y: -10, scale: 1.05 } : {}}
      onClick={isPlayable ? onClick : undefined}
      className={`
        relative w-20 h-28 sm:w-24 sm:h-36 rounded-lg shadow-md border-2 
        ${isFaceUp ? 'bg-white border-slate-200' : 'bg-indigo-800 border-indigo-400'}
        ${isPlayable ? 'cursor-pointer ring-2 ring-yellow-400 ring-offset-2' : ''}
        flex flex-col items-center justify-between p-2 select-none
        ${className}
      `}
    >
      {isFaceUp ? (
        <>
          <div className="self-start flex flex-col items-center">
            <span className={`font-bold text-lg leading-none ${card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS ? 'text-red-600' : 'text-slate-900'}`}>
              {card.rank}
            </span>
            <SuitIcon suit={card.suit} size={14} />
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <SuitIcon suit={card.suit} size={32} />
          </div>

          <div className="self-end flex flex-col items-center rotate-180">
            <span className={`font-bold text-lg leading-none ${card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS ? 'text-red-600' : 'text-slate-900'}`}>
              {card.rank}
            </span>
            <SuitIcon suit={card.suit} size={14} />
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center border-2 border-indigo-300 rounded-md opacity-50">
          <div className="w-8 h-8 border-4 border-indigo-200 rounded-full animate-pulse" />
        </div>
      )}
    </motion.div>
  );
};
