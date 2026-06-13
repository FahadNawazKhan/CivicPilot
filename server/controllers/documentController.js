import fs from 'fs';
import { analyzeDocument } from '../geminiService.js';
import { getSafeFilePath } from '../middlewares/uploadHandler.js';

export const handleVerifyDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    const { docName } = req.body;
    if (!docName) {
      // Clean up uploaded file
      try {
        const safePath = getSafeFilePath(req.file.filename);
        fs.unlinkSync(safePath);
      } catch (e) {}
      return res.status(400).json({ error: 'Document name is required.' });
    }

    // Resolve file path securely and read its content buffer
    const safePath = getSafeFilePath(req.file.filename);
    const fileBuffer = fs.readFileSync(safePath);
    const mimeType = req.file.mimetype;

    // Call Gemini API (or local mock fallback) to audit the document
    const result = await analyzeDocument(docName, fileBuffer, mimeType);

    // Clean up uploaded file from server after analysis to save space / protect PII
    try {
      fs.unlinkSync(safePath);
    } catch (cleanupErr) {
      console.warn("Could not delete uploaded file:", cleanupErr.message);
    }

    res.json(result);
  } catch (error) {
    console.error("Document verification error:", error);
    // Attempt cleanup if file exists
    if (req.file && req.file.filename) {
      try {
        const safePath = getSafeFilePath(req.file.filename);
        if (fs.existsSync(safePath)) {
          fs.unlinkSync(safePath);
        }
      } catch (e) {}
    }
    res.status(500).json({ error: 'Error auditing document. Please try again.' });
  }
};