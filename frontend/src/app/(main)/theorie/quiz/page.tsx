"use client";
/**
 * Page Théorie/Quiz — Quiz interactif sur la bachata.
 */
import { useState } from "react";

const QUESTIONS = [
  {
    id: 1,
    question: "Combien de temps compte-t-on dans un cycle de Bachata ?",
    options: ["4 temps", "6 temps", "8 temps", "12 temps"],
    correct: 2,
    explanation: "La Bachata se danse sur un cycle de 8 temps. Le pas tap tombe sur les temps 4 et 8.",
  },
  {
    id: 2,
    question: "Dans quel pays est née la Bachata ?",
    options: ["Cuba", "Colombie", "République Dominicaine", "Porto Rico"],
    correct: 2,
    explanation: "La Bachata est née en République Dominicaine dans les années 1960, initialement musique des quartiers populaires.",
  },
  {
    id: 3,
    question: "Qu'est-ce que le 'clave' en Bachata ?",
    options: [
      "Le nom du pas de base",
      "La structure rythmique fondamentale de la musique",
      "Un style de tour de lady",
      "Le prénom d'un danseur célèbre",
    ],
    correct: 1,
    explanation: "Le clave est la structure rythmique de base de la musique latine, composé d'un pattern de 8 temps (clave 3-2 ou 2-3).",
  },
  {
    id: 4,
    question: "Quel artiste a popularisé la Bachata à l'international dans les années 90 ?",
    options: ["Romeo Santos", "Juan Luis Guerra", "Prince Royce", "Aventura"],
    correct: 1,
    explanation: "Juan Luis Guerra est le pionnier de la Bachata mondiale avec son album 'Bachata Rosa' (1990), qui a introduit le genre au grand public international.",
  },
  {
    id: 5,
    question: "Le style 'Bachata Sensual' a été développé principalement en :",
    options: ["République Dominicaine", "États-Unis", "France", "Espagne"],
    correct: 3,
    explanation: "La Bachata Sensual est un style moderne développé principalement en Espagne, notamment par Jorge & Tania et d'autres professeurs espagnols.",
  },
];

export default function TheorieQuizPage() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = QUESTIONS[current];

  function handleSelect(idx: number) {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === question.correct) setScore((s) => s + 1);
  }

  function handleNext() {
    if (current < QUESTIONS.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setFinished(true);
    }
  }

  function handleRestart() {
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
  }

  const pct = Math.round((score / QUESTIONS.length) * 100);

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Tester mes connaissances</p>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            Quiz{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Bachata
            </span>
          </h1>
          <p className="text-white/60">
            {QUESTIONS.length} questions sur la culture, l&apos;histoire et la technique.
          </p>
        </div>

        {!finished ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
            {/* Progress */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-white/40 text-sm">Question {current + 1} / {QUESTIONS.length}</span>
              <span className="text-white/40 text-sm">Score : {score}/{current + (answered ? 1 : 0)}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full mb-8 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${((current + (answered ? 1 : 0)) / QUESTIONS.length) * 100}%` }}
              />
            </div>

            {/* Question */}
            <h2 className="text-xl font-bold text-white mb-6 leading-relaxed">{question.question}</h2>

            {/* Options */}
            <div className="flex flex-col gap-3 mb-6">
              {question.options.map((opt, idx) => {
                let cls = "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 hover:text-white";
                if (answered) {
                  if (idx === question.correct) cls = "bg-emerald-500/20 border-emerald-500/50 text-emerald-300";
                  else if (idx === selected && selected !== question.correct) cls = "bg-red-500/20 border-red-500/50 text-red-300";
                  else cls = "bg-white/3 border-white/5 text-white/30";
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={answered}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 text-sm font-medium ${cls}`}
                  >
                    <span className="mr-3 opacity-50">{String.fromCharCode(65 + idx)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Explication */}
            {answered && (
              <div className={`rounded-xl px-5 py-4 mb-6 border text-sm ${selected === question.correct ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-red-500/10 border-red-500/30 text-red-300"}`}>
                <span className="font-bold">{selected === question.correct ? "✅ Correct !" : "❌ Pas tout à fait."}</span>
                {" "}{question.explanation}
              </div>
            )}

            {answered && (
              <button
                onClick={handleNext}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm transition-all duration-200"
              >
                {current < QUESTIONS.length - 1 ? "Question suivante →" : "Voir mon score"}
              </button>
            )}
          </div>
        ) : (
          // Résultats
          <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center backdrop-blur-md">
            <div className="text-7xl mb-4">
              {pct >= 80 ? "🏆" : pct >= 60 ? "👏" : pct >= 40 ? "📚" : "💪"}
            </div>
            <h2 className="text-3xl font-black text-white mb-2">
              {pct >= 80 ? "Excellent !" : pct >= 60 ? "Très bien !" : pct >= 40 ? "Pas mal !" : "À réviser !"}
            </h2>
            <p className="text-white/60 mb-6">
              Tu as obtenu <span className="text-white font-bold">{score} / {QUESTIONS.length}</span> ({pct}%)
            </p>

            {/* Barre de score */}
            <div className="h-3 bg-white/10 rounded-full mb-8 overflow-hidden max-w-xs mx-auto">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${pct >= 80 ? "bg-gradient-to-r from-emerald-400 to-cyan-400" : pct >= 60 ? "bg-gradient-to-r from-amber-400 to-orange-400" : "bg-gradient-to-r from-red-400 to-pink-400"}`}
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRestart}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm transition-all duration-200"
              >
                🔄 Recommencer
              </button>
              <a
                href="/theorie/cours"
                className="px-6 py-3 rounded-xl bg-white/8 border border-white/15 text-white/70 hover:bg-white/12 hover:text-white text-sm font-medium transition-all duration-200"
              >
                📖 Réviser les leçons
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
