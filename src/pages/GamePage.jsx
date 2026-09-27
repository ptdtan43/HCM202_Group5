import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Eye, Trophy, Sparkles, Dna, Play, Ban, MessageCircle, CheckCircle, XCircle } from 'lucide-react';

// NGÂN HÀNG 20 CÂU HỎI
const QUESTIONS = [
  { answer: "CẦU ĐỒNG TỒN DỊ", hint: "Phương châm đoàn kết: Lấy cái chung để hạn chế cái khác biệt." },
  { answer: "HIỆP THƯƠNG DÂN CHỦ", hint: "Nguyên tắc hoạt động cốt lõi của Mặt trận dân tộc thống nhất." },
  { answer: "KHOAN DUNG", hint: "Thái độ cần có, trân trọng phần thiện dù nhỏ nhất ở mỗi người." },
  { answer: "DÂN VẬN", hint: "Công tác giáo dục, tuyên truyền để quần chúng hiểu rõ quyền lợi." },
  { answer: "NHÂN DÂN", hint: "Hồ Chí Minh quán triệt: 'Nước lấy ... làm gốc'." },
  { answer: "CHIẾN LƯỢC", hint: "Đại đoàn kết toàn dân tộc là một vấn đề có ý nghĩa ... lâu dài." },
  { answer: "NỀN TẢNG", hint: "Liên minh công - nông - trí thức đóng vai trò gì trong khối đại đoàn kết?" },
  { answer: "CÔNG NHÂN", hint: "Một trong 3 giai cấp tạo nên nền tảng vững chắc của đại đoàn kết." },
  { answer: "HẠT NHÂN", hint: "Sự đoàn kết và thống nhất trong Đảng đóng vai trò này." },
  { answer: "LỢI ÍCH CHUNG", hint: "Điều kiện xây dựng: Phải lấy điều này làm điểm quy tụ mọi tầng lớp." },
  { answer: "MẶT TRẬN", hint: "Hình thức tổ chức, nơi quy tụ mọi tổ chức và cá nhân yêu nước." },
  { answer: "ĐẢNG", hint: "Khối đại đoàn kết dân tộc phải được đặt dưới sự lãnh đạo của tổ chức này." },
  { answer: "YÊU NƯỚC", hint: "Chủ thể của khối đại đoàn kết bao gồm tất cả những người Việt Nam có tinh thần này." },
  { answer: "TRUYỀN THỐNG", hint: "Cần kế thừa ... yêu nước, nhân nghĩa đã hình thành qua hàng nghìn năm." },
  { answer: "MỤC TIÊU", hint: "Đại đoàn kết không chỉ là phương tiện mà còn là ... hàng đầu của cách mạng." },
  { answer: "CÔNG ĐOÀN", hint: "Một trong những đoàn thể quần chúng được thành lập để tập hợp nhân dân." },
  { answer: "VIỆT MINH", hint: "Tên gọi của Mặt trận dân tộc thống nhất trong thời kỳ kháng chiến chống Pháp." },
  { answer: "THÀNH CÔNG", hint: "Đoàn kết, đoàn kết, đại đoàn kết. ..., ..., đại ..." },
  { answer: "ĐỘC LẬP", hint: "Hồ Chí Minh khẳng định: Lúc nào dân ta đoàn kết thì nước được hưởng điều này." },
  { answer: "NÔNG DÂN", hint: "Giai cấp đóng góp sản xuất và nguồn lực, cùng công nhân tạo thành liên minh nòng cốt." }
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const WHEEL_SEGMENTS = [
  { id: 1, label: "200", type: "score", value: 200, color: "#3b82f6" },
  { id: 2, label: "MẤT LƯỢT", type: "lose_turn", color: "#ef4444" },
  { id: 3, label: "500", type: "score", value: 500, color: "#10b981" },
  { id: 4, label: "NHÂN ĐÔI", type: "multiply", value: 2, color: "#ec4899" },
  { id: 5, label: "100", type: "score", value: 100, color: "#8b5cf6" },
  { id: 6, label: "PHÁ SẢN", type: "bankrupt", color: "#1e293b" },
  { id: 7, label: "300", type: "score", value: 300, color: "#f59e0b" },
  { id: 8, label: "800", type: "score", value: 800, color: "#14b8a6" },
  { id: 9, label: "MẤT LƯỢT", type: "lose_turn", color: "#ef4444" },
  { id: 10, label: "1000", type: "score", value: 1000, color: "#eab308" }
];

const removeDiacritics = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/Đ/g, "D").replace(/đ/g, "d").toUpperCase();
};

const Tile = ({ char, isRevealed }) => {
  if (char === " ") return <div className="w-4 sm:w-8 h-16 sm:h-20 shrink-0" />;
  return (
    <div className="relative w-12 h-16 sm:w-16 sm:h-20 shrink-0 select-none perspective-[1000px]">
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 60, damping: 14 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-indigo-700 rounded-lg shadow-[0_6px_0_#312e81] border border-blue-400 flex items-center justify-center" style={{ backfaceVisibility: "hidden" }}>
          <div className="w-1/2 h-1/2 rounded-sm bg-blue-300/20 shadow-inner" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-50 to-amber-100 rounded-lg shadow-[0_6px_0_#b45309] flex items-center justify-center border-2 border-yellow-200" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <span className="text-3xl sm:text-4xl font-extrabold text-slate-800">{char}</span>
        </div>
      </motion.div>
    </div>
  );
};

export default function GamePage() {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [forceReveal, setForceReveal] = useState(false);
  
  // State quản lý Đội chơi bao gồm Điểm Tổng (score) và Điểm Tạm Tính (roundScore)
  const [teams, setTeams] = useState([
    { id: 0, name: "Đội 1", score: 0, roundScore: 0, color: "from-sky-500 to-blue-600" },
    { id: 1, name: "Đội 2", score: 0, roundScore: 0, color: "from-emerald-500 to-teal-600" },
    { id: 2, name: "Đội 3", score: 0, roundScore: 0, color: "from-amber-500 to-orange-600" },
    { id: 3, name: "Đội 4", score: 0, roundScore: 0, color: "from-pink-500 to-rose-600" }
  ]);
  
  const [activeTeam, setActiveTeam] = useState(0);
  const [gameState, setGameState] = useState('IDLE'); // IDLE -> SPINNING -> SHOW_RESULT -> GUESSING -> SOLVING
  const [spinResult, setSpinResult] = useState(null);
  const [wheelRotation, setWheelRotation] = useState(0);

  const currentQ = QUESTIONS[currentQIndex];
  const normalizedAnswer = useMemo(() => removeDiacritics(currentQ.answer), [currentQ.answer]);
  const isWon = useMemo(() => [...normalizedAnswer].every(char => char === ' ' || guessedLetters.includes(char)) || forceReveal, [normalizedAnswer, guessedLetters, forceReveal]);

  // Chuyển lượt: Không làm mất điểm tạm tính trừ khi bị Phá Sản
  const nextTurn = useCallback(() => {
    setActiveTeam((prev) => (prev + 1) % 4);
    setGameState('IDLE');
    setSpinResult(null);
  }, []);

  const handleSpin = () => {
    if (gameState !== 'IDLE' || isWon) return;
    
    const targetIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const result = WHEEL_SEGMENTS[targetIndex];
    
    const currentSpins = Math.floor(wheelRotation / 360);
    const randomOffset = Math.floor(Math.random() * 20) - 10;
    const targetRot = ((currentSpins + 5) * 360) - (targetIndex * 36) + randomOffset;
    
    setSpinResult(result);
    setWheelRotation(targetRot);
    setGameState('SPINNING');
  };

  const onWheelStop = () => {
    if (gameState === 'SPINNING') {
      setGameState('SHOW_RESULT');
      
      setTimeout(() => {
        if (spinResult.type === 'lose_turn') {
          nextTurn();
        } else if (spinResult.type === 'bankrupt') {
          // Phá sản: Chỉ mất điểm Tạm Tính vòng này
          setTeams(prev => prev.map((t, i) => i === activeTeam ? { ...t, roundScore: 0 } : t));
          nextTurn();
        } else {
          setGameState('GUESSING');
        }
      }, 2000);
    }
  };

  const handleGuess = useCallback((letter) => {
    if (gameState !== 'GUESSING' || isWon) return;
    const upperLetter = letter.toUpperCase();
    if (!ALPHABET.includes(upperLetter) || guessedLetters.includes(upperLetter)) return;

    const newGuessed = [...guessedLetters, upperLetter];
    setGuessedLetters(newGuessed);
    
    const count = [...normalizedAnswer].filter(c => c === upperLetter).length;
    const nowWon = [...normalizedAnswer].every(char => char === ' ' || newGuessed.includes(char));
    
    if (count > 0) {
      setTeams(prev => prev.map((t, i) => {
        if (i === activeTeam && spinResult) {
          let earned = 0;
          if (spinResult.type === 'score') earned = spinResult.value * count;
          else if (spinResult.type === 'multiply') earned = t.roundScore * (spinResult.value - 1);
          
          let newRoundScore = t.roundScore + earned;

          // Nếu đoán chữ cái này mà hoàn thành luôn từ khóa -> Thắng vòng
          if (nowWon) {
            return { ...t, score: t.score + newRoundScore, roundScore: 0 };
          }
          return { ...t, roundScore: newRoundScore };
        }
        if (nowWon) return { ...t, roundScore: 0 }; // Các đội khác reset điểm tạm tính
        return t;
      }));

      setGameState('IDLE');
      setSpinResult(null);
    } else {
      nextTurn(); // Đoán sai -> Chuyển lượt
    }
  }, [gameState, isWon, guessedLetters, normalizedAnswer, activeTeam, spinResult, nextTurn]);

  // Xử lý khi MC xác nhận Đội chơi "Đoán Từ Khóa"
  const handleSolve = (isCorrect) => {
    if (isCorrect) {
      const unrevealedCount = [...normalizedAnswer].filter(c => c !== ' ' && !guessedLetters.includes(c)).length;
      const currentSpinValue = spinResult?.type === 'score' ? spinResult.value : 0;
      const bonus = currentSpinValue * unrevealedCount;

      setTeams(prev => prev.map((t, i) => {
        if (i === activeTeam) {
          // Thắng: Tổng điểm = Điểm cũ + Tạm Tính + Bonus
          return { ...t, score: t.score + t.roundScore + bonus, roundScore: 0 };
        }
        return { ...t, roundScore: 0 };
      }));
      
      setForceReveal(true);
      setGameState('IDLE');
      setSpinResult(null);
    } else {
      // Đoán sai từ khóa -> Mất lượt
      nextTurn();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (/^[a-zA-Z]$/.test(e.key) && gameState === 'GUESSING') handleGuess(e.key);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGuess, gameState]);

  // Sang câu hỏi mới -> Xóa sạch điểm tạm tính của mọi đội
  const resetBoard = () => {
    setGuessedLetters([]);
    setForceReveal(false);
    setGameState('IDLE');
    setSpinResult(null);
    setTeams(prev => prev.map(t => ({ ...t, roundScore: 0 })));
  };

  const words = currentQ.answer.split(' ');
  const wheelGradient = `conic-gradient(from -18deg, ${WHEEL_SEGMENTS.map((s, i) => `${s.color} ${i * 36}deg${(i + 1) * 36}deg`).join(', ')})`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-rose-950 flex flex-col items-center p-4 sm:p-8 font-sans overflow-hidden">
      
      {/* VÒNG QUAY & THÔNG BÁO TỰ TẮT */}
      <AnimatePresence>
        {(gameState === 'SPINNING' || gameState === 'SHOW_RESULT') && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
          >
            <div className="relative flex flex-col items-center">
              <div className="absolute top-[-25px] z-20 w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[35px] border-t-amber-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]"></div>
              <motion.div 
                className="w-[320px] h-[320px] sm:w-[500px] sm:h-[500px] rounded-full border-8 border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.6)] relative overflow-hidden"
                animate={{ rotate: wheelRotation }}
                transition={{ duration: 3.5, ease: [0.15, 0.85, 0.3, 1] }}
                onAnimationComplete={onWheelStop}
                style={{ background: wheelGradient }}
              >
                {WHEEL_SEGMENTS.map((seg, i) => (
                  <div key={i} className="absolute top-0 left-1/2 -translate-x-1/2 h-1/2 origin-bottom flex items-start justify-center pt-2 sm:pt-6" style={{ transform: `rotate(${i * 36}deg)` }}>
                    <span className="text-white font-black text-sm sm:text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                      {seg.label}
                    </span>
                  </div>
                ))}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-inner border-4 border-slate-300 z-10 flex items-center justify-center">
                  <div className="w-4 h-4 bg-slate-800 rounded-full"></div>
                </div>
              </motion.div>
            </div>

            <AnimatePresence>
              {gameState === 'SHOW_RESULT' && (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                  className={`absolute z-30 px-12 py-8 text-white rounded-3xl shadow-2xl border-4 flex flex-col items-center gap-2
                    ${spinResult.type === 'score' ? 'bg-indigo-600 border-indigo-300' : 
                      spinResult.type === 'multiply' ? 'bg-pink-600 border-pink-300' : 'bg-rose-600 border-rose-300'}
                  `}
                >
                  <h2 className="text-5xl sm:text-7xl font-black tracking-wider">{spinResult.label}</h2>
                  <p className="text-lg opacity-90 font-medium">
                    {spinResult.type === 'lose_turn' ? "Rất tiếc, đã qua lượt!" : spinResult.type === 'bankrupt' ? "Mất điểm vòng này!" : "Hãy chọn 1 chữ cái!"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POPUP GIẢI MÃ TỪ KHÓA (Dành cho MC xác nhận) */}
      <AnimatePresence>
        {gameState === 'SOLVING' && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
          >
            <div className="bg-slate-800 p-8 rounded-3xl border border-indigo-500 shadow-2xl flex flex-col items-center text-center max-w-lg mx-4">
              <h2 className="text-3xl font-bold text-white mb-2">Đội {activeTeam + 1} Giải Mã!</h2>
              <p className="text-indigo-200 mb-8 font-medium">Lắng nghe câu trả lời. MC hãy xác nhận kết quả:</p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <button onClick={() => handleSolve(true)} className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-all">
                  <CheckCircle /> CHÍNH XÁC
                </button>
                <button onClick={() => handleSolve(false)} className="flex-1 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-all">
                  <XCircle /> SAI (Mất lượt)
                </button>
              </div>
              
              <button onClick={() => setGameState(spinResult ? 'GUESSING' : 'IDLE')} className="mt-6 text-slate-400 hover:text-white underline font-medium">
                Hủy bỏ / Quay lại
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BẢNG ĐIỂM (TOP) */}
      <div className="w-full max-w-5xl grid grid-cols-4 gap-3 sm:gap-6 mb-8 relative z-10">
        {teams.map((team, index) => (
          <div key={team.id} className={`rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center transition-all duration-300 border-2
            ${activeTeam === index ? 'scale-110 shadow-[0_0_30px_rgba(255,255,255,0.3)] z-20 border-white' : 'scale-95 opacity-70 border-transparent'}
            bg-gradient-to-br ${team.color}
          `}>
            <span className="text-white/80 font-bold text-sm uppercase tracking-wider">{team.name}</span>
            <span className="text-white font-black text-3xl sm:text-4xl mt-1">{team.score}</span>
            <div className="mt-2 bg-black/20 px-3 py-1 rounded-full border border-white/10 w-full text-center">
              <span className="text-white/90 font-semibold text-xs whitespace-nowrap">TẠM: {team.roundScore}</span>
            </div>
            {activeTeam === index && (
              <motion.div layoutId="activeIndicator" className="absolute -bottom-3 bg-white text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                ĐANG CHƠI
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* ĐIỀU KHIỂN & GỢI Ý */}
      <div className="w-full max-w-5xl flex flex-col items-center justify-between gap-6 relative z-10 mb-8">
        <div className="flex w-full justify-between items-center">
          <button onClick={() => { if(currentQIndex > 0) { setCurrentQIndex(p=>p-1); resetBoard(); } }} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition flex items-center gap-1">
            <ChevronLeft size={18} /> Trước
          </button>
          
          <div className="flex gap-3 sm:gap-4">
            <button onClick={handleSpin} disabled={gameState !== 'IDLE' || isWon} className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-amber-950 rounded-xl shadow-lg shadow-orange-500/30 font-bold text-sm sm:text-lg disabled:opacity-40 disabled:grayscale flex items-center gap-2 transition-all active:scale-95">
              <Dna size={22} /> QUAY NÓN
            </button>

            <button onClick={() => setGameState('SOLVING')} disabled={isWon || gameState === 'SPINNING'} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 font-bold text-sm sm:text-lg disabled:opacity-40 disabled:grayscale flex items-center gap-2 transition-all active:scale-95">
              <MessageCircle size={22} /> ĐOÁN TỪ
            </button>
            
            <button onClick={() => setForceReveal(true)} disabled={isWon} className="px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl border border-white/10 transition flex items-center justify-center">
              <Eye size={18} />
            </button>
          </div>

          <button onClick={() => { if(currentQIndex < QUESTIONS.length-1) { setCurrentQIndex(p=>p+1); resetBoard(); } }} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition flex items-center gap-1">
             Tiếp <ChevronRight size={18} />
          </button>
        </div>

        <div className="w-full text-center bg-slate-800/80 backdrop-blur-xl border border-indigo-400/30 p-6 rounded-3xl shadow-[0_0_30px_rgba(79,70,229,0.15)]">
          <p className="text-xl sm:text-2xl text-indigo-100 font-medium">{currentQ.hint}</p>
        </div>
      </div>

      {/* BẢNG CHỮ & BÀN PHÍM */}
      <div className="w-full max-w-5xl flex flex-col items-center">
        
        {isWon && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-6 flex items-center gap-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 px-8 py-3 rounded-full font-bold text-2xl shadow-xl border-2 border-yellow-200">
            <Trophy size={28} /> HOÀN THÀNH VÒNG CHƠI!
          </motion.div>
        )}

        <div className="flex flex-wrap justify-center gap-y-4 gap-x-3 sm:gap-x-4 max-w-[90%] mb-12">
          {words.map((word, wordIdx) => (
            <div key={wordIdx} className="flex gap-1 sm:gap-2">
              {[...word].map((char, charIdx) => {
                const normChar = removeDiacritics(char);
                return <Tile key={`${wordIdx}-${charIdx}`} char={char} isRevealed={guessedLetters.includes(normChar) || forceReveal} />;
              })}
            </div>
          ))}
        </div>

        <AnimatePresence>
          {gameState === 'GUESSING' && spinResult && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="mb-4 text-emerald-300 font-bold text-lg bg-emerald-950/50 px-6 py-2 rounded-full border border-emerald-500/30 text-center">
              Đội {activeTeam + 1} chọn chữ cái. Mức thưởng: {spinResult.label} điểm / ô!
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`w-full bg-slate-900/60 p-6 rounded-3xl backdrop-blur-md border border-white/10 transition-opacity ${gameState === 'GUESSING' ? 'opacity-100 shadow-[0_0_40px_rgba(16,185,129,0.2)]' : 'opacity-40 pointer-events-none'}`}>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {ALPHABET.map((letter) => {
              const isGuessed = guessedLetters.includes(letter);
              return (
                <button
                  key={letter}
                  disabled={isGuessed || gameState !== 'GUESSING'}
                  onClick={() => handleGuess(letter)}
                  className={`w-10 h-12 sm:w-12 sm:h-14 rounded-lg font-bold text-xl transition-all shadow-md border-b-4 
                    ${isGuessed ? "bg-slate-800 text-slate-600 border-slate-900 cursor-not-allowed" : "bg-slate-200 text-slate-900 border-slate-500 hover:bg-white active:translate-y-1 active:border-b-0"}
                  `}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}