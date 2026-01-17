// AI Bible Chat Prompts by Category
// Each category has exactly 5 modern prompts users can choose from

export interface Prompt {
  text: string;
  icon?: string;
}

export const aiBibleChatPrompts: Record<string, Prompt[]> = {
  'bible-study': [
    { text: 'Explain the meaning of Romans 8:28 in context' },
    { text: 'What does the phrase "the kingdom of heaven" mean in the Gospels?' },
    { text: 'Help me understand the parable of the prodigal son' },
    { text: 'What is the context behind Revelation 21:4?' },
    { text: 'Explain the significance of the resurrection in 1 Corinthians 15' },
  ],
  
  'prayer-life': [
    { text: 'How do I develop a consistent prayer routine?' },
    { text: 'Teach me different types of prayer from the Bible' },
    { text: 'How do I pray when I don\'t feel like it?' },
    { text: 'What is the Lord\'s Prayer and how do I use it?' },
    { text: 'Help me pray for someone who is hurting' },
  ],

  'faith-life': [
    { text: 'How can I apply my faith to my workplace?' },
    { text: 'What does it mean to walk by faith, not by sight?' },
    { text: 'How do I trust God in difficult circumstances?' },
    { text: 'Help me balance faith and practical life decisions' },
    { text: 'What does integrity look like in daily life?' },
  ],

  'theology': [
    { text: 'Explain the doctrine of the Trinity' },
    { text: 'What are the different views on baptism?' },
    { text: 'Help me understand predestination and free will' },
    { text: 'What is the meaning of atonement?' },
    { text: 'Explain the concept of the Kingdom of God' },
  ],

  'relationships': [
    { text: 'What does the Bible say about dating and courtship?' },
    { text: 'How do I build a biblical marriage?' },
    { text: 'Help me understand forgiveness in relationships' },
    { text: 'What does loving your neighbor really mean?' },
    { text: 'How do I handle conflict biblically?' },
  ],

  'spiritual-growth': [
    { text: 'How do I develop spiritual disciplines?' },
    { text: 'What are the fruits of the Spirit and how do I cultivate them?' },
    { text: 'Help me overcome spiritual dryness' },
    { text: 'How do I study the Bible effectively?' },
    { text: 'What does meditation mean from a Christian perspective?' },
  ],

  'life-questions': [
    { text: 'How do I find my purpose in life?' },
    { text: 'Why do bad things happen to good people?' },
    { text: 'How do I know God\'s will for my life?' },
    { text: 'What does the Bible say about suffering?' },
    { text: 'How do I make good decisions as a Christian?' },
  ],

  'holy-spirit': [
    { text: 'Who is the Holy Spirit?' },
    { text: 'How do I receive the Holy Spirit?' },
    { text: 'What are spiritual gifts and how do I discover mine?' },
    { text: 'How do I be led by the Spirit?' },
    { text: 'What is the fruit of the Spirit?' },
  ],

  'service': [
    { text: 'How do I serve God in my everyday life?' },
    { text: 'What does servant leadership look like?' },
    { text: 'How do I discover my place of service?' },
    { text: 'What does the Bible say about helping the poor?' },
    { text: 'How do I serve without burning out?' },
  ],

  'general-chat': [
    { text: 'Tell me about God\'s love for me' },
    { text: 'How can I start reading the Bible?' },
    { text: 'What does it mean to be a Christian?' },
    { text: 'Help me understand the Gospel message' },
    { text: 'How do I develop a personal relationship with God?' },
  ],
};

export const getPromptsForCategory = (categoryId: string): Prompt[] => {
  return aiBibleChatPrompts[categoryId] || [];
};

export const getRandomPrompt = (categoryId: string): string => {
  const prompts = aiBibleChatPrompts[categoryId] || [];
  if (prompts.length === 0) return '';
  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex].text;
};

