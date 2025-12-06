exports.ask = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: "message required" });

  // simple demo response (replace later with real AI)
  const reply =
    "AgroTrust Bot: I received your question. Try asking about crops, subsidy, or complaints.";

  res.json({ reply });
};
