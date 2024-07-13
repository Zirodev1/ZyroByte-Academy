import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../Header';
import Footer from '../Footer';

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [form, setForm] = useState({ questions: [{ questionText: '', answerOptions: [{ answerText: '', isCorrect: false }] }], course: '', lesson: '' });
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [editing, setEditing] = useState(false);
  const [quizId, setQuizId] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await api.get('/quizzes');
        setQuizzes(response.data);
      } catch (error) {
        console.error('Error fetching quizzes', error);
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses');
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses', error);
      }
    };

    const fetchLessons = async () => {
      try {
        const response = await api.get('/lessons');
        setLessons(response.data);
      } catch (error) {
        console.error('Error fetching lessons', error);
      }
    };

    fetchQuizzes();
    fetchCourses();
    fetchLessons();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (e, questionIndex) => {
    const newQuestions = form.questions.slice();
    newQuestions[questionIndex][e.target.name] = e.target.value;
    setForm({ ...form, questions: newQuestions });
  };

  const handleAnswerChange = (e, questionIndex, answerIndex) => {
    const newQuestions = form.questions.slice();
    newQuestions[questionIndex].answerOptions[answerIndex][e.target.name] = e.target.value;
    setForm({ ...form, questions: newQuestions });
  };

  const handleAddQuestion = () => {
    setForm({ ...form, questions: [...form.questions, { questionText: '', answerOptions: [{ answerText: '', isCorrect: false }] }] });
  };

  const handleAddAnswer = (questionIndex) => {
    const newQuestions = form.questions.slice();
    newQuestions[questionIndex].answerOptions.push({ answerText: '', isCorrect: false });
    setForm({ ...form, questions: newQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editing) {
        await api.put(`/quizzes/${quizId}`, form);
      } else {
        await api.post('/quizzes', form);
      }
      setForm({ questions: [{ questionText: '', answerOptions: [{ answerText: '', isCorrect: false }] }], course: '', lesson: '' });
      setEditing(false);
      setQuizId(null);
      const response = await api.get('/quizzes');
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error saving quiz', error);
    }
  };

  const handleEdit = (quiz) => {
    setForm({ questions: quiz.questions, course: quiz.course, lesson: quiz.lesson });
    setEditing(true);
    setQuizId(quiz._id);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/quizzes/${id}`);
      const response = await api.get('/quizzes');
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error deleting quiz', error);
    }
  };

  return (
    <div>
      <Header />
      <main>
        <h2>Quiz Management</h2>
        <form onSubmit={handleSubmit}>
          {form.questions.map((question, questionIndex) => (
            <div key={questionIndex}>
              <input
                type="text"
                name="questionText"
                placeholder="Question"
                value={question.questionText}
                onChange={(e) => handleQuestionChange(e, questionIndex)}
                required
              />
              {question.answerOptions.map((answer, answerIndex) => (
                <div key={answerIndex}>
                  <input
                    type="text"
                    name="answerText"
                    placeholder="Answer"
                    value={answer.answerText}
                    onChange={(e) => handleAnswerChange(e, questionIndex, answerIndex)}
                    required
                  />
                  <label>
                    Correct
                    <input
                      type="checkbox"
                      name="isCorrect"
                      checked={answer.isCorrect}
                      onChange={(e) => handleAnswerChange({ target: { name: 'isCorrect', value: e.target.checked } }, questionIndex, answerIndex)}
                    />
                  </label>
                </div>
              ))}
              <button type="button" onClick={() => handleAddAnswer(questionIndex)}>Add Answer</button>
            </div>
          ))}
          <button type="button" onClick={handleAddQuestion}>Add Question</button>
          <select
            name="course"
            value={form.course}
            onChange={handleChange}
            required
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>{course.title}</option>
            ))}
          </select>
          <select
            name="lesson"
            value={form.lesson}
            onChange={handleChange}
          >
            <option value="">Select Lesson</option>
            {lessons.map((lesson) => (
              <option key={lesson._id} value={lesson._id}>{lesson.title}</option>
            ))}
          </select>
          <button type="submit">{editing ? 'Update' : 'Create'} Quiz</button>
        </form>
        <ul>
          {quizzes.map((quiz) => (
            <li key={quiz._id}>
              <h3>Quiz for {quiz.course ? quiz.course.title : 'Unassigned Course'}</h3>
              <button onClick={() => handleEdit(quiz)}>Edit</button>
              <button onClick={() => handleDelete(quiz._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
};

export default QuizManagement;
