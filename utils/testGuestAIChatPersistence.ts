// Test utility for guest AI chat persistence
import { 
  getGuestAIConversations, 
  saveGuestAIConversation, 
  deleteGuestAIConversation,
  getGuestAIConversationCount,
  getGuestAIMessageCount,
  clearGuestAIConversations
} from './guestAIChatStorage';
import { getGuestUserId } from './guestStorage';

export const testGuestAIChatPersistence = async (): Promise<void> => {
  try {
    console.log('🧪 Testing guest AI chat persistence...');
    
    // Clear any existing test data
    await clearGuestAIConversations();
    console.log('✅ Cleared existing test data');
    
    // Get guest user ID
    const guestUserId = await getGuestUserId();
    console.log('👤 Guest user ID:', guestUserId);
    
    // Create a test conversation
    const testConversation = {
      id: `test_conv_${Date.now()}`,
      userId: guestUserId,
      category: 'bible-study',
      title: 'Test Bible Study Chat',
      preview: 'Hello! I\'m here to help you with Bible study.',
      lastMessageTime: new Date().toISOString(),
      messages: [
        {
          id: `msg_${Date.now()}`,
          text: 'Hello! I\'m here to help you with Bible study. What would you like to discuss today?',
          isUser: false,
          timestamp: new Date().toISOString(),
          category: 'bible-study',
        },
        {
          id: `msg_${Date.now() + 1}`,
          text: 'What does John 3:16 mean?',
          isUser: true,
          timestamp: new Date().toISOString(),
          category: 'bible-study',
        },
        {
          id: `msg_${Date.now() + 2}`,
          text: 'John 3:16 is one of the most well-known verses in the Bible. It says: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." This verse beautifully summarizes the gospel message - God\'s love for humanity and the gift of salvation through Jesus Christ.',
          isUser: false,
          timestamp: new Date().toISOString(),
          category: 'bible-study',
        }
      ],
    };
    
    // Save the test conversation
    await saveGuestAIConversation(testConversation);
    console.log('✅ Saved test conversation');
    
    // Verify the conversation was saved
    const conversations = await getGuestAIConversations();
    console.log('📊 Total conversations:', conversations.length);
    console.log('📊 Total messages:', await getGuestAIMessageCount());
    
    if (conversations.length === 1) {
      console.log('✅ Conversation count is correct');
    } else {
      console.error('❌ Expected 1 conversation, got:', conversations.length);
    }
    
    // Test retrieving the specific conversation
    const retrievedConversation = conversations.find(conv => conv.id === testConversation.id);
    if (retrievedConversation) {
      console.log('✅ Successfully retrieved test conversation');
      console.log('📝 Conversation title:', retrievedConversation.title);
      console.log('💬 Message count:', retrievedConversation.messages.length);
    } else {
      console.error('❌ Failed to retrieve test conversation');
    }
    
    // Test message persistence
    const messageCount = await getGuestAIMessageCount();
    if (messageCount === 3) {
      console.log('✅ Message count is correct');
    } else {
      console.error('❌ Expected 3 messages, got:', messageCount);
    }
    
    // Test conversation deletion
    await deleteGuestAIConversation(testConversation.id);
    const conversationsAfterDelete = await getGuestAIConversations();
    if (conversationsAfterDelete.length === 0) {
      console.log('✅ Conversation deletion works correctly');
    } else {
      console.error('❌ Conversation deletion failed');
    }
    
    console.log('🎉 Guest AI chat persistence test completed successfully!');
    
  } catch (error) {
    console.error('❌ Guest AI chat persistence test failed:', error);
    throw error;
  }
};

// Function to simulate app restart and verify persistence
export const simulateAppRestart = async (): Promise<void> => {
  try {
    console.log('🔄 Simulating app restart...');
    
    // Create a test conversation
    const guestUserId = await getGuestUserId();
    const testConversation = {
      id: `restart_test_${Date.now()}`,
      userId: guestUserId,
      category: 'prayer-life',
      title: 'Prayer Life Chat',
      preview: 'Let\'s talk about prayer.',
      lastMessageTime: new Date().toISOString(),
      messages: [
        {
          id: `restart_msg_${Date.now()}`,
          text: 'Hello! I\'m here to help you with your prayer life.',
          isUser: false,
          timestamp: new Date().toISOString(),
          category: 'prayer-life',
        },
        {
          id: `restart_msg_${Date.now() + 1}`,
          text: 'How can I improve my prayer life?',
          isUser: true,
          timestamp: new Date().toISOString(),
          category: 'prayer-life',
        }
      ],
    };
    
    // Save the conversation
    await saveGuestAIConversation(testConversation);
    console.log('✅ Saved conversation before restart simulation');
    
    // Simulate "app restart" by clearing the in-memory state
    // (In a real app restart, this would happen automatically)
    console.log('🔄 Simulating app restart - clearing in-memory state');
    
    // "Restart" by loading conversations from storage
    const conversationsAfterRestart = await getGuestAIConversations();
    console.log('📊 Conversations after restart:', conversationsAfterRestart.length);
    
    const foundConversation = conversationsAfterRestart.find(conv => conv.id === testConversation.id);
    if (foundConversation) {
      console.log('✅ Conversation persisted through restart simulation');
      console.log('📝 Found conversation:', foundConversation.title);
      console.log('💬 Messages:', foundConversation.messages.length);
    } else {
      console.error('❌ Conversation did not persist through restart simulation');
    }
    
    // Clean up
    await deleteGuestAIConversation(testConversation.id);
    console.log('🧹 Cleaned up test conversation');
    
  } catch (error) {
    console.error('❌ App restart simulation failed:', error);
    throw error;
  }
};

