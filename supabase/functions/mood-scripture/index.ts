import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

// Clean and format AI response
function cleanAIResponse(text: string): string {
  if (!text) return text;
  
  let cleanedText = text;
  // Remove excessive formatting but keep structure
  cleanedText = cleanedText.replace(/\*\*(.*?)\*\*/g, '$1');
  cleanedText = cleanedText.replace(/\*(.*?)\*/g, '$1');
  cleanedText = cleanedText.replace(/~~(.*?)~~/g, '$1');
  cleanedText = cleanedText.replace(/`([^`]+)`/g, '$1');
  
  // Clean up extra spaces
  cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
  cleanedText = cleanedText.replace(/\n\s*\n/g, '\n\n');
  
  return cleanedText;
}

interface MoodScriptureRequest {
  moodType: string;
  intensity: number;
  category: string;
  notes?: string;
  userContext?: {
    timeOfDay: string;
    dayOfWeek?: string;
    season?: string;
  };
}

interface ScriptureResponse {
  reference: string;
  verse: string;
  explanation: string;
  application: string;
  moodAlignment: string;
  timestamp: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log('📖 Mood Scripture request received');
    
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const requestData = await req.json();
    const {
      moodType,
      intensity,
      category,
      notes = "",
      userContext = { timeOfDay: "unknown" }
    }: MoodScriptureRequest = requestData;

    if (!moodType || !category) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: moodType and category are required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🎭 Processing mood scripture request:', {
      moodType,
      intensity,
      category,
      hasNotes: notes.length > 0
    });

    // DeepSeek API configuration
    const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY') || '';
    
    if (!DEEPSEEK_API_KEY) {
      console.error('❌ DeepSeek API key is missing!');
      throw new Error('DeepSeek API key is not configured in environment variables.');
    }
    
    console.log('✅ DeepSeek API key found:', DEEPSEEK_API_KEY ? '***' + DEEPSEEK_API_KEY.slice(-4) : 'NOT FOUND');

    // Create contextual system prompt based on mood
    const getMoodSystemPrompt = (mood: string, category: string) => {
      const basePrompt = `You are a compassionate Christian counselor and biblical wisdom provider. Your role is to provide personalized scripture guidance for people based on their current emotional state and spiritual needs.

**CRITICAL: You MUST respond ONLY with valid JSON. No markdown, no code blocks, no additional text - just pure JSON.**

**Your Task:**
- Provide a Bible verse that directly addresses the user's current mood
- Give a brief, meaningful explanation (2-3 sentences) of why this verse is relevant
- Offer a practical application (1-2 sentences) for their current situation
- Connect the verse to their specific emotional experience

**Response Format (JSON only):**
{
  "reference": "Book Chapter:Verse",
  "verse": "Complete verse text",
  "explanation": "2-3 sentences",
  "application": "1-2 sentences",
  "moodAlignment": "How this addresses their mood"
}

**Guidelines:**
- Always include the complete Bible reference (Book Chapter:Verse)
- Provide the full verse text
- Be compassionate and understanding of their emotional state
- Offer hope and encouragement while acknowledging their current feelings
- Keep explanations accessible and relatable
- Focus on God's love, comfort, and guidance
- Use warm, pastoral language
- Respond ONLY with valid JSON - no other text`;

      // Mood-specific additional guidance
      const moodGuidance: Record<string, string> = {
        'positive': `This person is experiencing positive emotions (${mood}). Focus on verses about:
        - Gratitude and thanksgiving
        - Joy and celebration
        - God's blessings and goodness
        - Using positive energy for God's glory
        - Maintaining spiritual humility amid good times`,
        
        'calm': `This person is feeling peaceful/calm (${mood}). Focus on verses about:
        - God's peace that surpasses understanding
        - Rest in God's presence
        - Stillness before the Lord
        - Trusting in God's timing
        - Finding quiet in chaotic world`,
        
        'energetic': `This person is feeling motivated/energetic (${mood}). Focus on verses about:
        - Using energy for God's purposes
        - Boldness in faith
        - Active service and ministry
        - Following God's call with enthusiasm
        - Channeling energy constructively`,
        
        'challenging': `This person is going through difficult emotions (${mood}). Focus on verses about:
        - God's comfort in times of trouble
        - Hope in suffering
        - God's presence in pain
        - Turning to God with burdens
        - Finding strength in weakness
        - God's promises during hard times`,
        
        'curious': `This person is feeling curious/exploratory (${mood}). Focus on verses about:
        - Seeking wisdom and understanding
        - Growing in knowledge of God
        - Asking questions with faith
        - Spiritual discovery and learning
        - Wonder at God's works`,
        
        'spiritual': `This person is feeling spiritually connected (${mood}). Focus on verses about:
        - Intimacy with God
        - Spiritual growth and maturity
        - Walking by faith
        - Being led by the Spirit
        - Deepening relationship with Christ`
      };

      return basePrompt + "\n\n**Mood-Specific Guidance:**\n" + (moodGuidance[category] || moodGuidance['challenging']);
    };

    const systemPrompt = getMoodSystemPrompt(moodType, category);
    
    // Build user context
    const timeContext = userContext.timeOfDay ? `Time: ${userContext.timeOfDay}` : '';
    const notesContext = notes ? `User's thoughts: "${notes}"` : '';
    const contextString = [timeContext, notesContext].filter(Boolean).join('\n');

    const userPrompt = `**Current Mood Context:**
- Mood: ${moodType}
- Intensity: ${intensity}/10
- Category: ${category}

${contextString ? `\n**Additional Context:**\n${contextString}` : ''}

**Please provide your response in this EXACT JSON format (no other text):**
{
  "reference": "Book Chapter:Verse",
  "verse": "The complete verse text",
  "explanation": "2-3 sentences explaining why this verse is relevant to this mood",
  "application": "1-2 sentences with practical application for their situation",
  "moodAlignment": "How this verse specifically addresses their ${moodType} mood"
}

CRITICAL REQUIREMENTS:
- Respond ONLY with valid JSON - no markdown, no code blocks, no additional text
- Choose a DIFFERENT verse for each mood - do not repeat the same verse
- DO NOT use Philippians 4:6-7 or "Do not be anxious about anything" - these are examples only
- DO NOT use generic phrases like "A verse of comfort and peace for all moods" or "A timeless verse chosen for"
- Select verses that are SPECIFICALLY relevant to the user's current mood: ${moodType}
- Make the verse selection unique and personalized to their emotional state
- Each response must be DIFFERENT and SPECIFIC to the mood`;

    const requestBody = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      max_tokens: 600,
      temperature: 0.7,
      top_p: 0.9,
    };

    console.log('🔍 Calling DeepSeek API for mood-based scripture...');

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DeepSeek API error:', errorText);
      throw new Error(`DeepSeek API request failed: ${response.status}`);
    }

    const responseData = await response.json();
    const content = responseData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from DeepSeek API');
    }

    console.log('✅ DeepSeek response received for mood scripture');
    console.log('📝 Raw content length:', content.length);
    console.log('📝 Raw content preview:', content.substring(0, 200));

    // Try to parse as JSON first
    let scriptureResponse: ScriptureResponse;
    
    try {
      // Clean the content - remove markdown code blocks if present
      let cleanedContent = content.trim();
      
      // Remove markdown code blocks
      cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Try to extract JSON object from text if it's embedded
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedContent = jsonMatch[0];
      }
      
      console.log('📝 Cleaned content:', cleanedContent.substring(0, 300));
      
      // Parse JSON response
      const parsedData = JSON.parse(cleanedContent);
      
      console.log('📝 Parsed data:', JSON.stringify(parsedData, null, 2));
      
      // Validate required fields
      if (!parsedData.reference || !parsedData.verse) {
        console.error('❌ Missing required fields. Parsed data:', parsedData);
        throw new Error(`Missing required fields in API response: reference or verse. Got: ${JSON.stringify(parsedData)}`);
      }
      
      // REJECT any mock/fallback verses
      const mockVerseText = 'Do not be anxious about anything';
      const mockReference = 'Philippians 4:6-7';
      
      if (parsedData.verse.includes(mockVerseText) || parsedData.reference === mockReference) {
        console.error('❌ REJECTED: Received mock verse from DeepSeek API');
        console.error('❌ Verse text:', parsedData.verse.substring(0, 100));
        console.error('❌ Reference:', parsedData.reference);
        throw new Error('DeepSeek API returned a fallback verse. This should not happen. Please retry.');
      }
      
      scriptureResponse = {
        reference: parsedData.reference,
        verse: parsedData.verse,
        explanation: parsedData.explanation || 'This verse offers comfort and guidance for your current mood.',
        application: parsedData.application || 'Take this scripture to heart and allow God\'s word to bring peace to your situation.',
        moodAlignment: parsedData.moodAlignment || `Specifically chosen for your ${moodType} mood`,
        timestamp: new Date().toISOString(),
      };
      
      console.log('✅ Validated verse - NOT a mock verse');
      
      console.log('✅ Successfully parsed JSON response:', JSON.stringify(scriptureResponse, null, 2));
    } catch (parseError: any) {
      console.error('❌ Failed to parse JSON response:', parseError);
      console.error('❌ Parse error message:', parseError.message);
      console.error('❌ Full content that failed to parse:', content);
      throw new Error(`Failed to parse DeepSeek API response as JSON: ${parseError.message}. Content: ${content.substring(0, 500)}`);
    }

    return new Response(JSON.stringify(scriptureResponse), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ Error in mood scripture generation:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Return error response instead of fallback
    return new Response(JSON.stringify({ 
      error: 'Failed to generate scripture recommendation',
      message: error.message || 'An error occurred while generating the scripture recommendation',
      details: 'Please try again or contact support if the issue persists'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});