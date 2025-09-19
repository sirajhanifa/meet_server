const express = require('express');
const router = express.Router();
const { saveTranscript, getMOM } = require('../controllers/transcriptController');

router.post('/transcript', saveTranscript);
router.get('/mom/:sessionId', getMOM);

module.exports = router;
