import {Router} from 'express';
import { handleVerifyDocument } from '../controllers/documentController.js';
import { upload } from '../middlewares/uploadHandler.js';

const router = Router();

router.post('/verify-document',upload.single('document'), handleVerifyDocument)

export default router