import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCrazyEights } from './hooks/useCrazyEights';
import { Card } from './components/Card';
import { SuitSelector } from './components/SuitSelector';
import { Suit, Rank } from './types';
import { Trophy, RotateCcw, Play, Info, Heart, Spade, Club, Diamond, Volume2, VolumeX, Sparkles, Cloud } from 'lucide-react';
import confetti from 'canvas-confetti';

const WIN_SOUND = 'https://cdn.pixabay.com/audio/2021/08/04/audio_bbd1304908.mp3';
const LOSS_SOUND = 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3';

const SmokeEffect = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0, 
            scale: 0.5, 
            x: Math.random() * 400 - 200, 
            y: 100 
          }}
          animate={{ 
            opacity: [0, 0.4, 0], 
            scale: [0.5, 2, 3], 
            x: Math.random() * 600 - 300, 
            y: -400 
          }}
          transition={{ 
            duration: 3 + Math.random() * 2, 
            repeat: Infinity, 
            delay: Math.random() * 2 
          }}
          className="absolute left-1/2 bottom-0 w-24 h-24 bg-slate-400/30 rounded-full blur-3xl"
        />
      ))}
    </div>
  );
};

export default function App() {
  const { state, startGame, playCard, drawCard } = useCrazyEights();
  const [pendingEight, setPendingEight] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const winAudio = useRef<HTMLAudioElement | null>(null);
  const lossAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    winAudio.current = new Audio(WIN_SOUND);
    lossAudio.current = new Audio(LOSS_SOUND);
  }, []);

  useEffect(() => {
    if (state.status === 'game_over') {
      if (state.winner === 'player') {
        if (soundEnabled) winAudio.current?.play().catch(() => {});
        confetti({
          particleCount: 200,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#ff69b4', '#f8d7da', '#8b5e3c', '#ffffff']
        });
      } else {
        if (soundEnabled) lossAudio.current?.play().catch(() => {});
      }
    }
  }, [state.status, state.winner, soundEnabled]);

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
          <div className="w-10 h-10 bg-[#f8d7da] rounded-lg flex items-center justify-center shadow-lg rotate-3 border-2 border-[#e5a8ac]">
            <span className="text-2xl font-black text-[#8b5e3c]">8</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight italic">Neo 疯狂8点</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
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
              className="bg-white/10 backdrop-blur-md p-8 sm:p-12 rounded-[3rem] border border-white/20 shadow-2xl max-w-2xl relative overflow-hidden"
            >
              {/* Decorative Background Elements */}
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-[#f8d7da] rounded-3xl flex items-center justify-center shadow-2xl border-4 border-[#e5a8ac] rotate-6">
                    <span className="text-4xl font-black text-[#8b5e3c]">8</span>
                  </div>
                </div>
                
                <h2 className="text-4xl sm:text-6xl font-black mb-4 drop-shadow-lg bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                  Neo 疯狂8点
                </h2>
                
                <div className="bg-black/20 rounded-2xl p-6 mb-8 text-left border border-white/5">
                  <h3 className="text-yellow-400 font-bold mb-2 flex items-center gap-2">
                    <Sparkles size={18} /> 游戏介绍
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    欢迎来到 Neo 疯狂8点！这是一款风靡全球的经典纸牌游戏。
                    在这里，你将面对强大的 AI 对手。你的目标是率先清空手中的 8 张扑克牌。
                    利用“疯狂 8 点”的万能属性改变战局，体验 Labubu 主题带来的可爱视觉享受！
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="text-yellow-400 font-bold text-lg">8张</div>
                    <div className="text-xs text-white/50 uppercase">初始手牌</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="text-pink-400 font-bold text-lg">万能</div>
                    <div className="text-xs text-white/50 uppercase">数字 8</div>
                  </div>
                </div>

                <button
                  onClick={startGame}
                  className="group relative w-full sm:w-auto px-12 py-5 bg-[#f8d7da] text-[#8b5e3c] rounded-2xl font-black text-2xl shadow-xl hover:bg-[#f1b0b7] transition-all hover:scale-105 active:scale-95 border-b-4 border-[#e5a8ac]"
                >
                  <span className="flex items-center justify-center gap-3">
                    <Play fill="currentColor" size={28} /> 立即开玩
                  </span>
                </button>
              </div>
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
                      <div className="absolute -top-1 -left-1 w-full h-full bg-[#f8d7da] border-2 border-[#e5a8ac] rounded-lg -z-10" />
                      <div className="absolute -top-2 -left-2 w-full h-full bg-[#f8d7da] border-2 border-[#e5a8ac] rounded-lg -z-20" />
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
            {state.winner !== 'player' && <SmokeEffect />}
            
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white text-slate-900 p-8 sm:p-12 rounded-[3rem] shadow-2xl max-w-md w-full text-center relative z-10 border-8 border-slate-100"
            >
              <div className={`
                w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center
                ${state.winner === 'player' ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-100 text-slate-600'}
              `}>
                {state.winner === 'player' ? <Trophy size={48} /> : <Cloud size={48} />}
              </div>
              
              <h2 className="text-5xl font-black mb-2 tracking-tighter">
                {state.winner === 'player' ? '太棒了！' : '哎呀...'}
              </h2>
              
              <p className="text-slate-500 mb-8 font-medium text-lg">
                {state.winner === 'player' 
                  ? '你成功击败了 AI，真是个天才！' 
                  : '再接再厉，胜利就在前方！'}
              </p>
              
              <button
                onClick={startGame}
                className={`
                  w-full py-5 rounded-2xl font-black text-2xl transition-all shadow-xl hover:scale-105 active:scale-95
                  ${state.winner === 'player' 
                    ? 'bg-yellow-400 text-slate-900 hover:bg-yellow-300' 
                    : 'bg-slate-900 text-white hover:bg-slate-800'}
                `}
              >
                {state.winner === 'player' ? '再来一局' : '重新开始'}
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
                <Info className="text-blue-500" /> 游戏规则
              </h2>
              <div className="space-y-4 text-slate-600">
                <p><strong className="text-slate-900">目标:</strong> 率先出完手中所有的牌。</p>
                <p><strong className="text-slate-900">匹配:</strong> 你可以出的牌必须与弃牌堆顶部的牌在<span className="font-bold">花色</span>或<span className="font-bold">点数</span>上匹配。</p>
                <p><strong className="text-slate-900">万能 8 点:</strong> 数字 <span className="font-bold text-yellow-600 text-lg">8</span> 是万用牌！你可以在任何时候打出它，并指定一个新的花色。</p>
                <p><strong className="text-slate-900">摸牌:</strong> 如果无牌可出，必须从摸牌堆摸一张牌。如果摸到的牌可出，你可以立即打出它。</p>
              </div>
              <button
                onClick={() => setShowRules(false)}
                className="mt-8 w-full py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                我知道了
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
