import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Trophy, RotateCcw, Calculator } from "lucide-react";

interface Question {
  a: number;
  b: number;
  operator: "+" | "-";
  result: number;
  options: number[];
}

export default function MathTrainer() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [shake, setShake] = useState(false);

  const generateQuestion = useCallback(() => {
    const operator = Math.random() > 0.5 ? "+" : "-";
    let a, b, result;

    if (operator === "+") {
      a = Math.floor(Math.random() * 50) + 1;
      b = Math.floor(Math.random() * 50) + 1;
      result = a + b;
    } else {
      a = Math.floor(Math.random() * 90) + 10;
      b = Math.floor(Math.random() * (a - 1)) + 1; // Ensure positive result
      result = a - b;
    }

    // Generate options
    const options = new Set<number>([result]);
    while (options.size < 4) {
      const offset = Math.floor(Math.random() * 11) - 5; // -5 to +5
      const option = result + offset;
      if (option > 0 && option <= 100) {
        options.add(option);
      }
    }

    setQuestion({
      a,
      b,
      operator,
      result,
      options: Array.from(options).sort(() => Math.random() - 0.5),
    });
    setFeedback(null);
  }, []);

  const playAmazingSound = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance("Amazing!");
      utterance.lang = "en-US";
      utterance.pitch = 1.4; // Softer, cuter pitch
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  const handleAnswer = (selected: number) => {
    if (!question) return;

    if (selected === question.result) {
      setFeedback("correct");
      setScore((s) => s + 1);
      playAmazingSound();
      setTimeout(() => {
        generateQuestion();
      }, 800);
    } else {
      setFeedback("wrong");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  if (!question) return null;

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Score Board */}
      <div className="flex justify-between items-center mb-8 px-4">
        <div className="flex items-center gap-2 bg-white px-6 py-2 rounded-full shadow-sm text-rose-400 font-bold border-2 border-rose-50">
          <Trophy className="w-5 h-5" />
          <span>得分: {score}</span>
        </div>
        <button 
          onClick={() => setScore(0)}
          className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <motion.div
        animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-pink-100 border-4 border-pink-50 relative overflow-hidden"
      >
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Calculator className="w-32 h-32" />
        </div>

        {/* Question Display */}
        <div className="text-center mb-12">
          <div className="text-7xl md:text-8xl font-display font-bold text-slate-700 flex items-center justify-center gap-4">
            <span>{question.a}</span>
            <span className="text-rose-400">{question.operator}</span>
            <span>{question.b}</span>
            <span className="text-slate-300">=</span>
            <span className="text-rose-200">?</span>
          </div>
        </div>

        {/* Feedback Message */}
        <AnimatePresence>
          {feedback === "correct" && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            >
              <div className="bg-emerald-400 text-white px-8 py-4 rounded-3xl shadow-xl font-bold text-2xl flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                太棒了!
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-4">
          {question.options.map((option) => (
            <motion.button
              key={option}
              whileHover={{ scale: 1.05, backgroundColor: "#fff5f5" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAnswer(option)}
              className="bg-slate-50 border-2 border-slate-100 py-8 rounded-[2rem] text-4xl font-display font-bold text-slate-600 hover:border-rose-200 hover:text-rose-500 transition-all shadow-sm"
            >
              {option}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="mt-12 text-center text-slate-400 flex flex-col items-center gap-2">
        <p className="font-medium text-lg">选出正确的答案喵~</p>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-200 animate-bounce" />
          <div className="w-2 h-2 rounded-full bg-rose-200 animate-bounce [animation-delay:0.2s]" />
          <div className="w-2 h-2 rounded-full bg-rose-200 animate-bounce [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
}
