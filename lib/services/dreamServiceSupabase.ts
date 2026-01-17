import { supabase } from '../supabase';
import { DreamEntry, DreamAnalysisRequest, DreamAnalysisResponse } from '../types/dreams';
import { config } from '../config';

export class DreamServiceSupabase {
  // Enhanced cache for dreams data with better performance
  private static dreamsCache: DreamEntry[] | null = null;
  private static lastFetchTime: number = 0;
  private static readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache
  private static readonly API_TIMEOUT = 8000; // 8 second timeout for mobile optimization

  // Clear cache (useful for testing or when data might be stale)
  static clearCache(): void {
    this.dreamsCache = null;
    this.lastFetchTime = 0;
  }

  // Get all dreams for a user with caching
  static async getDreams(userId: string, forceRefresh: boolean = false): Promise<DreamEntry[]> {
    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh && this.dreamsCache && (Date.now() - this.lastFetchTime) < this.CACHE_DURATION) {
        console.log('📦 Returning cached dreams data');
        return this.dreamsCache;
      }

      console.log('🔍 Fetching dreams from Supabase for user:', userId);

      const { data, error } = await supabase
        .from('dreams')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching dreams from Supabase:', error);
        throw error;
      }

      const dreams = data || [];
      console.log(`✅ Fetched ${dreams.length} dreams from Supabase`);

      // Update cache
      this.dreamsCache = dreams;
      this.lastFetchTime = Date.now();

      return dreams;
    } catch (error) {
      console.error('❌ Error in getDreams:', error);
      return [];
    }
  }

  // Add a new dream and get real AI interpretation
  static async addAndInterpretDream(request: DreamAnalysisRequest, userId: string): Promise<DreamEntry> {
    try {
      console.log('🚀 Starting dream analysis with Supabase and DeepSeek API');
      
      if (!userId) {
        console.error('❌ No authenticated user found');
        throw new Error('User not authenticated');
      }
      
      console.log('✅ User authenticated:', userId);

      // First, save the dream without interpretation (fast operation)
      const dreamDataToInsert = {
        user_id: userId,
        title: request.dreamTitle,
        description: request.dreamDescription,
        mood: request.mood,
        date: new Date().toISOString(),
        is_analyzed: false
      };
      
      console.log('📝 Inserting dream data to Supabase:', dreamDataToInsert);
      
      const { data: insertedDream, error: insertError } = await supabase
        .from('dreams')
        .insert(dreamDataToInsert)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error inserting dream to Supabase:', insertError);
        throw insertError;
      }

      console.log('✅ Dream saved successfully to Supabase with ID:', insertedDream.id);

      // Get AI interpretation with faster timeout for mobile
      console.log('🔍 Getting AI interpretation...');
      const interpretation = await this.getDeepSeekInterpretationWithTimeout(request);
      console.log('✅ AI interpretation received:', interpretation);
      
      // Update the dream with AI interpretation
      const updateData = {
        interpretation: interpretation.interpretation,
        biblical_insights: interpretation.biblicalInsights,
        spiritual_meaning: interpretation.spiritualMeaning,
        symbols: interpretation.symbols,
        prayer: interpretation.prayer,
        significance: interpretation.significance,
        is_analyzed: true
      };
      
      console.log('📝 Updating dream with interpretation in Supabase:', updateData);
      
      const { data: updatedDream, error: updateError } = await supabase
        .from('dreams')
        .update(updateData)
        .eq('id', insertedDream.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating dream in Supabase:', updateError);
        throw updateError;
      }

      console.log('✅ Dream updated with AI interpretation successfully in Supabase');
      console.log('🎉 Final dream data:', updatedDream);
      
      // Clear cache since we added a new dream
      this.clearCache();
      
      return updatedDream;

    } catch (error) {
      console.error('❌ Error in addAndInterpretDream:', error);
      throw error;
    }
  }

  // Fast dream analysis for mobile - uses real AI interpretation
  static async addDreamFast(request: DreamAnalysisRequest, userId: string): Promise<DreamEntry> {
    try {
      console.log('⚡ Starting fast dream analysis with real AI for mobile');
      
      if (!userId) {
        console.error('❌ No authenticated user found');
        throw new Error('User not authenticated');
      }

      // First, save the dream without interpretation (fast operation)
      const dreamDataToInsert = {
        user_id: userId,
        title: request.dreamTitle,
        description: request.dreamDescription,
        mood: request.mood,
        date: new Date().toISOString(),
        is_analyzed: false
      };
      
      console.log('📝 Inserting dream data to Supabase:', dreamDataToInsert);
      
      const { data: insertedDream, error: insertError } = await supabase
        .from('dreams')
        .insert(dreamDataToInsert)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error inserting dream to Supabase:', insertError);
        throw insertError;
      }

      console.log('✅ Dream saved successfully with ID:', insertedDream.id);

      // Get real AI interpretation
      console.log('🔍 Getting real AI interpretation...');
      const interpretation = await this.getDeepSeekInterpretationWithTimeout(request);
      console.log('✅ AI interpretation received:', interpretation);
      
      // Update the dream with AI interpretation
      const updateData = {
        interpretation: interpretation.interpretation,
        biblical_insights: interpretation.biblicalInsights,
        spiritual_meaning: interpretation.spiritualMeaning,
        symbols: interpretation.symbols,
        prayer: interpretation.prayer,
        significance: interpretation.significance,
        is_analyzed: true
      };
      
      console.log('📝 Updating dream with real AI interpretation:', updateData);
      
      const { data: updatedDream, error: updateError } = await supabase
        .from('dreams')
        .update(updateData)
        .eq('id', insertedDream.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating dream with interpretation:', updateError);
        throw updateError;
      }

      console.log('✅ Fast dream analysis with real AI completed');
      
      // Clear cache since we added a new dream
      this.clearCache();
      
      return updatedDream;

    } catch (error) {
      console.error('❌ Error in addDreamFast:', error);
      throw error;
    }
  }

  // Hybrid approach: Fast analysis with optional AI enhancement
  static async addDreamHybrid(request: DreamAnalysisRequest, userId: string): Promise<DreamEntry> {
    try {
      console.log('🚀 Starting hybrid dream analysis');
      
      if (!userId) {
        console.error('❌ No authenticated user found');
        throw new Error('User not authenticated');
      }

      // First, save the dream with quick interpretation (immediate feedback)
      const quickInterpretation = this.getQuickInterpretation(request);
      
      const initialDreamData = {
        user_id: userId,
        title: request.dreamTitle,
        description: request.dreamDescription,
        mood: request.mood,
        date: new Date().toISOString(),
        interpretation: quickInterpretation.interpretation,
        biblical_insights: quickInterpretation.biblicalInsights,
        spiritual_meaning: quickInterpretation.spiritualMeaning,
        symbols: quickInterpretation.symbols,
        prayer: quickInterpretation.prayer,
        significance: quickInterpretation.significance,
        is_analyzed: true
      };
      
      console.log('📝 Inserting dream with quick interpretation to Supabase');
      
      const { data: insertedDream, error: insertError } = await supabase
        .from('dreams')
        .insert(initialDreamData)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error inserting dream to Supabase:', insertError);
        throw insertError;
      }

      console.log('✅ Quick analysis completed, returning to user');

      // Clear cache since we added a new dream
      this.clearCache();
      
      // Return immediately with quick analysis
      return insertedDream;

    } catch (error) {
      console.error('❌ Error in addDreamHybrid:', error);
      throw error;
    }
  }

  // Get real interpretation from DeepSeek API with timeout
  static async getDeepSeekInterpretationWithTimeout(request: DreamAnalysisRequest): Promise<DreamAnalysisResponse> {
    const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
    const API_KEY = config.deepseek.apiKey;

    if (!API_KEY) {
      console.warn('⚠️ No DeepSeek API key found, using fallback interpretation');
      return this.getFallbackInterpretation(request);
    }

    const requestBody = {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are a Christian dream interpreter. Provide brief, spiritual interpretations in JSON format with biblical insights."
        },
        {
          role: "user",
          content: `Title: ${request.dreamTitle}
Dream: ${request.dreamDescription}
Mood: ${request.mood}

Interpret this dream spiritually. Respond with JSON: {"interpretation":"...","biblicalInsights":["..."],"spiritualMeaning":"...","symbols":[{"symbol":"...","meaning":"...","bibleVerse":"..."}],"prayer":"...","significance":"medium"}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1200 // Reduced from 2000 for faster response
    };

    try {
      console.log('🌐 Calling DeepSeek API...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT);

      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ DeepSeek API response received');

      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content;
        console.log('📝 Raw API response:', content);

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
          
          console.log('🔍 Cleaned JSON content:', jsonContent.substring(0, 200) + '...');
          
          // Try to parse the JSON response
          const parsedResponse = JSON.parse(jsonContent);
          console.log('✅ Successfully parsed JSON response');
          return parsedResponse;
        } catch (parseError) {
          console.warn('⚠️ Failed to parse JSON response, using fallback');
          console.warn('⚠️ Parse error:', parseError);
          console.warn('⚠️ Raw content:', content);
          console.warn('⚠️ Cleaned content:', jsonContent);
          return this.getFallbackInterpretation(request);
        }
      } else {
        console.warn('⚠️ Unexpected API response format, using fallback');
        return this.getFallbackInterpretation(request);
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('⏰ DeepSeek API timeout, using fallback interpretation');
      } else {
        console.error('❌ DeepSeek API error:', error);
      }
      return this.getFallbackInterpretation(request);
    }
  }

  // Quick interpretation for mobile performance
  static getQuickInterpretation(request: DreamAnalysisRequest): DreamAnalysisResponse {
    console.log('⚡ Using quick interpretation for mobile');
    
    const title = request.dreamTitle.toLowerCase();
    const description = request.dreamDescription.toLowerCase();
    const mood = request.mood.toLowerCase();
    
    // Analyze keywords for quick interpretation
    let interpretation = "";
    let biblicalInsights = [];
    let spiritualMeaning = "";
    let symbols = [];
    let prayer = "";
    let significance = "medium";
    
    // Water-related dreams
    if (title.includes('water') || description.includes('water') || description.includes('ocean') || description.includes('river')) {
      interpretation = "Water in dreams often represents spiritual cleansing and renewal. This dream may indicate God's desire to refresh your spirit and wash away past burdens.";
      biblicalInsights = ["Jesus offers living water (John 4:14)", "Baptism represents new life (Romans 6:4)"];
      spiritualMeaning = "God is calling you to spiritual renewal and cleansing.";
      symbols = [{
        symbol: "Water",
        meaning: "Spiritual cleansing and renewal",
        bibleVerse: "John 4:14 - Whoever drinks the water I give them will never thirst."
      }];
      prayer = "Lord, cleanse me and renew my spirit. Help me to receive your living water and be refreshed in you.";
    }
    // Flying dreams
    else if (title.includes('fly') || title.includes('flying') || description.includes('fly') || description.includes('flying')) {
      interpretation = "Flying dreams often represent spiritual freedom and rising above earthly concerns. This dream suggests God is lifting you above your current circumstances.";
      biblicalInsights = ["We are seated with Christ in heavenly places (Ephesians 2:6)", "God gives us wings like eagles (Isaiah 40:31)"];
      spiritualMeaning = "God is calling you to rise above your circumstances and trust in His power.";
      symbols = [{
        symbol: "Flying",
        meaning: "Spiritual freedom and elevation",
        bibleVerse: "Isaiah 40:31 - Those who hope in the Lord will renew their strength and soar on wings like eagles."
      }];
      prayer = "Father, help me to rise above my circumstances and trust in your power to lift me up.";
    }
    // Falling dreams
    else if (title.includes('fall') || title.includes('falling') || description.includes('fall') || description.includes('falling')) {
      interpretation = "Falling dreams often represent fear of losing control or feeling unsupported. This dream may indicate a need to trust God more deeply.";
      biblicalInsights = ["The Lord upholds us (Psalm 37:24)", "We will not be shaken (Psalm 16:8)"];
      spiritualMeaning = "God is calling you to trust Him completely and let go of fear.";
      symbols = [{
        symbol: "Falling",
        meaning: "Fear and need for trust",
        bibleVerse: "Psalm 37:24 - Though they stumble, they will never fall, for the Lord holds them by the hand."
      }];
      prayer = "Lord, help me to trust you completely and not be afraid. Hold me up with your righteous right hand.";
    }
    // Default interpretation
    else {
      interpretation = `Your dream about "${request.dreamTitle}" is a message from God. Dreams are one of the ways God communicates with His people, as shown throughout Scripture. The emotions you experienced (${request.mood}) are significant and may reveal the spiritual state of your heart.`;
      biblicalInsights = [
        "God speaks through dreams (Joel 2:28)",
        "Dreams can reveal God's plans (Genesis 37:5-11)",
        "The Holy Spirit guides us even in sleep (Psalm 16:7)"
      ];
      spiritualMeaning = "This dream is God's way of speaking to you about your current life situation. Seek His wisdom to understand its meaning.";
      symbols = [{
        symbol: "Dream emotions",
        meaning: "Your emotional state reflects your spiritual condition",
        bibleVerse: "Proverbs 15:13 - A happy heart makes the face cheerful, but heartache crushes the spirit."
      }];
      prayer = "Heavenly Father, thank you for speaking to me through this dream. Give me wisdom and understanding to discern your message. Help me apply any insights to my life and draw closer to you. In Jesus' name, Amen.";
    }
    
    // Adjust significance based on mood
    if (mood.includes('fear') || mood.includes('anxious') || mood.includes('worried')) {
      significance = "high";
    } else if (mood.includes('peace') || mood.includes('joy') || mood.includes('happy')) {
      significance = "medium";
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

  // Fallback interpretation when API fails
  static getFallbackInterpretation(request: DreamAnalysisRequest): DreamAnalysisResponse {
    console.log('🔄 Using fallback interpretation');
    
    return {
      interpretation: `Your dream about "${request.dreamTitle}" appears to be a message from God. Dreams are often ways that God communicates with us, as mentioned in Joel 2:28. The emotions you felt (${request.mood}) during this dream are significant and may indicate the spiritual state of your heart.`,
      biblicalInsights: [
        "God speaks through dreams (Joel 2:28)",
        "Dreams can reveal God's plans (Genesis 37:5-11)",
        "The Holy Spirit guides us even in sleep (Psalm 16:7)"
      ],
      spiritualMeaning: "This dream may be God's way of speaking to you about your current life situation. Consider praying for wisdom and discernment to understand its meaning.",
      symbols: [
        {
          symbol: "Dream emotions",
          meaning: "Your emotional state in the dream reflects your spiritual condition",
          bibleVerse: "Proverbs 15:13 - A happy heart makes the face cheerful, but heartache crushes the spirit."
        }
      ],
      prayer: "Heavenly Father, thank you for speaking to me through this dream. Please give me wisdom and understanding to discern your message. Help me to apply any insights to my life and draw closer to you. In Jesus' name, Amen.",
      significance: "medium"
    };
  }

  // Delete a dream
  static async deleteDream(dreamId: string, userId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting dream from Supabase:', dreamId);
      
      const { error } = await supabase
        .from('dreams')
        .delete()
        .eq('id', dreamId)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error deleting dream from Supabase:', error);
        throw error;
      }

      console.log('✅ Dream deleted successfully from Supabase');
      
      // Clear cache since we deleted a dream
      this.clearCache();
    } catch (error) {
      console.error('❌ Error in deleteDream:', error);
      throw error;
    }
  }

  // Update a dream
  static async updateDream(dreamId: string, updates: Partial<DreamEntry>, userId: string): Promise<DreamEntry> {
    try {
      console.log('📝 Updating dream in Supabase:', dreamId, updates);
      
      const { data, error } = await supabase
        .from('dreams')
        .update(updates)
        .eq('id', dreamId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating dream in Supabase:', error);
        throw error;
      }

      console.log('✅ Dream updated successfully in Supabase');
      
      // Clear cache since we updated a dream
      this.clearCache();
      
      return data;
    } catch (error) {
      console.error('❌ Error in updateDream:', error);
      throw error;
    }
  }
}
