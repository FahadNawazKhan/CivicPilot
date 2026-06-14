import { Router } from 'express';
import {
  getQuestions,
  createQuestion,
  createAnswer,
  upvoteQuestion,
  upvoteAnswer
} from '../controllers/questionController.js';
import { authenticateUser, optionalAuthenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/questions', getQuestions);
router.post('/questions', authenticateUser, createQuestion);
router.post('/questions/:questionId/answers', authenticateUser, createAnswer);
router.post('/questions/:questionId/upvote', optionalAuthenticate, upvoteQuestion);
router.post('/questions/:questionId/answers/:answerId/upvote', optionalAuthenticate, upvoteAnswer);

export default router;
