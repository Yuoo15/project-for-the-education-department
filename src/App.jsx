import { useState, useEffect } from "react";
import questions from "./questions";
import "./App.css";

function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === "correct") {
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.setValueAtTime(900, ctx.currentTime + 0.1);
    } else {
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.15);
    }
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}

function App() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [userAnswers, setUserAnswers] = useState([]);

  useEffect(() => {
    if (isFinished || !isStarted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished, isStarted]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleAnswer = (index) => {
    if (isAnswered) return;

    setSelected(index);
    setIsAnswered(true);

    const isCorrect = index === questions[current].correct;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      playSound("correct");
    } else {
      playSound("wrong");
    }

    setUserAnswers((prev) => [
      ...prev,
      { questionId: questions[current].id, chosen: index, correct: questions[current].correct },
    ]);
  };

  const nextQuestion = () => {
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      setSelected(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const restartTest = () => {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setIsAnswered(false);
    setIsFinished(false);
    setTimeLeft(10 * 60);
    setIsStarted(false);
    setUserAnswers([]);
  };

  const progress = ((current + (isAnswered ? 1 : 0)) / questions.length) * 100;

  const startTest = () => {
    setIsStarted(true);
    setTimeLeft(10 * 60);
  };

  return (
    <>
      {!isStarted && !isFinished && (
        <>
          <div className="start-screen">
            <button onClick={startTest}>Начать тест</button>
          </div>

          <div className="mob-screen">
            <h1>СОРТИРОВКА БЮЛЛЕТЕНИЙ</h1>
            <p>
              Рассортируйте бюллетени согласно ст. 30 Конституционного закона Республики Казахстана "О республиканском референдуме"
            </p>
            <h2>ИСХОДНЫЕ ДАННЫЕ:</h2>
            <ul>
              <li>Согласен</li>
              <li>Не согласен</li>
              <li>Недействительный</li>
              <li>Действительный, но не учитываемый</li>
              <li>Не учитываемый при подсчете</li>
              <li>Члены УКР, выдавшие бюллетени: Ахметова, Мукашева, Алматова</li>
            </ul>
            <button onClick={startTest}>Начать тест</button>
          </div>
        </>
      )}

      {isStarted && !isFinished && (
        <div className="content">
          <div className="timer">⏳ {formatTime(timeLeft)}</div>
          <div className="progress-bar-wrapper">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <h1 className="mob">Рассортируйте бюллетени:</h1>
          <div className="image">
            <img
              src={questions[current].image}
              className="img"
              alt={`Фото вопроса ${current + 1}`}
            />
          </div>
          <div className="app">
            <h1 className="des">Рассортируйте бюллетени:</h1>
            <div className="quiz">
              <ul>
                {questions[current].options.map((option, index) => {
                  let className = "";
                  if (isAnswered) {
                    if (index === questions[current].correct) className = "correct";
                    else if (index === selected) className = "wrong";
                  }

                  return (
                    <li key={index}>
                      <button
                        className={className}
                        onClick={() => handleAnswer(index)}
                        disabled={isAnswered}
                      >
                        {option}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {isAnswered && (
                <button className="next-btn" onClick={nextQuestion}>
                  {current + 1 < questions.length ? "Далее" : "Завершить ✅"}
                </button>
              )}

              <p>{current + 1} / {questions.length}</p>
            </div>
          </div>
        </div>
      )}

      {isFinished && (
        <div className="finish-screen">
          <div className="result">
            <h2>Вы ответили правильно на {score} из {questions.length}</h2>
            {score === questions.length && <p>Отличная работа! Все ответы верны!</p>}
            {score < questions.length && <p>Попробуйте снова, чтобы улучшить результат.</p>}
            {userAnswers.length > 0 && (
              <div className="details-table">
                <h3>Детальные результаты</h3>
                <table>
                  <thead>
                    <tr>
                      <th>№</th>
                      <th>Ваш ответ</th>
                      <th>Правильный ответ</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {userAnswers.map((ans, i) => {
                      const q = questions.find((q) => q.id === ans.questionId);
                      const isOk = ans.chosen === ans.correct;
                      return (
                        <tr key={i} className={isOk ? "row-correct" : "row-wrong"}>
                          <td>{ans.questionId}</td>
                          <td>{q.options[ans.chosen]}</td>
                          <td>{q.options[ans.correct]}</td>
                          <td>{isOk ? "✅" : "❌"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <button onClick={restartTest}>Вернуться на главную</button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
