import React from 'react';
import { Suit } from '../types';
import { Heart, Spade, Club, Diamond } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SuitSelectorProps {
  onSelect: (suit: Suit) => void;
  isOpen: boolean;
}

export const SuitSelector: React.FC<SuitSelectorProps> = ({ onSelect, isOpen }) => {
  if (!isOpen) return null;

  const suits = [
    { type: Suit.HEARTS, icon: Heart, color: 'text-red-600' },
    { type: Suit.DIAMONDS, icon: Diamond, color: 'text-red-600' },
    { type: Suit.CLUBS, icon: Club, color: 'text-slate-900' },
    { type: Suit.SPADES, icon: Spade, color: 'text-slate-900' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white p-6 rounded-2xl shadow-2xl border-4 border-yellow-400"
    >
      <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">Pick a Suit!</h3>
      <div className="grid grid-cols-2 gap-4">
        {suits.map(({ type, icon: Icon, color }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={`
              flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-100
              hover:bg-slate-50 hover:border-yellow-400 transition-all group
            `}
          >
            <Icon size={48} className={`${color} group-hover:scale-110 transition-transform`} />
            <span className="mt-2 font-semibold capitalize text-slate-600">{type}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};
