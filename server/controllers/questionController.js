import Question from '../models/Question.js';

/**
 * Retrieves all questions, with optional text search, category filters, and process filters.
 */
export const getQuestions = async (req, res) => {
  try {
    const { processId, category, search, sort } = req.query;

    const queryCondition = {};

    if (processId) {
      queryCondition.processId = processId;
    }

    if (category && category !== 'All') {
      queryCondition.category = category;
    }

    if (search && search.trim() !== '') {
      // Use Mongo Text search on text indices
      queryCondition.$text = { $search: search.trim() };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') {
      sortOption = { upvotes: -1, createdAt: -1 };
    }

    const questions = await Question.find(queryCondition).sort(sortOption);
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Error loading Q&A database.' });
  }
};

/**
 * Creates a new question in the database.
 */
export const createQuestion = async (req, res) => {
  try {
    const { title, content, category, processId } = req.body;
    const userId = req.user?.userId;
    const username = req.user?.username || 'Citizen';

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required to post questions.' });
    }

    if (!title || !content || !category || !processId) {
      return res.status(400).json({ error: 'Please fill out all required question fields.' });
    }

    const newQuestion = new Question({
      title: title.trim(),
      content: content.trim(),
      category,
      processId,
      userId,
      username
    });

    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Error submitting your question.' });
  }
};

/**
 * Creates an answer under a specific question.
 */
export const createAnswer = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId;
    const username = req.user?.username || 'Citizen Expert';

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required to post answers.' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Answer content cannot be empty.' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    const newAnswer = {
      content: content.trim(),
      username,
      userId,
      upvotes: 0,
      upvotedUsers: []
    };

    question.answers.push(newAnswer);
    await question.save();

    res.status(201).json(question);
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'Error submitting answer.' });
  }
};

/**
 * Upvotes a question securely.
 */
export const upvoteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const identifier = req.user?.userId || req.ip;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    if (question.upvotedUsers.includes(identifier)) {
      return res.status(400).json({ error: 'You have already upvoted this question.' });
    }

    question.upvotes += 1;
    question.upvotedUsers.push(identifier);
    await question.save();

    res.json({ success: true, upvotes: question.upvotes });
  } catch (error) {
    console.error('Error upvoting question:', error);
    res.status(500).json({ error: 'Error processing question upvote.' });
  }
};

/**
 * Upvotes an answer securely.
 */
export const upvoteAnswer = async (req, res) => {
  try {
    const { questionId, answerId } = req.params;
    const identifier = req.user?.userId || req.ip;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    const answer = question.answers.id(answerId);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found.' });
    }

    if (answer.upvotedUsers.includes(identifier)) {
      return res.status(400).json({ error: 'You have already upvoted this answer.' });
    }

    answer.upvotes += 1;
    answer.upvotedUsers.push(identifier);
    await question.save();

    res.json({ success: true, upvotes: answer.upvotes });
  } catch (error) {
    console.error('Error upvoting answer:', error);
    res.status(500).json({ error: 'Error processing answer upvote.' });
  }
};
