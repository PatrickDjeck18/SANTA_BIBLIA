// DeepSeek Scripture Service
// Generates scripture recommendations based on mood using DeepSeek AI

import { config } from '@/lib/config';
import { Platform } from 'react-native';

export interface ScriptureResponse {
    reference: string;
    verse: string;
    explanation: string;
    application: string;
    moodAlignment: string;
}

interface ScriptureRequest {
    moodType: string;
    intensity: number;
    category: string;
    notes?: string;
}

// Curated scriptures for each mood category (used as fallback on web or when API fails)
const FALLBACK_SCRIPTURES: Record<string, ScriptureResponse[]> = {
    positive: [
        {
            reference: "Psalm 118:24",
            verse: "This is the day that the Lord has made; let us rejoice and be glad in it.",
            explanation: "This verse reminds us that every day is a gift from God, worthy of celebration.",
            application: "Start your day with gratitude, acknowledging God's blessings in your life.",
            moodAlignment: "Perfect for your joyful spirit - celebrate God's goodness today!",
        },
        {
            reference: "James 1:17",
            verse: "Every good and perfect gift is from above, coming down from the Father of the heavenly lights.",
            explanation: "All the good things in our lives ultimately come from God's loving hand.",
            application: "Take a moment to thank God for the specific blessings you're experiencing.",
            moodAlignment: "Your positive mood reflects God's goodness in your life.",
        },
    ],
    calm: [
        {
            reference: "Psalm 46:10",
            verse: "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.",
            explanation: "In moments of peace, we can deeply connect with God's presence.",
            application: "Use this peaceful moment to deepen your awareness of God's presence.",
            moodAlignment: "Your calm spirit creates space for deeper communion with God.",
        },
        {
            reference: "Isaiah 26:3",
            verse: "You will keep in perfect peace those whose minds are steadfast, because they trust in you.",
            explanation: "True peace comes from keeping our focus on God and trusting Him completely.",
            application: "Continue to fix your thoughts on God to maintain this peaceful state.",
            moodAlignment: "Your peaceful heart is a reflection of trust in the Lord.",
        },
    ],
    challenging: [
        {
            reference: "Isaiah 41:10",
            verse: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you.",
            explanation: "God promises His presence and strength during our most difficult moments.",
            application: "Remember that you are not alone - God is with you right now.",
            moodAlignment: "In this challenging time, let God's promise of presence comfort you.",
        },
        {
            reference: "Psalm 34:18",
            verse: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.",
            explanation: "God draws especially near to us when we're struggling emotionally.",
            application: "Know that God is particularly close to you in this difficult moment.",
            moodAlignment: "Your struggle is seen by God, and He is near to comfort you.",
        },
    ],
    energetic: [
        {
            reference: "Colossians 3:23",
            verse: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.",
            explanation: "Our energy and motivation can be channeled into serving God.",
            application: "Direct your energy toward activities that honor God today.",
            moodAlignment: "Your motivated spirit can accomplish great things for God's glory.",
        },
    ],
    curious: [
        {
            reference: "Proverbs 2:6",
            verse: "For the Lord gives wisdom; from his mouth come knowledge and understanding.",
            explanation: "God is the source of all true wisdom and understanding.",
            application: "Seek God's wisdom as you explore and learn new things.",
            moodAlignment: "Your curiosity is a gift - use it to seek deeper understanding of God.",
        },
    ],
    spiritual: [
        {
            reference: "Psalm 63:1",
            verse: "You, God, are my God, earnestly I seek you; I thirst for you, my whole being longs for you.",
            explanation: "A longing for God reflects a healthy spiritual hunger.",
            application: "Nurture this spiritual hunger through prayer and Scripture reading.",
            moodAlignment: "Your spiritual longing shows a heart that desires God above all.",
        },
    ],
};

/**
 * Gets a fallback scripture for the given mood category
 */
function getFallbackScripture(category: string, moodType: string): ScriptureResponse {
    const categoryScriptures = FALLBACK_SCRIPTURES[category] || FALLBACK_SCRIPTURES.challenging;
    const randomIndex = Math.floor(Math.random() * categoryScriptures.length);
    const scripture = { ...categoryScriptures[randomIndex] };
    // Personalize the mood alignment
    scripture.moodAlignment = scripture.moodAlignment.replace(/your .* mood/i, `your ${moodType} mood`);
    return scripture;
}

/**
 * Generates a scripture recommendation based on the user's mood using DeepSeek AI
 */
export async function generateMoodScripture(request: ScriptureRequest): Promise<ScriptureResponse> {
    const { moodType, intensity, category, notes } = request;

    // On web, use fallback scriptures to avoid CORS issues
    if (Platform.OS === 'web') {
        console.log('📖 Web platform detected - using curated scriptures (CORS workaround)');
        // Add a small delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        return getFallbackScripture(category, moodType);
    }

    const API_KEY = config.deepseek.apiKey;
    const API_URL = config.deepseek.apiUrl;

    if (!API_KEY) {
        console.warn('DeepSeek API key not configured - using fallback');
        return getFallbackScripture(category, moodType);
    }

    const systemPrompt = `You are a Christian spiritual advisor with deep knowledge of the Bible. Your task is to recommend relevant Bible verses based on someone's current mood and emotional state.

Guidelines:
- Always provide accurate Bible verse references
- Choose verses that directly address the emotional state
- Provide helpful explanations and practical applications
- Be encouraging and compassionate
- Keep responses concise for mobile reading`;

    const userPrompt = `Based on the following mood information, recommend a Bible verse that would be encouraging and relevant:

Mood: ${moodType}
Intensity: ${intensity}/10
Category: ${category}
${notes ? `Additional context: ${notes}` : ''}

Please respond with a JSON object in this exact format (no markdown, just pure JSON):
{
  "reference": "Book Chapter:Verse (e.g., Philippians 4:6-7)",
  "verse": "The full text of the verse",
  "explanation": "A brief explanation of why this verse is relevant to this mood (2-3 sentences)",
  "application": "A practical way to apply this verse today (1-2 sentences)",
  "moodAlignment": "How this verse specifically addresses the ${moodType} feeling (1 sentence)"
}`;

    const requestBody = {
        model: 'deepseek-chat',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        max_tokens: 800,
        temperature: 0.7,
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            console.error('DeepSeek API error - using fallback');
            return getFallbackScripture(category, moodType);
        }

        const responseData = await response.json();
        const content = responseData.choices?.[0]?.message?.content;

        if (!content) {
            console.error('No content from DeepSeek - using fallback');
            return getFallbackScripture(category, moodType);
        }

        // Parse the JSON response from the AI
        let cleanedContent = content.trim();
        if (cleanedContent.startsWith('```json')) {
            cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedContent.startsWith('```')) {
            cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const scriptureData = JSON.parse(cleanedContent);

        if (!scriptureData.reference || !scriptureData.verse) {
            console.error('Invalid DeepSeek response - missing required fields - using fallback');
            return getFallbackScripture(category, moodType);
        }

        return {
            reference: scriptureData.reference,
            verse: scriptureData.verse,
            explanation: scriptureData.explanation || 'This verse offers comfort and guidance for your current mood.',
            application: scriptureData.application || 'Take this scripture to heart and allow God\'s word to bring peace to your situation.',
            moodAlignment: scriptureData.moodAlignment || `Specifically chosen for your ${moodType} mood`,
        };
    } catch (error) {
        console.error('Error calling DeepSeek API or parsing response - using fallback:', error);
        return getFallbackScripture(category, moodType);
    }
}
