const Transcript = require('../models/Transcript');

exports.saveTranscript = async (req, res) => {
  const { sessionId, transcript } = req.body;
  const saved = await Transcript.create({ sessionId, transcript });
  res.json(saved);
};

exports.getMOM = async (req, res) => {
  const { sessionId } = req.params;
  const data = await Transcript.findOne({ sessionId });
  if (!data) return res.status(404).send('Not found');

  const actionItems = data.transcript.filter(line =>
    /assign|complete|decide|deadline/i.test(line)
  );
  res.json({ sessionId, actionItems });
};
