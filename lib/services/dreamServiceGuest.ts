import { 
  getGuestDreams, 
  saveGuestDream, 
  updateGuestDream, 
  deleteGuestDream,
  GuestDream 
} from '../../utils/guestStorage';
import { DreamEntry, DreamAnalysisRequest, DreamAnalysisResponse } from '../types/dreams';
import { config } from '../config';

export class DreamServiceGuest {
  // API configuration for real AI interpretation
  private static readonly API_TIMEOUT = 15000; // 15 seconds timeout

  // Test method to verify API configuration
  static testApiConfiguration(): void {
    console.log('🧪 Testing API Configuration for Guest Service');
    console.log('🧪 Config object:', config);
    console.log('🧪 DeepSeek config:', config.deepseek);
    console.log('🧪 API Key present:', !!config.deepseek.apiKey);
    console.log('🧪 API Key length:', config.deepseek.apiKey?.length || 0);
    console.log('🧪 API URL:', config.deepseek.apiUrl);
  }

  // Test API connection for guest users
  static async testApiConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing DeepSeek API connection for guest user...');
      
      const API_KEY = config.deepseek.apiKey;
      const API_URL = config.deepseek.apiUrl;

      if (!API_KEY || API_KEY.length < 10) {
        console.warn('⚠️ No valid API key found for guest user');
        return false;
      }

      const testRequest = {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. Respond with "API connection successful" in JSON format: {"status": "success", "message": "API connection successful"}'
          },
          {
            role: 'user',
            content: 'Test connection'
          }
        ],
        max_tokens: 50,
        temperature: 0.1,
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(testRequest)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API connection test successful for guest user');
        console.log('✅ Test response:', data);
        return true;
      } else {
        console.error('❌ API connection test failed for guest user:', response.status, response.statusText);
        return false;
      }
    } catch (error: any) {
      console.error('❌ API connection test error for guest user:', error);
      return false;
    }
  }

  // Get real interpretation from DeepSeek API with timeout and retry
  private static async getDeepSeekInterpretationWithTimeout(request: DreamAnalysisRequest, retryCount: number = 0): Promise<DreamAnalysisResponse> {
    const API_KEY = config.deepseek.apiKey;
    const API_URL = config.deepseek.apiUrl;
    const MAX_RETRIES = 2;

    // Enhanced debug logging
    console.log('🔍 Debug - Full config object:', JSON.stringify(config, null, 2));
    console.log('🔍 Debug - API Key for guest:', API_KEY ? '***' + API_KEY.slice(-4) : 'undefined');
    console.log('🔍 Debug - API URL for guest:', API_URL);
    console.log('🔍 Debug - API Key length:', API_KEY ? API_KEY.length : 0);
    console.log('🔍 Debug - Request details:', request);
    console.log('🔍 Debug - Retry count:', retryCount);

    if (!API_KEY || API_KEY.length < 10) {
      console.warn('⚠️ No valid DeepSeek API key found for guest, using fallback interpretation');
      console.warn('⚠️ API Key value:', API_KEY);
      console.warn('⚠️ Config deepseek:', config.deepseek);
      return this.getFallbackInterpretation(request);
    }

    const prompt = `
Analyze this dream from a biblical and spiritual perspective:

Dream Title: "${request.dreamTitle}"
Dream Description: "${request.dreamDescription}"
Dream Mood: "${request.mood}"

Please provide a comprehensive spiritual interpretation in the following JSON format:

{
  "interpretation": "Detailed spiritual interpretation of the dream",
  "biblicalInsights": ["Biblical insight 1", "Biblical insight 2", "Biblical insight 3"],
  "spiritualMeaning": "The deeper spiritual meaning and message",
  "symbols": [
    {
      "symbol": "Symbol name",
      "meaning": "What this symbol represents spiritually",
      "bibleVerse": "Relevant Bible verse"
    }
  ],
  "prayer": "A personalized prayer based on the dream",
  "significance": "low" or "medium" or "high"
}

Focus on:
- Biblical symbolism and meaning
- Spiritual growth opportunities
- God's message through the dream
- Practical application for the dreamer's life
- Relevant Scripture references
- Encouragement and hope
`;

    const requestBody = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a biblical dream interpreter. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    };

    try {
      console.log('🌐 Calling DeepSeek API for guest user...');
      console.log('🌐 API URL:', API_URL);
      console.log('🌐 Request body:', JSON.stringify(requestBody, null, 2));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('🌐 Response status:', response.status);
      console.log('🌐 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        console.error('❌ Response status:', response.status);
        console.error('❌ Response status text:', response.statusText);
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ DeepSeek API response received for guest user');
      console.log('✅ Response data structure:', JSON.stringify(data, null, 2));

      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content;
        console.log('📝 Raw API response for guest:', content);

        let jsonContent = content.trim();
        try {
          // Clean the content to extract JSON
          console.log('🔍 Original content length:', jsonContent.length);
          
          // Remove any markdown code blocks if present
          if (jsonContent.startsWith('```json')) {
            jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            console.log('🔍 Removed ```json markers');
          } else if (jsonContent.startsWith('```')) {
            jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
            console.log('🔍 Removed ``` markers');
          }
          
          // Try to find JSON object boundaries
          const jsonStart = jsonContent.indexOf('{');
          const jsonEnd = jsonContent.lastIndexOf('}');
          
          console.log('🔍 JSON boundaries - start:', jsonStart, 'end:', jsonEnd);
          
          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1);
            console.log('🔍 Extracted JSON substring');
          }
          
          console.log('🔍 Cleaned JSON content for guest:', jsonContent.substring(0, 200) + '...');
          
          // Try to parse the JSON response
          const parsedResponse = JSON.parse(jsonContent);
          console.log('✅ Successfully parsed JSON response for guest');
          console.log('✅ Parsed response:', JSON.stringify(parsedResponse, null, 2));
          return parsedResponse;
        } catch (parseError) {
          console.warn('⚠️ Failed to parse JSON response for guest, using fallback');
          console.warn('⚠️ Parse error:', parseError);
          console.warn('⚠️ Raw content:', content);
          console.warn('⚠️ Cleaned content:', jsonContent);
          return this.getFallbackInterpretation(request);
        }
      } else {
        console.warn('⚠️ Unexpected API response format for guest, using fallback');
        console.warn('⚠️ Response data:', JSON.stringify(data, null, 2));
        return this.getFallbackInterpretation(request);
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn('⏰ DeepSeek API timeout for guest, using fallback interpretation');
      } else {
        console.error('❌ DeepSeek API error for guest:', error);
        console.error('❌ Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      
      // Retry logic for transient errors
      if (retryCount < MAX_RETRIES && error.name !== 'AbortError') {
        console.log(`🔄 Retrying API call for guest user (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return this.getDeepSeekInterpretationWithTimeout(request, retryCount + 1);
      }
      
      return this.getFallbackInterpretation(request);
    }
  }

  // Fallback interpretation when API fails
  private static getFallbackInterpretation(request: DreamAnalysisRequest): DreamAnalysisResponse {
    const title = request.dreamTitle.toLowerCase();
    const description = request.dreamDescription.toLowerCase();
    const mood = request.mood.toLowerCase();
    
    // Analyze keywords for personalized interpretation
    let interpretation = "";
    let biblicalInsights = [];
    let spiritualMeaning = "";
    let symbols = [];
    let prayer = "";
    let significance: "low" | "medium" | "high" = "medium";
    
    // Water-related dreams
    if (title.includes('water') || description.includes('water') || description.includes('ocean') || description.includes('river')) {
      interpretation = `Your dream about "${request.dreamTitle}" involving water carries deep spiritual significance. Water in dreams often represents spiritual cleansing, renewal, and God's living water flowing through your life. The emotions you felt (${request.mood}) during this dream are significant and may indicate your spiritual state.`;
      biblicalInsights = [
        "Jesus offers living water that never runs dry (John 4:14)",
        "Baptism represents new life and spiritual renewal (Romans 6:4)",
        "God leads us beside quiet waters to restore our souls (Psalm 23:2)"
      ];
      spiritualMeaning = "This dream suggests God is calling you to spiritual renewal and cleansing. The water represents His desire to wash away past burdens and refresh your spirit.";
      symbols = [{
        symbol: "Water",
        meaning: "Spiritual cleansing and renewal",
        bibleVerse: "John 4:14 - Whoever drinks the water I give them will never thirst."
      }];
      prayer = "Lord, cleanse me and renew my spirit. Help me to receive your living water and be refreshed in you. Wash away any burdens and restore my soul.";
    }
    // Flying dreams
    else if (title.includes('fly') || title.includes('flying') || description.includes('fly') || description.includes('flying')) {
      interpretation = `Your dream about "${request.dreamTitle}" involving flying carries powerful spiritual meaning. Flying dreams often represent spiritual freedom, rising above earthly concerns, and God's power to lift you above your circumstances. Your emotional state (${request.mood}) during this dream reveals your spiritual condition.`;
      biblicalInsights = [
        "We are seated with Christ in heavenly places (Ephesians 2:6)",
        "God gives us wings like eagles to soar (Isaiah 40:31)",
        "The Holy Spirit lifts us above our circumstances (Romans 8:11)"
      ];
      spiritualMeaning = "This dream indicates God is calling you to rise above your circumstances and trust in His power to lift you up.";
      symbols = [{
        symbol: "Flying",
        meaning: "Spiritual freedom and elevation",
        bibleVerse: "Isaiah 40:31 - Those who hope in the Lord will renew their strength and soar on wings like eagles."
      }];
      prayer = "Father, help me to rise above my circumstances and trust in your power to lift me up. Give me wings like eagles to soar above my challenges.";
    }
    // Default personalized interpretation
    else {
      interpretation = `Your dream about "${request.dreamTitle}" is a meaningful spiritual message from God. Dreams are one of the primary ways God communicates with His people, as shown throughout Scripture. The emotions you experienced (${request.mood}) during this dream are significant and reveal the spiritual state of your heart. This dream appears to be God's way of speaking to you about your current life situation.`;
      biblicalInsights = [
        "God speaks through dreams to His people (Joel 2:28)",
        "Dreams can reveal God's plans and purposes (Genesis 37:5-11)",
        "The Holy Spirit guides us even in our sleep (Psalm 16:7)"
      ];
      spiritualMeaning = "This dream is God's way of speaking to you about your current season of life. The symbols and emotions suggest He is preparing you for spiritual growth and deeper relationship with Him.";
      symbols = [{
        symbol: "Dream emotions",
        meaning: "Your emotional state reflects your spiritual condition",
        bibleVerse: "Proverbs 15:13 - A happy heart makes the face cheerful, but heartache crushes the spirit."
      }];
      prayer = "Heavenly Father, thank you for speaking to me through this dream. Give me wisdom and understanding to discern your message. Help me apply any insights to my life and draw closer to you. In Jesus' name, Amen.";
    }
    
    // Adjust significance based on mood
    if (mood.includes('fear') || mood.includes('anxious') || mood.includes('worried')) {
      significance = "high" as const;
    } else if (mood.includes('peace') || mood.includes('joy') || mood.includes('happy')) {
      significance = "medium" as const;
    }
    
    return {
      interpretation,
      biblicalInsights,
      spiritualMeaning,
      symbols,
      prayer,
      significance
    };
  }
  // Get all dreams for guest user
  static async getDreams(): Promise<DreamEntry[]> {
    try {
      console.log('Fetching guest dreams from local storage');
      const guestDreams = await getGuestDreams();
      
      // Convert GuestDream to DreamEntry format
      const dreams: DreamEntry[] = guestDreams.map(dream => ({
        id: dream.id,
        title: dream.title,
        description: dream.description,
        mood: dream.mood,
        date: dream.date,
        interpretation: dream.interpretation,
        biblical_insights: dream.biblical_insights,
        spiritual_meaning: dream.spiritual_meaning,
        symbols: dream.symbols,
        prayer: dream.prayer,
        significance: dream.significance,
        is_analyzed: dream.is_analyzed,
        created_at: dream.created_at,
        updated_at: dream.updated_at,
      }));
      
      console.log('Guest dreams fetched:', dreams.length, 'dreams');
      return dreams;
    } catch (error) {
      console.error('Error fetching guest dreams:', error);
      return [];
    }
  }

  // Add a new dream for guest user (without AI interpretation)
  static async addDream(request: DreamAnalysisRequest): Promise<DreamEntry> {
    try {
      console.log('Adding guest dream:', request);
      
      const newDream = await saveGuestDream({
        title: request.dreamTitle,
        description: request.dreamDescription,
        mood: request.mood,
        date: new Date().toISOString(),
        is_analyzed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      console.log('Guest dream saved successfully:', newDream.id);
      
      // Convert to DreamEntry format
      return {
        id: newDream.id,
        title: newDream.title,
        description: newDream.description,
        mood: newDream.mood,
        date: newDream.date,
        interpretation: newDream.interpretation,
        biblical_insights: newDream.biblical_insights,
        spiritual_meaning: newDream.spiritual_meaning,
        symbols: newDream.symbols,
        prayer: newDream.prayer,
        significance: newDream.significance,
        is_analyzed: newDream.is_analyzed,
        created_at: newDream.created_at,
        updated_at: newDream.updated_at,
      };
    } catch (error) {
      console.error('Error adding guest dream:', error);
      throw error;
    }
  }

  // Add a dream with real AI interpretation for guest users
  static async addAndInterpretDream(request: DreamAnalysisRequest): Promise<DreamEntry> {
    try {
      console.log('Adding and interpreting guest dream with real AI:', request);
      
      // First save the dream without interpretation
      const newDream = await this.addDream(request);
      
      // Get real AI interpretation for guest users
      const interpretation = await this.getDeepSeekInterpretationWithTimeout(request);
      
      // Update the dream with interpretation
      const updatedDream = await updateGuestDream(newDream.id, {
        interpretation: interpretation.interpretation,
        biblical_insights: interpretation.biblicalInsights,
        spiritual_meaning: interpretation.spiritualMeaning,
        symbols: interpretation.symbols,
        prayer: interpretation.prayer,
        significance: interpretation.significance,
        is_analyzed: true,
        updated_at: new Date().toISOString(),
      });

      if (!updatedDream) {
        throw new Error('Failed to update dream with interpretation');
      }

      console.log('Guest dream interpreted with real AI successfully:', updatedDream.id);
      
      // Convert to DreamEntry format
      return {
        id: updatedDream.id,
        title: updatedDream.title,
        description: updatedDream.description,
        mood: updatedDream.mood,
        date: updatedDream.date,
        interpretation: updatedDream.interpretation,
        biblical_insights: updatedDream.biblical_insights,
        spiritual_meaning: updatedDream.spiritual_meaning,
        symbols: updatedDream.symbols,
        prayer: updatedDream.prayer,
        significance: updatedDream.significance,
        is_analyzed: updatedDream.is_analyzed,
        created_at: updatedDream.created_at,
        updated_at: updatedDream.updated_at,
      };
    } catch (error) {
      console.error('Error adding and interpreting guest dream:', error);
      throw error;
    }
  }

  // Fast method for mobile performance (real AI interpretation)
  static async addDreamFast(request: DreamAnalysisRequest): Promise<DreamEntry> {
    try {
      console.log('Adding guest dream with real AI interpretation:', request);
      
      // Get real AI interpretation
      const interpretation = await this.getDeepSeekInterpretationWithTimeout(request);
      
      // Save dream with interpretation
      const newDream = await saveGuestDream({
        title: request.dreamTitle,
        description: request.dreamDescription,
        mood: request.mood,
        date: new Date().toISOString(),
        interpretation: interpretation.interpretation,
        biblical_insights: interpretation.biblicalInsights,
        spiritual_meaning: interpretation.spiritualMeaning,
        symbols: interpretation.symbols,
        prayer: interpretation.prayer,
        significance: interpretation.significance,
        is_analyzed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      console.log('Guest dream saved with real AI interpretation:', newDream.id);
      
      // Convert to DreamEntry format
      return {
        id: newDream.id,
        title: newDream.title,
        description: newDream.description,
        mood: newDream.mood,
        date: newDream.date,
        interpretation: newDream.interpretation,
        biblical_insights: newDream.biblical_insights,
        spiritual_meaning: newDream.spiritual_meaning,
        symbols: newDream.symbols,
        prayer: newDream.prayer,
        significance: newDream.significance,
        is_analyzed: newDream.is_analyzed,
        created_at: newDream.created_at,
        updated_at: newDream.updated_at,
      };
    } catch (error) {
      console.error('Error adding guest dream with real AI interpretation:', error);
      throw error;
    }
  }

  // Delete a dream
  static async deleteDream(dreamId: string): Promise<boolean> {
    try {
      console.log('Deleting guest dream:', dreamId);
      const success = await deleteGuestDream(dreamId);
      console.log('Guest dream deleted:', success);
      return success;
    } catch (error) {
      console.error('Error deleting guest dream:', error);
      throw error;
    }
  }

}
