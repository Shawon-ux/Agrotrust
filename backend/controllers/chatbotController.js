exports.askBot = async (req, res) => {
    const { question } = req.body;
    // Stub: in real life integrate NLP or external service
    res.json({ answer: `This is a dummy answer to: "${question}"` });
  };
  