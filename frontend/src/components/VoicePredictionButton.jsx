// frontend/src/components/VoicePredictionButton.jsx

const VoicePredictionButton = ({ stock }) => {

  const speakPrediction = () => {
    const message = `
      Prediction for ${stock.symbol}, ${stock.company}.
      Current price is ${stock.currentPrice} dollars.
      The AI analysis indicates: ${stock.prediction}.
      Confidence level is ${stock.confidence} percent.
      Expected target price is ${stock.targetPrice} dollars
      within ${stock.timeframe}.
    `;

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "en-US";
    utterance.pitch = 1;
    utterance.rate = 1;

    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={speakPrediction}
      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full transition-all"
    >
      🔊 Speak Prediction
    </button>
  );
};

export default VoicePredictionButton;
