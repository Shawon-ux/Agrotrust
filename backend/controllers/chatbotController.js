// backend/controllers/chatbotController.js
const { Client } = require("@gradio/client");

// Function to get an example image (simplified without axios)
const getExampleImage = async () => {
  try {
    // For now, return null or use a local fallback
    // In production, you might want to use a local image or remove this
    return null;
  } catch (error) {
    console.error("Error getting example image:", error);
    return null;
  }
};

// Function to process crop-related questions
const processCropQuestion = (question) => {
  const q = question.toLowerCase();
  
  if (q.includes("rice") || q.includes("ধান")) {
    return {
      reply: "🌾 **Rice Farming Guide**\n\n**Best Varieties in Bangladesh:**\n- BRRI Dhan-28, BRRI Dhan-29\n- BINA Dhan-7, BINA Dhan-8\n- Hybrid varieties\n\n**Season:**\n- Aman (July-Nov)\n- Boro (Dec-May)\n- Aus (Apr-Aug)\n\n**Price Range:** ৳45-65/kg\n**Yield:** 4-5 tons/hectare\n**Government Support:** Subsidy available for seeds and fertilizers\n\n**Need more specific info?** Upload a photo of your rice crop for disease diagnosis!"
    };
  }
  
  if (q.includes("wheat") || q.includes("গম")) {
    return {
      reply: "🌾 **Wheat Farming Guide**\n\n**Best Varieties:**\n- Shatabdi, Prodip\n- BARI Gom-26, BARI Gom-28\n- Kanchan, Akbar\n\n**Season:** November to March\n**Sowing Time:** Nov 15-30 (Best)\n**Harvesting:** Mar-Apr\n\n**Price Range:** ৳48-55/kg\n**Yield:** 3-4 tons/hectare\n**Soil:** Loamy soil with good drainage\n\n**Subsidy:** Available for quality seeds through DAE"
    };
  }
  
  if (q.includes("potato") || q.includes("আলু")) {
    return {
      reply: "🥔 **Potato Farming Guide**\n\n**Popular Varieties:**\n- Granola, Cardinal\n- Diamant, Lady Rosetta\n- BARI Alu-7, BARI Alu-8\n\n**Season:** Oct-Feb\n**Planting:** Mid-Oct to Nov\n**Harvest:** Jan-Feb\n\n**Price Range:** ৳25-40/kg\n**Yield:** 20-25 tons/hectare\n**Storage:** Cool, dark place (4-8°C)\n\n**Market Tip:** Early potatoes get better prices!"
    };
  }
  
  if (q.includes("subsidy") || q.includes("সাবসিডি")) {
    return {
      reply: "💰 **Subsidy Information**\n\n**Available Subsidies for Farmers:**\n1. **Seed Subsidy:** 50% on certified seeds\n2. **Fertilizer Subsidy:** 25% on Urea, TSP, MOP\n3. **Irrigation Subsidy:** 50% on diesel for irrigation\n4. **Machinery Subsidy:** 30-50% on agricultural machinery\n\n**How to Apply:**\n1. Visit your local DAE office\n2. Submit land documents\n3. Provide farmer ID card\n4. Fill subsidy application form\n\n**Eligibility:** Registered farmers with minimum 0.5 acre land\n\n**Need help applying?** I can guide you through the process!"
    };
  }
  
  if (q.includes("disease") || q.includes("রোগ")) {
    return {
      reply: "🏥 **Crop Disease Help**\n\n**Common Diseases in Bangladesh:**\n\n**Rice:**\n- Blast Disease (ফোলা রোগ)\n- Brown Spot (বাদামী দাগ)\n- Bacterial Leaf Blight\n\n**Wheat:**\n- Rust (মরিচা রোগ)\n- Leaf Blight\n- Powdery Mildew\n\n**Potato:**\n- Late Blight\n- Early Blight\n- Bacterial Wilt\n\n**Solution:** Upload a photo of affected crop leaves for AI diagnosis and treatment recommendations!"
    };
  }
  
  if (q.includes("price") || q.includes("দাম")) {
    return {
      reply: "📊 **Current Market Prices (approx):**\n\n**Rice:**\n- BRRI Dhan-28: ৳55-60/kg\n- Miniket: ৳65-70/kg\n- Nazirshail: ৳75-80/kg\n\n**Wheat:** ৳48-52/kg\n**Potato:** ৳30-35/kg\n**Onion:** ৳90-100/kg\n**Tomato:** ৳65-75/kg\n\n**Market Tips:**\n1. Check prices at nearby Krishi Bazar\n2. Sell during morning hours\n3. Grade your crops for better price\n4. Use AgroTrust platform for direct buyer contact\n\n**Note:** Prices vary by location and season"
    };
  }
  
  if (q.includes("fertilizer") || q.includes("সার")) {
    return {
      reply: "🌱 **Fertilizer Guide**\n\n**Recommended Fertilizers:**\n\n**For Rice (per hectare):**\n- Urea: 200-250 kg\n- TSP: 100-150 kg\n- MOP: 80-100 kg\n- Gypsum: 50-60 kg\n\n**For Wheat:**\n- Urea: 180-220 kg\n- TSP: 120-150 kg\n- MOP: 60-80 kg\n\n**For Potato:**\n- Urea: 250-300 kg\n- TSP: 200-250 kg\n- MOP: 150-200 kg\n\n**Application Time:**\n- Basal: During land preparation\n- Top dressing: 25-30 days after planting\n\n**Subsidy:** Available at government fertilizer dealers"
    };
  }
  
  if (q.includes("weather") || q.includes("আবহাওয়া")) {
    return {
      reply: "🌤️ **Weather Advisory for Farmers**\n\n**Current Season:**\n- Rabi Season (Oct-Mar): Wheat, Potato, Vegetables\n- Kharif Season (Apr-Sep): Rice, Jute, Maize\n\n**Upcoming Weather Alert:**\nCheck Bangladesh Meteorological Department for daily updates\n\n**Tips for Different Weather:**\n\n**Rainy Season:**\n- Ensure proper drainage\n- Protect crops from waterlogging\n- Spray fungicides to prevent diseases\n\n**Dry Season:**\n- Irrigate regularly\n- Mulch to conserve moisture\n- Water early morning or late afternoon\n\n**Need specific weather info for your area?** Tell me your district!"
    };
  }
  
  if (q.includes("complaint") || q.includes("অভিযোগ")) {
    return {
      reply: "⚖️ **Complaint System**\n\n**You can file complaints for:**\n1. **Fraudulent Buyers/Sellers**\n2. **Poor Quality Products**\n3. **Payment Issues**\n4. **Delivery Problems**\n\n**How to File a Complaint:**\n1. Go to Complaints page\n2. Click 'Submit Complaint'\n3. Provide details and evidence\n4. Submit for admin review\n\n**Complaint Status:**\n- PENDING: Under review\n- IN_REVIEW: Being investigated\n- RESOLVED: Issue solved\n- REJECTED: Not valid\n\n**Need help filing a complaint?** I can guide you through the process!"
    };
  }
  
  return null;
};

exports.ask = async (req, res) => {
  try {
    const { message, image } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        reply: "Please provide a question or message." 
      });
    }

    console.log("Chatbot question:", message);
    
    // First, check if it's a general crop-related question
    const cropResponse = processCropQuestion(message);
    if (cropResponse) {
      return res.json(cropResponse);
    }

    // If image is provided, use AI model
    if (image) {
      try {
        // Convert base64 image to buffer
        let imageBuffer;
        if (image.startsWith('data:image')) {
          // Remove data URL prefix
          const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
          imageBuffer = Buffer.from(base64Data, 'base64');
        } else {
          // No example image - use general response
          throw new Error("No image available for analysis");
        }

        // Connect to AGRO AI model
        const client = await Client.connect("EYEDOL/AGRO");
        
        // Call the AI model
        const result = await client.predict("/gradio_pipeline", {
          image: imageBuffer,
          question: message,
          k: 1,
        });

        console.log("AI Response:", result.data);
        
        // Format the AI response
        const aiReply = Array.isArray(result.data) 
          ? result.data[0] 
          : typeof result.data === 'string' 
            ? result.data 
            : JSON.stringify(result.data);

        return res.json({
          reply: `🤖 **AI Analysis:**\n\n${aiReply}\n\n*Powered by AGRO AI Model*`
        });

      } catch (aiError) {
        console.error("AI Model Error:", aiError);
        
        // Fallback to general response if AI fails
        return res.json({
          reply: `🌱 **AgroTrust Bot:**\n\nI received your question about "${message}".\n\nFor text questions about:\n- Crop prices\n- Farming techniques\n- Subsidy information\n- Disease diagnosis\n- Weather advice\n\nPlease ask specifically!\n\n**Try asking:**\n• "What's the rice price?"\n• "How to apply for subsidy?"\n• "Tell me about potato farming"\n• "Common rice diseases and treatments"`
        });
      }
    }

    // General response for text-only questions
    return res.json({
      reply: `🌱 **AgroTrust Bot:**\n\nI can help you with:\n\n📊 **Market Information:**\n• Crop prices\n• Market trends\n• Buyer contacts\n\n🌾 **Farming Advice:**\n• Best crops for your area\n• Farming techniques\n• Fertilizer recommendations\n\n💰 **Government Support:**\n• Subsidy information\n• How to apply\n• Eligibility criteria\n\n🏥 **Crop Health:**\n• Disease diagnosis\n• Pest control\n• Treatment suggestions\n\n⚖️ **Platform Help:**\n• How to use AgroTrust\n• Complaint process\n• Order management\n\n**To get the best help:**\n1. Ask specific questions\n2. Mention your location for localized advice\n\n**Example questions:**\n• "What's the current rice price in Bogura?"\n• "How to treat rice blast disease?"\n• "What subsidies are available for farmers?"`
    });

  } catch (err) {
    console.error("Chatbot error:", err);
    
    // Fallback response
    return res.json({
      reply: "🌱 **AgroTrust Bot:**\n\nI'm here to help with:\n• Crop information and prices\n• Farming advice and techniques\n• Subsidy and government support\n• Crop disease diagnosis\n• Market trends\n\nPlease ask your question!\n\n*Service temporarily limited. For urgent help, contact your local DAE office.*"
    });
  }
};

// Additional function to handle image analysis
exports.analyzeImage = async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ 
        error: "Please provide an image for analysis." 
      });
    }

    // Convert base64 image to buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Connect to AGRO AI model
    const client = await Client.connect("EYEDOL/AGRO");
    
    // Call the AI model with a general question
    const result = await client.predict("/gradio_pipeline", {
      image: imageBuffer,
      question: "What crop disease is this? Provide diagnosis and treatment.",
      k: 1,
    });

    const aiReply = Array.isArray(result.data) 
      ? result.data[0] 
      : typeof result.data === 'string' 
        ? result.data 
        : JSON.stringify(result.data);

    return res.json({
      success: true,
      analysis: aiReply,
      recommendations: [
        "Isolate affected plants immediately",
        "Apply recommended fungicides/pesticides",
        "Improve drainage and air circulation",
        "Consult local agricultural officer for specific treatment"
      ]
    });

  } catch (error) {
    console.error("Image analysis error:", error);
    return res.status(500).json({
      error: "Failed to analyze image. Please try again or consult a local expert."
    });
  }
};