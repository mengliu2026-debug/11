import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Sparkles, Send, Trash2, Heart, GraduationCap, ArrowRight, Calculator, LayoutGrid } from "lucide-react";
import MathTrainer from "./components/MathTrainer";

interface WordData {
  word: string;
  meaning: string;
  explanation: string;
  sentence: string;
  translation: string;
}

type Tab = "words" | "math";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("words");
  const [inputText, setInputText] = useState("");
  const [words, setWords] = useState<WordData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studyMode, setStudyMode] = useState(false);
  const [revealedWords, setRevealedWords] = useState<Set<number>>(new Set());

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    const wordList = inputText
      .split(/[\s,，、\n]+/)
      .filter((w) => w.trim().length > 0);

    try {
      const response = await fetch("/api/analyze-words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words: wordList }),
      });

      if (!response.ok) {
        throw new Error("分析失败啦，请再试一次喵~");
      }

      const data = await response.json();
      setWords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "出错了哟");
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setWords([]);
    setInputText("");
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto font-sans pb-24">
      {/* Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border border-white/50 p-2 rounded-3xl shadow-2xl z-50 flex gap-2">
        <button 
          onClick={() => setActiveTab("words")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
            activeTab === "words" ? "bg-rose-400 text-white shadow-lg shadow-rose-100" : "text-slate-400 hover:bg-slate-50"
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="hidden md:inline">萌语词霸</span>
        </button>
        <button 
          onClick={() => setActiveTab("math")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
            activeTab === "math" ? "bg-emerald-400 text-white shadow-lg shadow-emerald-100" : "text-slate-400 hover:bg-slate-50"
          }`}
        >
          <Calculator className="w-5 h-5" />
          <span className="hidden md:inline">萌题挑战</span>
        </button>
      </nav>

      {/* Header */}
      <motion.header 
        key={activeTab}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-12"
      >
        <div className={`inline-block p-4 bg-white rounded-3xl shadow-xl mb-4 ${
          activeTab === "words" ? "shadow-pink-100 text-rose-400" : "shadow-emerald-100 text-emerald-400"
        }`}>
          {activeTab === "words" ? <Heart className="w-10 h-10 fill-current opacity-20" /> : <Calculator className="w-10 h-10" />}
        </div>
        <h1 className={`text-4xl font-display font-bold mb-2 ${
          activeTab === "words" ? "text-rose-500" : "text-emerald-500"
        }`}>
          {activeTab === "words" ? "萌语词霸" : "萌题大挑战"}
        </h1>
        <p className="text-slate-500">
          {activeTab === "words" ? "让每一个单词都变成可爱的魔法 ✨" : "快乐口算，让数学也变得暖暖的 ☀️"}
        </p>
      </motion.header>

      <AnimatePresence mode="wait">
        {activeTab === "words" ? (
          <motion.div
            key="words-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Input Section */}
            <motion.div 
              layout
              className="bg-white rounded-[2rem] p-6 shadow-xl shadow-pink-50/50 mb-8 overflow-hidden border-4 border-pink-100"
            >
              <div className="flex items-center gap-2 mb-4 text-pink-400 font-bold">
                <BookOpen className="w-5 h-5" />
                <span>输入单词表（用空格或逗号分隔）</span>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="例如: chocolate, sunshine, adventure..."
                className="w-full h-32 p-4 bg-pink-50 rounded-2xl border-2 border-transparent focus:border-pink-200 focus:outline-none transition-colors text-lg resize-none text-slate-800"
              />
              <div className="flex gap-3 mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAnalyze}
                  disabled={isLoading || !inputText.trim()}
                  className="flex-1 bg-rose-400 hover:bg-rose-500 disabled:bg-rose-200 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-100 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {isLoading ? "魔法解析中..." : "开始魔法学习"}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearAll}
                  className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              </div>
              
              {words.length > 0 && (
                <div className="mt-4 pt-4 border-t border-pink-50 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-400">
                    共发现 {words.length} 个魔法单词
                  </span>
                  <button
                    onClick={() => {
                      setStudyMode(!studyMode);
                      setRevealedWords(new Set());
                    }}
                    className={`text-sm font-bold flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      studyMode 
                        ? "bg-rose-500 text-white shadow-md shadow-rose-100" 
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    {studyMode ? "学习模式 ON" : "学习模式 OFF"}
                  </button>
                </div>
              )}
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-rose-100 text-rose-500 p-4 rounded-2xl mb-8 text-center font-medium"
              >
                {error}
              </motion.div>
            )}

            {/* Results Section */}
            <div className="grid gap-6">
              <AnimatePresence mode="popLayout">
                {words.map((item, index) => (
                  <motion.div
                    layout
                    key={item.word + index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      if (studyMode) {
                        const next = new Set(revealedWords);
                        if (next.has(index)) next.delete(index);
                        else next.add(index);
                        setRevealedWords(next);
                      }
                    }}
                    className={`bg-white rounded-[2rem] p-8 shadow-lg shadow-pink-50 border-2 transition-all relative group overflow-hidden ${
                      studyMode && !revealedWords.has(index) 
                        ? "border-pink-200 cursor-pointer hover:border-pink-300" 
                        : "border-slate-50"
                    }`}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                      <GraduationCap className="w-12 h-12 text-rose-300" />
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-6">
                      <h2 className="text-3xl font-display font-bold text-slate-800">{item.word}</h2>
                      <AnimatePresence>
                        {(!studyMode || revealedWords.has(index)) && (
                          <motion.span 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-rose-400 font-bold bg-rose-50 px-3 py-1 rounded-full text-sm w-fit"
                          >
                            {item.meaning}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-6">
                      <AnimatePresence>
                        {(!studyMode || revealedWords.has(index)) ? (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                          >
                            <div>
                              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> 魔法解释
                              </h3>
                              <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                                {item.explanation}
                              </p>
                            </div>

                            <div>
                              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2 flex items-center gap-1">
                                <ArrowRight className="w-3 h-3" /> 造句练习
                              </h3>
                              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                <p className="text-lg font-medium text-slate-700 mb-1 italic">"{item.sentence}"</p>
                                <p className="text-sm text-slate-500 font-medium">翻译: {item.translation}</p>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="py-8 text-center text-pink-300 font-medium">
                            点击卡片揭晓魔法解释 ✨
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {words.length === 0 && !isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 opacity-30 select-none"
              >
                <div className="w-32 h-32 mx-auto mb-4 bg-pink-200 rounded-full flex items-center justify-center grayscale">
                  <BookOpen className="w-16 h-16 text-pink-400" />
                </div>
                <p className="text-xl font-display font-medium">等待你的魔法单词哦...</p>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="math-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <MathTrainer />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Decoration */}
      <footer className="text-center py-12 text-slate-400 text-sm">
        <p>Made with ❤️ for young learners</p>
      </footer>
    </div>
  );
}
