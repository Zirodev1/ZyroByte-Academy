import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Header from '../Header';
import Footer from '../Footer';
import './QuizAttempt.css';

const QuizAttempt = () => {
  const { courseId, quizId } = useParams();
  
  const [quiz, setQuiz] = useState(null);
  const [course, setCourse] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        const [quizResponse, courseResponse] = await Promise.all([
          api.get(`/quizzes/${quizId}`),
          api.get(`/courses/${courseId}`)
        ]);
        
        setQuiz(quizResponse.data);
        setCourse(courseResponse.data);
        
        // Initialize answers state with empty values
        if (quizResponse.data && quizResponse.data.questions) {
          const initialAnswers = {};
          quizResponse.data.questions.forEach((_, index) => {
            initialAnswers[index] = '';
          });
          setAnswers(initialAnswers);
        }
      } catch (error) {
        console.error('Error fetching quiz data:', error);
        setError('Failed to load quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId, courseId]);

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers({
      ...answers,
      [questionIndex]: answer
    });
  };

  const calculateScore = () => {
    if (!quiz || !quiz.questions) return 0;
    
    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    return {
      score: correctAnswers,
      total: quiz.questions.length,
      percentage: Math.round((correctAnswers / quiz.questions.length) * 100)
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const results = calculateScore();
    setResults(results);
    setSubmitted(true);
    
    try {
      // Send quiz results to the backend
      await api.post(`/courses/${courseId}/quizzes/${quizId}/submit`, {
        answers,
        score: results.score,
        total: results.total
      });
    } catch (error) {
      console.error('Error submitting quiz results:', error);
      // We still show results even if saving fails
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="quiz-attempt-container">
          <div className="loading">Loading quiz...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div className="quiz-attempt-container">
          <div className="error-message">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!quiz || !course) {
    return (
      <div>
        <Header />
        <div className="quiz-attempt-container">
          <div className="error-message">Quiz or course not found.</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="quiz-attempt-container">
        <div className="quiz-header">
          <h1 className="quiz-title">{quiz.title}</h1>
          <p className="quiz-course">Course: {course.title}</p>
        </div>
        
        {submitted ? (
          <div className="quiz-results">
            <div className="result-summary">
              <h2>Quiz Results</h2>
              <div className="score-display">
                <div className="score-circle" style={{ 
                  background: `conic-gradient(#38b2ac ${results.percentage}%, #e2e8f0 0)` 
                }}>
                  <div className="score-inner">
                    <span className="score-percentage">{results.percentage}%</span>
                  </div>
                </div>
                <div className="score-text">
                  <p>You scored <strong>{results.score} out of {results.total}</strong></p>
                  <p className="result-message">
                    {results.percentage >= 70 
                      ? 'Great job! You passed the quiz.' 
                      : 'Keep studying and try again!'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="question-review">
              <h3>Review Your Answers</h3>
              {quiz.questions.map((question, index) => {
                const isCorrect = answers[index] === question.correctAnswer;
                
                return (
                  <div 
                    key={index} 
                    className={`question-result ${isCorrect ? 'correct' : 'incorrect'}`}
                  >
                    <h4>Question {index + 1}: {question.question}</h4>
                    <div className="options-review">
                      {question.options.map((option, optionIndex) => (
                        <div 
                          key={optionIndex} 
                          className={`option-review 
                            ${answers[index] === option ? 'selected' : ''} 
                            ${option === question.correctAnswer ? 'correct-answer' : ''}`}
                        >
                          {option}
                          {option === question.correctAnswer && <span className="correct-mark">✓</span>}
                          {option === answers[index] && option !== question.correctAnswer && 
                            <span className="incorrect-mark">✗</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="quiz-actions">
              <Link to={`/courses/${courseId}`} className="button">
                Back to Course
              </Link>
              <button 
                onClick={() => {
                  setSubmitted(false);
                  setResults(null);
                  // Reset answers if desired
                  // const initialAnswers = {};
                  // quiz.questions.forEach((_, index) => {
                  //   initialAnswers[index] = '';
                  // });
                  // setAnswers(initialAnswers);
                }}
                className="button retry-button"
              >
                Retry Quiz
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="quiz-form">
            {quiz.questions.map((question, questionIndex) => (
              <div key={questionIndex} className="question-container">
                <h3>Question {questionIndex + 1}: {question.question}</h3>
                <div className="options-container">
                  {question.options.map((option, optionIndex) => (
                    <label key={optionIndex} className="option-label">
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        value={option}
                        checked={answers[questionIndex] === option}
                        onChange={() => handleAnswerChange(questionIndex, option)}
                        required
                      />
                      <span className="option-text">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="form-actions">
              <Link to={`/courses/${courseId}`} className="button cancel-button">
                Cancel
              </Link>
              <button 
                type="submit" 
                className="button submit-button"
                disabled={Object.values(answers).some(answer => answer === '')}
              >
                Submit Quiz
              </button>
            </div>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default QuizAttempt; 