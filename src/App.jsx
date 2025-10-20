import { useState, useEffect } from "react";
import questions from "./questions";
import "./App.css";

function App() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10 * 60);
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

    if (index === questions[current].correct) {
      setScore((prev) => prev + 1);
      setErrorMessage("✅ Правильно!");
    } else {
      const correctText = questions[current].options[questions[current].correct];
      setErrorMessage(`❌ Неправильно! Правильный ответ: ${correctText}`);
    }
  };

  const nextQuestion = () => {
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      setSelected(null);
      setIsAnswered(false);
      setErrorMessage("");
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
    setErrorMessage("");
    setTimeLeft(10 * 60);
    setIsStarted(false);
  };

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
          <h1>СОРТИРОВКА БЮЛЛЕТЕНИЙ интерактив</h1>
          <p>Рассортируйте бюллетени по голосам, поданным за кандидатов, отделяя недействительные бюллетени<br />(15 бюллетеней за 10 мин)</p>
          <h2>ИСХОДНЫЕ ДАННЫЕ:</h2>
          <ul>
            <li>выборы акима сельского округа</li>
            <li>кандидаты № 1, № 2, № 3</li>
            <li>члены УИК, выдавшие бюллетени: Ахметова, Мукашева, Алматова</li>
          </ul>
          <button onClick={startTest}>Начать тест</button>
        </div>
        </>
      )}

      {isStarted && !isFinished && (
        <div className="content">
          <div className="timer">⏳ {formatTime(timeLeft)}</div>
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
              <h2>{questions[current].question}</h2>
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
                <>
                  <p className="error-message fade-in">{errorMessage}</p>
                  <button className="next-btn" onClick={nextQuestion}>
                    {current + 1 < questions.length ? "Далее" : "Завершить ✅"}
                  </button>
                </>
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
            <button onClick={restartTest}>Вернуться на главную</button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
