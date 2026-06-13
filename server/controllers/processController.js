import knowledgeBase from '../knowledgeBase.js';
import { discoverProcess, answerQuestion } from '../geminiService.js';

export const getAllProcesses = (req, res) => {
  try {
    res.json(Object.values(knowledgeBase));
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve processes.' });
  }
};

export const getProcessById = (req, res) => {
  try {
    const processId = req.params.id;
    if (knowledgeBase[processId]) {
      res.json(knowledgeBase[processId]);
    } else {
      res.status(404).json({ error: 'Process not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error retrieving process details.' });
  }
};

export const handleDiscover = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required.' });
    }

    const matchedProcess = await discoverProcess(query);
    if (matchedProcess) {
      res.json({ found: true, process: matchedProcess });
    } else {
      res.json({ found: false, message: 'Could not match query to any standard process. Please browse from the list below.' });
    }
  } catch (error) {
    console.error("Discovery error:", error);
    res.status(500).json({ error: 'Error processing discovery request.' });
  }
};

export const handleChat = async (req, res) => {
  try {
    const { processId, question, history } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    let targetProcessId = processId;
    if (!targetProcessId || targetProcessId === 'general') {
      const matched = await discoverProcess(question);
      targetProcessId = matched ? matched.id : 'general';
    }

    if (targetProcessId !== 'general' && !knowledgeBase[targetProcessId]) {
      return res.status(404).json({ error: 'Invalid process ID.' });
    }

    const answer = await answerQuestion(targetProcessId, question, history || []);
    res.json({ answer });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: 'Error generating chatbot response.' });
  }
};