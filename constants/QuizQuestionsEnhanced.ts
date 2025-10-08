/**
 * Enhanced Bible Memorization Questions
 * Comprehensive collection of 140 Bible verse completion questions
 * Designed specifically to help users memorize Scripture
 */

export interface MemorizationQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  verse: string;
  explanation: string;
  testament: 'old' | 'new';
  category: 'memorization';
  difficulty: 'easy' | 'medium' | 'hard';
}

export const ENHANCED_MEMORIZATION_QUESTIONS: MemorizationQuestion[] = [
  // ==================== THE LIFE AND TEACHINGS OF JESUS ====================

  // John 14:6
  {
    id: 'mem_enhanced_001',
    question: 'Complete this verse: "Jesus said, \'I am the way and the truth and the life. No one comes to the Father except ______.\'"',
    options: ['Through me', 'Through faith', 'Through repentance', 'Through baptism'],
    correctAnswer: 0,
    verse: 'John 14:6',
    explanation: 'Jesus said, "I am the way and the truth and the life. No one comes to the Father except through me."',
    testament: 'new',
    category: 'memorization',
    difficulty: 'easy'
  },

  // John 3:16
  {
    id: 'mem_enhanced_002',
    question: 'Complete this verse: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but ______."',
    options: ['Have eternal life', 'Be saved', 'Have peace', 'Be forgiven'],
    correctAnswer: 0,
    verse: 'John 3:16',
    explanation: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'easy'
  },

  // Matthew 11:28
  {
    id: 'mem_enhanced_003',
    question: 'Complete this verse: "Come to me, all you who are weary and burdened, and I will ______."',
    options: ['Give you rest', 'Heal you', 'Save you', 'Forgive you'],
    correctAnswer: 0,
    verse: 'Matthew 11:28',
    explanation: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'easy'
  },

  // Matthew 4:4
  {
    id: 'mem_enhanced_004',
    question: 'Complete this verse: "Jesus said, \'It is written: \'Man shall not live on bread alone, but ______.\'"',
    options: ['On every word that comes from the mouth of God', 'On faith', 'On prayer', 'On love'],
    correctAnswer: 0,
    verse: 'Matthew 4:4',
    explanation: 'Jesus answered, "It is written: \'Man shall not live on bread alone, but on every word that comes from the mouth of God.\'"',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Matthew 6:33
  {
    id: 'mem_enhanced_005',
    question: 'Complete this verse: "But seek first his kingdom and his righteousness, and ______."',
    options: ['All these things will be given to you as well', 'You will find peace', 'You will be blessed', 'Your prayers will be answered'],
    correctAnswer: 0,
    verse: 'Matthew 6:33',
    explanation: 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Luke 23:34
  {
    id: 'mem_enhanced_006',
    question: 'Complete this verse: "Then Jesus said, \'Father, forgive them, for ______.\'"',
    options: ['They do not know what they are doing', 'They are lost', 'They need mercy', 'They are blind'],
    correctAnswer: 0,
    verse: 'Luke 23:34',
    explanation: 'Jesus said, "Father, forgive them, for they do not know what they are doing."',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // John 6:35
  {
    id: 'mem_enhanced_007',
    question: 'Complete this verse: "Jesus answered, \'I am the bread of life. Whoever comes to me will never go hungry, and ______.\'"',
    options: ['Whoever believes in me will never be thirsty', 'Whoever follows me will have peace', 'Whoever trusts me will be saved', 'Whoever loves me will be blessed'],
    correctAnswer: 0,
    verse: 'John 6:35',
    explanation: 'Then Jesus declared, "I am the bread of life. Whoever comes to me will never go hungry, and whoever believes in me will never be thirsty."',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Matthew 5:44-45
  {
    id: 'mem_enhanced_008',
    question: 'Complete this verse: "But I tell you, love your enemies and pray for those who persecute you, that you may be children of your Father in heaven. He causes his sun to rise on the evil and the good, and ______."',
    options: ['Sends rain on the just and the unjust', 'Shows mercy to all', 'Loves everyone equally', 'Forgives all sins'],
    correctAnswer: 0,
    verse: 'Matthew 5:44-45',
    explanation: 'But I tell you, love your enemies and pray for those who persecute you, that you may be children of your Father in heaven. He causes his sun to rise on the evil and the good, and sends rain on the just and the unjust.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'hard'
  },

  // Matthew 7:12
  {
    id: 'mem_enhanced_009',
    question: 'Complete this verse: "So in everything, do to others what you would have them do to you, for ______."',
    options: ['This sums up the Law and the Prophets', 'This is the way of love', 'This is God\'s command', 'This is the path to heaven'],
    correctAnswer: 0,
    verse: 'Matthew 7:12',
    explanation: 'So in everything, do to others what you would have them do to you, for this sums up the Law and the Prophets.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Matthew 19:26
  {
    id: 'mem_enhanced_010',
    question: 'Complete this verse: "Jesus looked at them and said, \'With man this is impossible, but with God ______.\'"',
    options: ['All things are possible', 'Nothing is impossible', 'Everything is possible', 'Miracles happen'],
    correctAnswer: 0,
    verse: 'Matthew 19:26',
    explanation: 'Jesus looked at them and said, "With man this is impossible, but with God all things are possible."',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // John 15:5
  {
    id: 'mem_enhanced_011',
    question: 'Complete this verse: "I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit; apart from me ______."',
    options: ['You can do nothing', 'You will wither', 'You cannot bear fruit', 'You will die'],
    correctAnswer: 0,
    verse: 'John 15:5',
    explanation: 'I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit; apart from me you can do nothing.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Luke 19:10
  {
    id: 'mem_enhanced_012',
    question: 'Complete this verse: "For the Son of Man came to seek and to ______."',
    options: ['Save the lost', 'Heal the sick', 'Teach the truth', 'Bring peace'],
    correctAnswer: 0,
    verse: 'Luke 19:10',
    explanation: 'For the Son of Man came to seek and to save the lost.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'easy'
  },

  // John 11:25-26
  {
    id: 'mem_enhanced_013',
    question: 'Complete this verse: "Then Jesus declared, \'I am the resurrection and the life. The one who believes in me will live, even though they die; and whoever lives by believing in me ______.\'"',
    options: ['Will never die', 'Will have eternal life', 'Will be saved', 'Will be with me forever'],
    correctAnswer: 0,
    verse: 'John 11:25-26',
    explanation: 'Jesus said to her, "I am the resurrection and the life. The one who believes in me will live, even though they die; and whoever lives by believing in me will never die."',
    testament: 'new',
    category: 'memorization',
    difficulty: 'hard'
  },

  // Matthew 19:14
  {
    id: 'mem_enhanced_014',
    question: 'Complete this verse: "Jesus said, \'Let the little children come to me, and do not hinder them, for ______.\'"',
    options: ['The kingdom of heaven belongs to such as these', 'They are precious in my sight', 'I love them dearly', 'They will inherit the earth'],
    correctAnswer: 0,
    verse: 'Matthew 19:14',
    explanation: 'Jesus said, "Let the little children come to me, and do not hinder them, for the kingdom of heaven belongs to such as these."',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Matthew 7:24
  {
    id: 'mem_enhanced_015',
    question: 'Complete this verse: "Therefore everyone who hears these words of mine and puts them into practice is like a wise man who built his house on ______."',
    options: ['The rock', 'Solid ground', 'A firm foundation', 'The cornerstone'],
    correctAnswer: 0,
    verse: 'Matthew 7:24',
    explanation: 'Therefore everyone who hears these words of mine and puts them into practice is like a wise man who built his house on the rock.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // ==================== THE OLD TESTAMENT ====================

  // Genesis 1:1
  {
    id: 'mem_enhanced_016',
    question: 'Complete this verse: "In the beginning, God created ______."',
    options: ['The heavens and the earth', 'Light and darkness', 'The sky and sea', 'All living things'],
    correctAnswer: 0,
    verse: 'Genesis 1:1',
    explanation: 'In the beginning God created the heavens and the earth.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'easy'
  },

  // Psalm 23:1
  {
    id: 'mem_enhanced_017',
    question: 'Complete this verse: "The Lord is my shepherd; I shall ______."',
    options: ['Not want', 'Not fear', 'Not worry', 'Not be in need'],
    correctAnswer: 0,
    verse: 'Psalm 23:1',
    explanation: 'The Lord is my shepherd, I lack nothing.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'easy'
  },

  // Psalm 119:105
  {
    id: 'mem_enhanced_018',
    question: 'Complete this verse: "Your word is a lamp for my feet, ______."',
    options: ['A light on my path', 'A guide in darkness', 'My source of wisdom', 'My daily bread'],
    correctAnswer: 0,
    verse: 'Psalm 119:105',
    explanation: 'Your word is a lamp for my feet, a light on my path.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Proverbs 3:5
  {
    id: 'mem_enhanced_019',
    question: 'Complete this verse: "Trust in the Lord with all your heart and lean not on ______."',
    options: ['Your own understanding', 'Your own strength', 'Your own wisdom', 'Your own plans'],
    correctAnswer: 0,
    verse: 'Proverbs 3:5',
    explanation: 'Trust in the Lord with all your heart and lean not on your own understanding.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'easy'
  },


  // Psalm 28:7
  {
    id: 'mem_enhanced_021',
    question: 'Complete this verse: "The Lord is my strength and my shield; my heart trusts in him, and he helps me. My heart leaps for joy, and ______."',
    options: ['I will give thanks to him in song', 'I will praise him forever', 'I will worship him always', 'I will honor him with my life'],
    correctAnswer: 0,
    verse: 'Psalm 28:7',
    explanation: 'The Lord is my strength and my shield; my heart trusts in him, and he helps me. My heart leaps for joy, and with my song I praise him.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'hard'
  },

  // Psalm 46:10
  {
    id: 'mem_enhanced_022',
    question: 'Complete this verse: "Be still, and know that ______."',
    options: ['I am God', 'I am with you', 'I am your strength', 'I am your refuge'],
    correctAnswer: 0,
    verse: 'Psalm 46:10',
    explanation: 'He says, "Be still, and know that I am God.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'easy'
  },

  // Psalm 23:4
  {
    id: 'mem_enhanced_023',
    question: 'Complete this verse: "Even though I walk through the darkest valley, I will fear no evil, for ______."',
    options: ['You are with me', 'Your rod and your staff comfort me', 'You protect me', 'You guide me'],
    correctAnswer: 0,
    verse: 'Psalm 23:4',
    explanation: 'Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Joshua 1:9
  {
    id: 'mem_enhanced_024',
    question: 'Complete this verse: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God ______."',
    options: ['Will be with you wherever you go', 'Will fight for you', 'Will protect you', 'Will guide you'],
    correctAnswer: 0,
    verse: 'Joshua 1:9',
    explanation: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Isaiah 40:31
  {
    id: 'mem_enhanced_025',
    question: 'Complete this verse: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and ______."',
    options: ['Not be faint', 'Not give up', 'Not lose hope', 'Not be discouraged'],
    correctAnswer: 0,
    verse: 'Isaiah 40:31',
    explanation: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Proverbs 1:7
  {
    id: 'mem_enhanced_026',
    question: 'Complete this verse: "The fear of the Lord is the beginning of knowledge, but fools ______."',
    options: ['Despise wisdom and instruction', 'Reject discipline', 'Hate correction', 'Ignore advice'],
    correctAnswer: 0,
    verse: 'Proverbs 1:7',
    explanation: 'The fear of the Lord is the beginning of knowledge, but fools despise wisdom and instruction.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Jeremiah 29:11
  {
    id: 'mem_enhanced_027',
    question: 'Complete this verse: "For I know the plans I have for you,\" declares the Lord, \"plans to prosper you and not to harm you, plans to give you ______."',
    options: ['Hope and a future', 'Peace and joy', 'Love and mercy', 'Strength and courage'],
    correctAnswer: 0,
    verse: 'Jeremiah 29:11',
    explanation: '"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Psalm 51:10
  {
    id: 'mem_enhanced_028',
    question: 'Complete this verse: "Create in me a pure heart, O God, and ______."',
    options: ['Renew a steadfast spirit within me', 'Give me wisdom and understanding', 'Fill me with your love', 'Teach me your ways'],
    correctAnswer: 0,
    verse: 'Psalm 51:10',
    explanation: 'Create in me a pure heart, O God, and renew a steadfast spirit within me.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Proverbs 18:10
  {
    id: 'mem_enhanced_029',
    question: 'Complete this verse: "The name of the Lord is a fortified tower; the righteous ______."',
    options: ['Run to it and are safe', 'Find refuge in it', 'Are protected by it', 'Take shelter in it'],
    correctAnswer: 0,
    verse: 'Proverbs 18:10',
    explanation: 'The name of the Lord is a fortified tower; the righteous run to it and are safe.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Isaiah 41:10
  {
    id: 'mem_enhanced_030',
    question: 'Complete this verse: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with ______."',
    options: ['My righteous right hand', 'My mighty power', 'My unfailing love', 'My eternal arms'],
    correctAnswer: 0,
    verse: 'Isaiah 41:10',
    explanation: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'hard'
  },

  // ==================== WISDOM AND PROVERBS ====================

  // Proverbs 9:10
  {
    id: 'mem_enhanced_031',
    question: 'Complete this verse: "The fear of the Lord is the beginning of wisdom, and knowledge of the Holy One is ______."',
    options: ['Understanding', 'Life', 'Peace', 'Joy'],
    correctAnswer: 0,
    verse: 'Proverbs 9:10',
    explanation: 'The fear of the Lord is the beginning of wisdom, and knowledge of the Holy One is understanding.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Proverbs 16:18
  {
    id: 'mem_enhanced_032',
    question: 'Complete this verse: "Pride goes before destruction, a haughty spirit ______."',
    options: ['Before a fall', 'Before shame', 'Before judgment', 'Before defeat'],
    correctAnswer: 0,
    verse: 'Proverbs 16:18',
    explanation: 'Pride goes before destruction, a haughty spirit before a fall.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'easy'
  },

  // Proverbs 13:20
  {
    id: 'mem_enhanced_033',
    question: 'Complete this verse: "Whoever walks with the wise becomes wise, but the companion of fools ______."',
    options: ['Suffers harm', 'Becomes foolish', 'Loses their way', 'Finds trouble'],
    correctAnswer: 0,
    verse: 'Proverbs 13:20',
    explanation: 'Walk with the wise and become wise, for a companion of fools suffers harm.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Proverbs 22:6
  {
    id: 'mem_enhanced_034',
    question: 'Complete this verse: "Start children off on the way they should go, and even when they are old they ______."',
    options: ['Will not turn from it', 'Will remember it', 'Will follow it', 'Will teach it'],
    correctAnswer: 0,
    verse: 'Proverbs 22:6',
    explanation: 'Start children off on the way they should go, and even when they are old they will not turn from it.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'easy'
  },

  // Proverbs 15:1
  {
    id: 'mem_enhanced_035',
    question: 'Complete this verse: "A gentle answer turns away wrath, but ______."',
    options: ['A harsh word stirs up anger', 'A foolish word causes trouble', 'A quick word brings regret', 'A bitter word causes pain'],
    correctAnswer: 0,
    verse: 'Proverbs 15:1',
    explanation: 'A gentle answer turns away wrath, but a harsh word stirs up anger.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Proverbs 3:5-6
  {
    id: 'mem_enhanced_036',
    question: 'Complete this verse: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and ______."',
    options: ['He will make your paths straight', 'He will guide your steps', 'He will direct your ways', 'He will lead you forward'],
    correctAnswer: 0,
    verse: 'Proverbs 3:5-6',
    explanation: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Proverbs 4:23
  {
    id: 'mem_enhanced_037',
    question: 'Complete this verse: "Above all else, guard your heart, for ______."',
    options: ['Everything you do flows from it', 'It is the wellspring of life', 'It determines your course', 'It guides your actions'],
    correctAnswer: 0,
    verse: 'Proverbs 4:23',
    explanation: 'Above all else, guard your heart, for everything you do flows from it.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Proverbs 10:4
  {
    id: 'mem_enhanced_038',
    question: 'Complete this verse: "Lazy hands make for poverty, but diligent hands ______."',
    options: ['Bring wealth', 'Build success', 'Create prosperity', 'Achieve goals'],
    correctAnswer: 0,
    verse: 'Proverbs 10:4',
    explanation: 'Lazy hands make for poverty, but diligent hands bring wealth.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'easy'
  },

  // Proverbs 21:5
  {
    id: 'mem_enhanced_039',
    question: 'Complete this verse: "The plans of the diligent lead to profit as surely as haste leads to ______."',
    options: ['Poverty', 'Failure', 'Loss', 'Regret'],
    correctAnswer: 0,
    verse: 'Proverbs 21:5',
    explanation: 'The plans of the diligent lead to profit as surely as haste leads to poverty.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Proverbs 17:17
  {
    id: 'mem_enhanced_040',
    question: 'Complete this verse: "A friend loves at all times, and a brother is born for ______."',
    options: ['A time of adversity', 'A difficult time', 'Times of trouble', 'When you need help'],
    correctAnswer: 0,
    verse: 'Proverbs 17:17',
    explanation: 'A friend loves at all times, and a brother is born for a time of adversity.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // ==================== THE NEW TESTAMENT LETTERS ====================

  // Romans 3:23
  {
    id: 'mem_enhanced_041',
    question: 'Complete this verse: "For all have sinned and fall short of ______."',
    options: ['The glory of God', 'God\'s standards', 'Heaven\'s requirements', 'Perfect righteousness'],
    correctAnswer: 0,
    verse: 'Romans 3:23',
    explanation: 'For all have sinned and fall short of the glory of God.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'easy'
  },

  // Romans 6:23
  {
    id: 'mem_enhanced_042',
    question: 'Complete this verse: "For the wages of sin is death, but the gift of God is ______."',
    options: ['Eternal life', 'Salvation', 'Forgiveness', 'Peace'],
    correctAnswer: 0,
    verse: 'Romans 6:23',
    explanation: 'For the wages of sin is death, but the gift of God is eternal life in Christ Jesus our Lord.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'easy'
  },

  // 2 Corinthians 5:17
  {
    id: 'mem_enhanced_043',
    question: 'Complete this verse: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, ______!"',
    options: ['The new is here', 'The new has come', 'The transformation is complete', 'The change has happened'],
    correctAnswer: 0,
    verse: '2 Corinthians 5:17',
    explanation: 'Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Romans 8:28
  {
    id: 'mem_enhanced_044',
    question: 'Complete this verse: "And we know that in all things God works for the good of those who love him, who have been called according to ______."',
    options: ['His purpose', 'His will', 'His plan', 'His calling'],
    correctAnswer: 0,
    verse: 'Romans 8:28',
    explanation: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Philippians 4:6-7
  {
    id: 'mem_enhanced_045',
    question: 'Complete this verse: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard ______."',
    options: ['Your hearts and your minds', 'Your thoughts and emotions', 'Your soul and spirit', 'Your life and peace'],
    correctAnswer: 0,
    verse: 'Philippians 4:6-7',
    explanation: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'hard'
  },

  // Galatians 2:20
  {
    id: 'mem_enhanced_046',
    question: 'Complete this verse: "I have been crucified with Christ and I no longer live, but Christ lives in me. The life I now live in the body, I live by faith in the Son of God, who loved me and ______."',
    options: ['Gave himself for me', 'Died for me', 'Sacrificed himself for me', 'Poured out his life for me'],
    correctAnswer: 0,
    verse: 'Galatians 2:20',
    explanation: 'I have been crucified with Christ and I no longer live, but Christ lives in me. The life I now live in the body, I live by faith in the Son of God, who loved me and gave himself for me.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'hard'
  },

  // Ephesians 2:8-9
  {
    id: 'mem_enhanced_047',
    question: 'Complete this verse: "For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God—not by works, so that ______."',
    options: ['No one can boast', 'No one can claim credit', 'No one can take pride', 'No one can earn it'],
    correctAnswer: 0,
    verse: 'Ephesians 2:8-9',
    explanation: 'For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God—not by works, so that no one can boast.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Philippians 4:8
  {
    id: 'mem_enhanced_048',
    question: 'Complete this verse: "Finally, brothers and sisters, whatever is true, whatever is noble, whatever is right, whatever is pure, whatever is lovely, whatever is admirable—if anything is excellent or praiseworthy—______."',
    options: ['Think about such things', 'Do such things', 'Pursue such things', 'Meditate on such things'],
    correctAnswer: 0,
    verse: 'Philippians 4:8',
    explanation: 'Finally, brothers and sisters, whatever is true, whatever is noble, whatever is right, whatever is pure, whatever is lovely, whatever is admirable—if anything is excellent or praiseworthy—think about such things.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'hard'
  },

  // 1 Corinthians 13:13
  {
    id: 'mem_enhanced_049',
    question: 'Complete this verse: "And now these three remain: faith, hope and love. But the greatest of these is ______."',
    options: ['Love', 'Faith', 'Hope', 'All are equal'],
    correctAnswer: 0,
    verse: '1 Corinthians 13:13',
    explanation: 'And now these three remain: faith, hope and love. But the greatest of these is love.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'easy'
  },

  // Philippians 4:13
  {
    id: 'mem_enhanced_020',
    question: 'Complete this verse: "I can do all this through him who ______."',
    options: ['Gives me strength', 'Loves me', 'Saves me', 'Guides me'],
    correctAnswer: 0,
    verse: 'Philippians 4:13',
    explanation: 'I can do all this through him who gives me strength.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'easy'
  },

  // Galatians 5:22-23
  {
    id: 'mem_enhanced_051',
    question: 'Complete this verse: "But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and ______."',
    options: ['Self-control', 'Humility', 'Patience', 'Wisdom'],
    correctAnswer: 0,
    verse: 'Galatians 5:22-23',
    explanation: 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Galatians 6:9
  {
    id: 'mem_enhanced_052',
    question: 'Complete this verse: "Let us not become weary in doing good, for at the proper time we will reap a harvest if ______."',
    options: ['We do not give up', 'We persevere', 'We remain faithful', 'We continue'],
    correctAnswer: 0,
    verse: 'Galatians 6:9',
    explanation: 'Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // 2 Timothy 1:7
  {
    id: 'mem_enhanced_053',
    question: 'Complete this verse: "For God has not given us a spirit of fear, but of power and of love and of ______."',
    options: ['A sound mind', 'Self-discipline', 'Wisdom', 'Courage'],
    correctAnswer: 0,
    verse: '2 Timothy 1:7',
    explanation: 'For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // 1 Peter 3:3-4
  {
    id: 'mem_enhanced_054',
    question: 'Complete this verse: "Your beauty should not come from outward adornment, such as elaborate hairstyles and the wearing of gold jewelry or fine clothes. Rather, it should be that of your inner self, the unfading beauty of a gentle and quiet spirit, which is ______."',
    options: ['Of great worth in God\'s sight', 'Precious to the Lord', 'Valuable and beautiful', 'Pleasing to God'],
    correctAnswer: 0,
    verse: '1 Peter 3:3-4',
    explanation: 'Your beauty should not come from outward adornment, such as elaborate hairstyles and the wearing of gold jewelry or fine clothes. Rather, it should be that of your inner self, the unfading beauty of a gentle and quiet spirit, which is of great worth in God\'s sight.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'hard'
  },

  // Ephesians 4:32
  {
    id: 'mem_enhanced_055',
    question: 'Complete this verse: "Be kind and compassionate to one another, forgiving each other, just as in Christ God ______."',
    options: ['Forgave you', 'Loves you', 'Saves you', 'Accepts you'],
    correctAnswer: 0,
    verse: 'Ephesians 4:32',
    explanation: 'Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // ==================== PROMISES AND COMFORT ====================

  // Philippians 4:19
  {
    id: 'mem_enhanced_056',
    question: 'Complete this verse: "And my God will meet all your needs according to the riches of his glory in ______."',
    options: ['Christ Jesus', 'Heaven', 'His kingdom', 'His love'],
    correctAnswer: 0,
    verse: 'Philippians 4:19',
    explanation: 'And my God will meet all your needs according to the riches of his glory in Christ Jesus.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // 1 Peter 5:7
  {
    id: 'mem_enhanced_057',
    question: 'Complete this verse: "Cast all your anxiety on him because ______."',
    options: ['He cares for you', 'He loves you', 'He watches over you', 'He protects you'],
    correctAnswer: 0,
    verse: '1 Peter 5:7',
    explanation: 'Cast all your anxiety on him because he cares for you.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'easy'
  },

  // Psalm 34:18
  {
    id: 'mem_enhanced_058',
    question: 'Complete this verse: "The Lord is close to the brokenhearted and saves those who ______."',
    options: ['Are crushed in spirit', 'Call on him', 'Trust in him', 'Seek him'],
    correctAnswer: 0,
    verse: 'Psalm 34:18',
    explanation: 'The Lord is close to the brokenhearted and saves those who are crushed in spirit.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // 2 Corinthians 12:9
  {
    id: 'mem_enhanced_059',
    question: 'Complete this verse: "But he said to me, \'My grace is sufficient for you, for my power is made perfect in weakness.\' Therefore I will boast all the more gladly about my weaknesses, so that Christ\'s power may rest on me."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: '2 Corinthians 12:9',
    explanation: 'But he said to me, "My grace is sufficient for you, for my power is made perfect in weakness." Therefore I will boast all the more gladly about my weaknesses, so that Christ\'s power may rest on me.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'hard'
  },

  // Isaiah 40:29
  {
    id: 'mem_enhanced_060',
    question: 'Complete this verse: "He gives strength to the weary and increases the power of ______."',
    options: ['The weak', 'Those who hope in him', 'The powerless', 'The tired'],
    correctAnswer: 0,
    verse: 'Isaiah 40:29',
    explanation: 'He gives strength to the weary and increases the power of the weak.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },



  // Exodus 14:14
  {
    id: 'mem_enhanced_063',
    question: 'Complete this verse: "The Lord will fight for you; you need only ______."',
    options: ['To be still', 'To trust him', 'To have faith', 'To wait'],
    correctAnswer: 0,
    verse: 'Exodus 14:14',
    explanation: 'The Lord will fight for you; you need only to be still.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'easy'
  },

  // Hebrews 13:5
  {
    id: 'mem_enhanced_064',
    question: 'Complete this verse: "Never will I leave you; never will I ______."',
    options: ['Forsake you', 'Abandon you', 'Forget you', 'Reject you'],
    correctAnswer: 0,
    verse: 'Hebrews 13:5',
    explanation: 'Keep your lives free from the love of money and be content with what you have, because God has said, "Never will I leave you; never will I forsake you."',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // 1 Corinthians 15:57
  {
    id: 'mem_enhanced_065',
    question: 'Complete this verse: "But thanks be to God! He gives us the victory through our Lord ______."',
    options: ['Jesus Christ', 'Jesus', 'Christ', 'The Messiah'],
    correctAnswer: 0,
    verse: '1 Corinthians 15:57',
    explanation: 'But thanks be to God! He gives us the victory through our Lord Jesus Christ.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // ==================== THE GREAT COMMISSION AND FAITH ====================

  // Matthew 28:19-20
  {
    id: 'mem_enhanced_066',
    question: 'Complete this verse: "Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you. And surely I am with you always, to ______."',
    options: ['The very end of the age', 'The end of time', 'Eternity', 'Forever'],
    correctAnswer: 0,
    verse: 'Matthew 28:19-20',
    explanation: 'Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you. And surely I am with you always, to the very end of the age.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'hard'
  },

  // Hebrews 11:1
  {
    id: 'mem_enhanced_067',
    question: 'Complete this verse: "Now faith is confidence in what we hope for and assurance about ______."',
    options: ['What we do not see', 'Things unseen', 'The future', 'God\'s promises'],
    correctAnswer: 0,
    verse: 'Hebrews 11:1',
    explanation: 'Now faith is confidence in what we hope for and assurance about what we do not see.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Hebrews 11:6
  {
    id: 'mem_enhanced_068',
    question: 'Complete this verse: "And without faith it is impossible to please God, because anyone who comes to him must believe that he exists and that he rewards those who ______."',
    options: ['Earnestly seek him', 'Diligently search for him', 'Sincerely look for him', 'Faithfully pursue him'],
    correctAnswer: 0,
    verse: 'Hebrews 11:6',
    explanation: 'And without faith it is impossible to please God, because anyone who comes to him must believe that he exists and that he rewards those who earnestly seek him.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // 2 Corinthians 5:7
  {
    id: 'mem_enhanced_069',
    question: 'Complete this verse: "For we live by faith, not by ______."',
    options: ['Sight', 'What we see', 'Our eyes', 'Visible things'],
    correctAnswer: 0,
    verse: '2 Corinthians 5:7',
    explanation: 'For we live by faith, not by sight.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'easy'
  },

  // Matthew 17:20
  {
    id: 'mem_enhanced_070',
    question: 'Complete this verse: "Jesus replied, \'Truly I tell you, if you have faith as small as a mustard seed, you can say to this mountain, \'Move from here to there,\' and it will move. Nothing will be impossible for you.\'"',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Matthew 17:20',
    explanation: 'He replied, "Because you have so little faith. Truly I tell you, if you have faith as small as a mustard seed, you can say to this mountain, \'Move from here to there,\' and it will move. Nothing will be impossible for you."',
    testament: 'new',
    category: 'memorization',
    difficulty: 'hard'
  },

  // ==================== SIN, REPENTANCE, AND FORGIVENESS ====================

  // 1 John 1:9
  {
    id: 'mem_enhanced_071',
    question: 'Complete this verse: "If we confess our sins, he is faithful and just and will forgive us our sins and purify us from ______."',
    options: ['All unrighteousness', 'All wrongdoing', 'All evil', 'All sin'],
    correctAnswer: 0,
    verse: '1 John 1:9',
    explanation: 'If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Acts 3:19
  {
    id: 'mem_enhanced_072',
    question: 'Complete this verse: "Repent, then, and turn to God, so that your sins may be wiped out, that times of refreshing may come from the Lord."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Acts 3:19',
    explanation: 'Repent, then, and turn to God, so that your sins may be wiped out, that times of refreshing may come from the Lord.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Colossians 3:13
  {
    id: 'mem_enhanced_073',
    question: 'Complete this verse: "Bear with each other and forgive one another if any of you has a grievance against someone. Forgive as the Lord ______."',
    options: ['Forgave you', 'Loves you', 'Accepts you', 'Saves you'],
    correctAnswer: 0,
    verse: 'Colossians 3:13',
    explanation: 'Bear with each other and forgive one another if any of you has a grievance against someone. Forgive as the Lord forgave you.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Romans 3:23
  {
    id: 'mem_enhanced_074',
    question: 'Complete this verse: "For everyone has sinned; we all fall short of God\'s glorious standard."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Romans 3:23',
    explanation: 'For everyone has sinned; we all fall short of God\'s glorious standard.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'easy'
  },

  // 1 John 1:7
  {
    id: 'mem_enhanced_075',
    question: 'Complete this verse: "But if we walk in the light, as he is in the light, we have fellowship with one another, and the blood of Jesus, his Son, purifies us from all sin."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: '1 John 1:7',
    explanation: 'But if we walk in the light, as he is in the light, we have fellowship with one another, and the blood of Jesus, his Son, purifies us from all sin.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // ==================== GOD'S CHARACTER AND LOVE ====================

  // 1 John 4:8
  {
    id: 'mem_enhanced_076',
    question: 'Complete this verse: "Whoever does not love does not know God, because ______."',
    options: ['God is love', 'Love comes from God', 'God is the source of love', 'Love defines God'],
    correctAnswer: 0,
    verse: '1 John 4:8',
    explanation: 'Whoever does not love does not know God, because God is love.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'easy'
  },

  // 1 John 4:19
  {
    id: 'mem_enhanced_077',
    question: 'Complete this verse: "We love because he ______."',
    options: ['First loved us', 'Created love', 'Commands us to love', 'Shows us how to love'],
    correctAnswer: 0,
    verse: '1 John 4:19',
    explanation: 'We love because he first loved us.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'easy'
  },

  // Psalm 145:8
  {
    id: 'mem_enhanced_078',
    question: 'Complete this verse: "The Lord is gracious and compassionate, slow to anger and ______."',
    options: ['Rich in love', 'Abundant in mercy', 'Full of kindness', 'Overflowing with grace'],
    correctAnswer: 0,
    verse: 'Psalm 145:8',
    explanation: 'The Lord is gracious and compassionate, slow to anger and rich in love.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Psalm 86:15
  {
    id: 'mem_enhanced_079',
    question: 'Complete this verse: "But you, Lord, are a compassionate and gracious God, slow to anger, abounding in love and ______."',
    options: ['Faithfulness', 'Mercy', 'Kindness', 'Truth'],
    correctAnswer: 0,
    verse: 'Psalm 86:15',
    explanation: 'But you, Lord, are a compassionate and gracious God, slow to anger, abounding in love and faithfulness.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // James 1:17
  {
    id: 'mem_enhanced_080',
    question: 'Complete this verse: "Every good and perfect gift is from above, coming down from the Father of the heavenly lights, who does not change like ______."',
    options: ['Shifting shadows', 'The seasons', 'The weather', 'The tides'],
    correctAnswer: 0,
    verse: 'James 1:17',
    explanation: 'Every good and perfect gift is from above, coming down from the Father of the heavenly lights, who does not change like shifting shadows.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // ==================== PRAYER AND WORSHIP ====================

  // Matthew 6:9-13 (The Lord's Prayer)
  {
    id: 'mem_enhanced_081',
    question: 'Complete this verse: "This, then, is how you should pray: \'Our Father in heaven, hallowed be your name, your kingdom come, your will be done, on earth as it is in heaven. Give us today our daily bread. And forgive us our debts, as we also have forgiven our debtors. And lead us not into temptation, but deliver us from the evil one.\'"',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Matthew 6:9-13',
    explanation: 'This, then, is how you should pray: "Our Father in heaven, hallowed be your name, your kingdom come, your will be done, on earth as it is in heaven. Give us today our daily bread. And forgive us our debts, as we also have forgiven our debtors. And lead us not into temptation, but deliver us from the evil one."',
    testament: 'new',
    category: 'memorization',
    difficulty: 'hard'
  },

  // 1 Thessalonians 5:16-18
  {
    id: 'mem_enhanced_082',
    question: 'Complete this verse: "Rejoice always, pray continually, give thanks in all circumstances; for this is God\'s will for you in ______."',
    options: ['Christ Jesus', 'The Lord', 'Your life', 'Everything'],
    correctAnswer: 0,
    verse: '1 Thessalonians 5:16-18',
    explanation: 'Rejoice always, pray continually, give thanks in all circumstances; for this is God\'s will for you in Christ Jesus.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Philippians 4:6
  {
    id: 'mem_enhanced_083',
    question: 'Complete this verse: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Philippians 4:6',
    explanation: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Psalm 9:1
  {
    id: 'mem_enhanced_084',
    question: 'Complete this verse: "I will give thanks to you, Lord, with all my heart; I will tell of all your wonderful deeds."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Psalm 9:1',
    explanation: 'I will give thanks to you, Lord, with all my heart; I will tell of all your wonderful deeds.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Psalm 150:6
  {
    id: 'mem_enhanced_085',
    question: 'Complete this verse: "Let everything that has breath praise ______."',
    options: ['The Lord', 'God', 'The King', 'The Creator'],
    correctAnswer: 0,
    verse: 'Psalm 150:6',
    explanation: 'Let everything that has breath praise the Lord. Praise the Lord.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'easy'
  },

  // ==================== THE END TIMES AND HOPE ====================

  // Matthew 24:36
  {
    id: 'mem_enhanced_086',
    question: 'Complete this verse: "But about that day or hour no one knows, not even the angels in heaven, nor the Son, but only ______."',
    options: ['The Father', 'God', 'The Creator', 'The Almighty'],
    correctAnswer: 0,
    verse: 'Matthew 24:36',
    explanation: 'But about that day or hour no one knows, not even the angels in heaven, nor the Son, but only the Father.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Revelation 21:4
  {
    id: 'mem_enhanced_087',
    question: 'Complete this verse: "He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain, for ______."',
    options: ['The old order of things has passed away', 'A new heaven and earth have come', 'God has made everything new', 'All suffering has ended'],
    correctAnswer: 0,
    verse: 'Revelation 21:4',
    explanation: 'He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain, for the old order of things has passed away.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Revelation 3:11
  {
    id: 'mem_enhanced_088',
    question: 'Complete this verse: "I am coming soon. Hold on to what you have, so that no one will take your crown."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Revelation 3:11',
    explanation: 'I am coming soon. Hold on to what you have, so that no one will take your crown.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // 1 Thessalonians 4:16
  {
    id: 'mem_enhanced_089',
    question: 'Complete this verse: "For the Lord himself will come down from heaven, with a loud command, with the voice of the archangel and with the trumpet call of God, and the dead in Christ will rise first."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: '1 Thessalonians 4:16',
    explanation: 'For the Lord himself will come down from heaven, with a loud command, with the voice of the archangel and with the trumpet call of God, and the dead in Christ will rise first.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Revelation 22:20
  {
    id: 'mem_enhanced_090',
    question: 'Complete this verse: "He who testifies to these things says, \'Yes, I am coming soon.\' Amen. Come, Lord Jesus."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Revelation 22:20',
    explanation: 'He who testifies to these things says, "Yes, I am coming soon." Amen. Come, Lord Jesus.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // ==================== CHALLENGING COMPLETION (MULTIPLE MISSING WORDS) ====================

  // Psalm 119:11
  {
    id: 'mem_enhanced_091',
    question: 'Complete this verse: "Your word I have hidden in my heart, that I might ______."',
    options: ['Not sin against you', 'Remember your promises', 'Follow your ways', 'Honor your name'],
    correctAnswer: 0,
    verse: 'Psalm 119:11',
    explanation: 'I have hidden your word in my heart that I might not sin against you.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Luke 4:18-19
  {
    id: 'mem_enhanced_092',
    question: 'Complete this verse: "The Spirit of the Lord is on me, because he has anointed me to proclaim good news to the poor. He has sent me to proclaim freedom for the prisoners and recovery of sight for the blind, to set the oppressed free, to proclaim the year of the Lord\'s favor."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Luke 4:18-19',
    explanation: 'The Spirit of the Lord is on me, because he has anointed me to proclaim good news to the poor. He has sent me to proclaim freedom for the prisoners and recovery of sight for the blind, to set the oppressed free, to proclaim the year of the Lord\'s favor.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'hard'
  },

  // Romans 8:1-2
  {
    id: 'mem_enhanced_093',
    question: 'Complete this verse: "There is therefore now no condemnation for those who are in Christ Jesus, because through Christ Jesus the law of the Spirit who gives life has set you free from the law of sin and death."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Romans 8:1-2',
    explanation: 'Therefore, there is now no condemnation for those who are in Christ Jesus, because through Christ Jesus the law of the Spirit who gives life has set you free from the law of sin and death.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'hard'
  },

  // Acts 1:8
  {
    id: 'mem_enhanced_094',
    question: 'Complete this verse: "But you will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Acts 1:8',
    explanation: 'But you will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Romans 8:38-39
  {
    id: 'mem_enhanced_095',
    question: 'Complete this verse: "For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Romans 8:38-39',
    explanation: 'For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'hard'
  },

  // Ephesians 6:10-11
  {
    id: 'mem_enhanced_096',
    question: 'Complete this verse: "Finally, be strong in the Lord and in his mighty power. Put on the full armor of God, so that you can take your stand against the devil\'s schemes."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Ephesians 6:10-11',
    explanation: 'Finally, be strong in the Lord and in his mighty power. Put on the full armor of God, so that you can take your stand against the devil\'s schemes.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Psalm 23:1-3
  {
    id: 'mem_enhanced_097',
    question: 'Complete this verse: "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Psalm 23:1-3',
    explanation: 'The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // 1 Corinthians 13:4-5
  {
    id: 'mem_enhanced_098',
    question: 'Complete this verse: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: '1 Corinthians 13:4-5',
    explanation: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'hard'
  },



  // ==================== PSALMS AND PRAISE ====================

  // Psalm 19:1
  {
    id: 'mem_enhanced_101',
    question: 'Complete this verse: "The heavens declare the glory of God; the skies proclaim the work of his hands."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Psalm 19:1',
    explanation: 'The heavens declare the glory of God; the skies proclaim the work of his hands.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Psalm 138:1
  {
    id: 'mem_enhanced_102',
    question: 'Complete this verse: "I will praise you, Lord, with all my heart; before the \'gods\' I will sing your praise."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Psalm 138:1',
    explanation: 'I will praise you, Lord, with all my heart; before the "gods" I will sing your praise.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Psalm 8:1
  {
    id: 'mem_enhanced_103',
    question: 'Complete this verse: "O Lord, our Lord, how majestic is your name in all the earth!"',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Psalm 8:1',
    explanation: 'Lord, our Lord, how majestic is your name in all the earth!',
    testament: 'old',
    category: 'memorization',
    difficulty: 'easy'
  },

  // Psalm 62:1
  {
    id: 'mem_enhanced_104',
    question: 'Complete this verse: "My soul finds rest in God alone; my salvation comes from him."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Psalm 62:1',
    explanation: 'Truly my soul finds rest in God; my salvation comes from him.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Psalm 30:11
  {
    id: 'mem_enhanced_105',
    question: 'Complete this verse: "You turned my wailing into dancing; you removed my sackcloth and clothed me with joy."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Psalm 30:11',
    explanation: 'You turned my wailing into dancing; you removed my sackcloth and clothed me with joy.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Psalm 42:1
  {
    id: 'mem_enhanced_106',
    question: 'Complete this verse: "As the deer pants for streams of water, so my soul pants for you, my God."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Psalm 42:1',
    explanation: 'As the deer pants for streams of water, so my soul pants for you, my God.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Psalm 27:1
  {
    id: 'mem_enhanced_107',
    question: 'Complete this verse: "The Lord is my light and my salvation—whom shall I fear? The Lord is the stronghold of my life—of whom shall I be afraid?"',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Psalm 27:1',
    explanation: 'The Lord is my light and my salvation—whom shall I fear? The Lord is the stronghold of my life—of whom shall I be afraid?',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Psalm 121:1-2
  {
    id: 'mem_enhanced_108',
    question: 'Complete this verse: "I lift up my eyes to the mountains—where does my help come from? My help comes from the Lord, the Maker of heaven and earth."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Psalm 121:1-2',
    explanation: 'I lift up my eyes to the mountains—where does my help come from? My help comes from the Lord, the Maker of heaven and earth.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Psalm 118:1
  {
    id: 'mem_enhanced_109',
    question: 'Complete this verse: "Give thanks to the Lord, for he is good; his love endures forever."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Psalm 118:1',
    explanation: 'Give thanks to the Lord, for he is good; his love endures forever.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'easy'
  },

  // Psalm 139:23
  {
    id: 'mem_enhanced_110',
    question: 'Complete this verse: "Search me, God, and know my heart; test me and know my anxious thoughts."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Psalm 139:23',
    explanation: 'Search me, God, and know my heart; test me and know my anxious thoughts.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // ==================== PROPHETS AND PROPHECY ====================

  // Isaiah 53:5
  {
    id: 'mem_enhanced_111',
    question: 'Complete this verse: "He was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him, and by his wounds we are healed."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Isaiah 53:5',
    explanation: 'But he was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him, and by his wounds we are healed.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Micah 5:2
  {
    id: 'mem_enhanced_112',
    question: 'Complete this verse: "But you, Bethlehem Ephrathah, though you are small among the clans of Judah, out of you will come for me one who will be ruler over Israel, whose origins are from of old, from ancient times."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Micah 5:2',
    explanation: 'But you, Bethlehem Ephrathah, though you are small among the clans of Judah, out of you will come for me one who will be ruler over Israel, whose origins are from of old, from ancient times.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Isaiah 7:14
  {
    id: 'mem_enhanced_113',
    question: 'Complete this verse: "The virgin will conceive and give birth to a son, and will call him Immanuel."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Isaiah 7:14',
    explanation: 'Therefore the Lord himself will give you a sign: The virgin will conceive and give birth to a son, and will call him Immanuel.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Isaiah 9:6
  {
    id: 'mem_enhanced_114',
    question: 'Complete this verse: "For to us a child is born, to us a son is given, and the government will be on his shoulders. And he will be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Isaiah 9:6',
    explanation: 'For to us a child is born, to us a son is given, and the government will be on his shoulders. And he will be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Ezekiel 36:26
  {
    id: 'mem_enhanced_115',
    question: 'Complete this verse: "I will give you a new heart and put a new spirit in you; I will remove from you your heart of stone and give you a heart of flesh."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Ezekiel 36:26',
    explanation: 'I will give you a new heart and put a new spirit in you; I will remove from you your heart of stone and give you a heart of flesh.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Zechariah 1:3
  {
    id: 'mem_enhanced_116',
    question: 'Complete this verse: "Return to me, declares the Lord Almighty, and I will return to you."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Zechariah 1:3',
    explanation: 'Therefore tell the people: This is what the Lord Almighty says: "Return to me," declares the Lord Almighty, "and I will return to you," says the Lord Almighty.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Nahum 1:7
  {
    id: 'mem_enhanced_117',
    question: 'Complete this verse: "The Lord is good, a refuge in times of trouble. He cares for those who trust in him."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Nahum 1:7',
    explanation: 'The Lord is good, a refuge in times of trouble. He cares for those who trust in him.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Micah 6:8
  {
    id: 'mem_enhanced_118',
    question: 'Complete this verse: "He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Micah 6:8',
    explanation: 'He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God.',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Isaiah 58:6
  {
    id: 'mem_enhanced_119',
    question: 'Complete this verse: "Is not this the kind of fasting I have chosen: to loose the chains of injustice and untie the cords of the yoke, to set the oppressed free and break every yoke?"',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Isaiah 58:6',
    explanation: 'Is not this the kind of fasting I have chosen: to loose the chains of injustice and untie the cords of the yoke, to set the oppressed free and break every yoke?',
    testament: 'old',
    category: 'memorization',
    difficulty: 'medium'
  },


  // ==================== THE EARLY CHURCH (ACTS) ====================


  // Acts 2:38
  {
    id: 'mem_enhanced_122',
    question: 'Complete this verse: "Peter replied, \'Repent and be baptized, every one of you, in the name of Jesus Christ for the forgiveness of your sins. And you will receive the gift of the Holy Spirit.\'"',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Acts 2:38',
    explanation: 'Peter replied, "Repent and be baptized, every one of you, in the name of Jesus Christ for the forgiveness of your sins. And you will receive the gift of the Holy Spirit."',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Acts 4:12
  {
    id: 'mem_enhanced_123',
    question: 'Complete this verse: "Salvation is found in no one else, for there is no other name under heaven given to mankind by which we must be saved."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Acts 4:12',
    explanation: 'Salvation is found in no one else, for there is no other name under heaven given to mankind by which we must be saved.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Acts 7:55
  {
    id: 'mem_enhanced_124',
    question: 'Complete this verse: "But Stephen, full of the Holy Spirit, looked up to heaven and saw the glory of God, and Jesus standing at the right hand of God."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Acts 7:55',
    explanation: 'But Stephen, full of the Holy Spirit, looked up to heaven and saw the glory of God, and Jesus standing at the right hand of God.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Acts 8:35
  {
    id: 'mem_enhanced_125',
    question: 'Complete this verse: "Then Philip began with that very passage of Scripture and told him the good news about Jesus."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Acts 8:35',
    explanation: 'Then Philip began with that very passage of Scripture and told him the good news about Jesus.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Acts 9:17
  {
    id: 'mem_enhanced_126',
    question: 'Complete this verse: "Then Ananias went to the house and entered it. Placing his hands on Saul, he said, \'Brother Saul, the Lord—Jesus, who appeared to you on the road as you were coming here—has sent me so that you may see again and be filled with the Holy Spirit.\'"',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Acts 9:17',
    explanation: 'Then Ananias went to the house and entered it. Placing his hands on Saul, he said, "Brother Saul, the Lord—Jesus, who appeared to you on the road as you were coming here—has sent me so that you may see again and be filled with the Holy Spirit."',
    testament: 'new',
    category: 'memorization',
    difficulty: 'hard'
  },

  // Acts 10:34-35
  {
    id: 'mem_enhanced_127',
    question: 'Complete this verse: "Peter began to speak: \'I now realize how true it is that God does not show favoritism but accepts from every nation the one who fears him and does what is right.\'"',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Acts 10:34-35',
    explanation: 'Then Peter began to speak: "I now realize how true it is that God does not show favoritism but accepts from every nation the one who fears him and does what is right."',
    testament: 'new',
    category: 'memorization',
    difficulty: 'hard'
  },

  // Acts 16:29-31
  {
    id: 'mem_enhanced_128',
    question: 'Complete this verse: "The jailer called for lights, rushed in and fell trembling before Paul and Silas. He then brought them out and asked, \'Sirs, what must I do to be saved?\' They replied, \'Believe in the Lord Jesus, and you will be saved—you and your household.\'"',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Acts 16:29-31',
    explanation: 'The jailer called for lights, rushed in and fell trembling before Paul and Silas. He then brought them out and asked, "Sirs, what must I do to be saved?" They replied, "Believe in the Lord Jesus, and you will be saved—you and your household."',
    testament: 'new',
    category: 'memorization',
    difficulty: 'hard'
  },

  // Acts 17:28
  {
    id: 'mem_enhanced_129',
    question: 'Complete this verse: "For in him we live and move and have our being."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Acts 17:28',
    explanation: '"For in him we live and move and have our being." As some of your own poets have said, "We are his offspring."',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Acts 20:28
  {
    id: 'mem_enhanced_130',
    question: 'Complete this verse: "Keep watch over yourselves and all the flock of which the Holy Spirit has made you overseers. Be shepherds of the church of God, which he bought with his own blood."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Acts 20:28',
    explanation: 'Keep watch over yourselves and all the flock of which the Holy Spirit has made you overseers. Be shepherds of the church of God, which he bought with his own blood.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // ==================== COMMANDS AND EXHORTATIONS ====================


  // Colossians 3:12
  {
    id: 'mem_enhanced_132',
    question: 'Complete this verse: "Therefore, as God\'s chosen people, holy and dearly loved, clothe yourselves with compassion, kindness, humility, gentleness and patience."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Colossians 3:12',
    explanation: 'Therefore, as God\'s chosen people, holy and dearly loved, clothe yourselves with compassion, kindness, humility, gentleness and patience.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },


  // Romans 12:15
  {
    id: 'mem_enhanced_134',
    question: 'Complete this verse: "Rejoice with those who rejoice; mourn with those who mourn."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Romans 12:15',
    explanation: 'Rejoice with those who rejoice; mourn with those who mourn.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'easy'
  },

  // Ephesians 4:29
  {
    id: 'mem_enhanced_135',
    question: 'Complete this verse: "Do not let any unwholesome talk come out of your mouths, but only what is helpful for building others up according to their needs, that it may benefit those who listen."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Ephesians 4:29',
    explanation: 'Do not let any unwholesome talk come out of your mouths, but only what is helpful for building others up according to their needs, that it may benefit those who listen.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'hard'
  },

  // Ephesians 5:21
  {
    id: 'mem_enhanced_136',
    question: 'Complete this verse: "Submit to one another out of reverence for Christ."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Ephesians 5:21',
    explanation: 'Submit to one another out of reverence for Christ.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Ephesians 5:25
  {
    id: 'mem_enhanced_137',
    question: 'Complete this verse: "Husbands, love your wives, just as Christ loved the church and gave himself up for her."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Ephesians 5:25',
    explanation: 'Husbands, love your wives, just as Christ loved the church and gave himself up for her.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Ephesians 6:1
  {
    id: 'mem_enhanced_138',
    question: 'Complete this verse: "Children, obey your parents in the Lord, for this is right."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Ephesians 6:1',
    explanation: 'Children, obey your parents in the Lord, for this is right.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'easy'
  },

  // Ephesians 6:4
  {
    id: 'mem_enhanced_139',
    question: 'Complete this verse: "Fathers, do not exasperate your children; instead, bring them up in the training and instruction of the Lord."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Ephesians 6:4',
    explanation: 'Fathers, do not exasperate your children; instead, bring them up in the training and instruction of the Lord.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // 1 Peter 5:8
  {
    id: 'mem_enhanced_140',
    question: 'Complete this verse: "Be alert and of sober mind. Your enemy the devil prowls around like a roaring lion looking for someone to devour."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: '1 Peter 5:8',
    explanation: 'Be alert and of sober mind. Your enemy the devil prowls around like a roaring lion looking for someone to devour.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // ==================== FOUNDATIONAL TRUTHS ====================

  // John 1:1
  {
    id: 'mem_enhanced_141',
    question: 'Complete this verse: "In the beginning was the Word, and the Word was with God, and the Word was God."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'John 1:1',
    explanation: 'In the beginning was the Word, and the Word was with God, and the Word was God.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Hebrews 4:12
  {
    id: 'mem_enhanced_142',
    question: 'Complete this verse: "For the word of God is alive and active. Sharper than any double-edged sword, it penetrates even to dividing soul and spirit, joints and marrow; it judges the thoughts and attitudes of the heart."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Hebrews 4:12',
    explanation: 'For the word of God is alive and active. Sharper than any double-edged sword, it penetrates even to dividing soul and spirit, joints and marrow; it judges the thoughts and attitudes of the heart.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'hard'
  },

  // 2 Timothy 3:16
  {
    id: 'mem_enhanced_143',
    question: 'Complete this verse: "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: '2 Timothy 3:16',
    explanation: 'All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Hebrews 13:8
  {
    id: 'mem_enhanced_144',
    question: 'Complete this verse: "Jesus Christ is the same yesterday and today and forever."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Hebrews 13:8',
    explanation: 'Jesus Christ is the same yesterday and today and forever.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'easy'
  },

  // Ephesians 4:4-6
  {
    id: 'mem_enhanced_145',
    question: 'Complete this verse: "There is one body and one Spirit, just as you were called to one hope when you were called; one Lord, one faith, one baptism; one God and Father of all, who is over all and through all and in all."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Ephesians 4:4-6',
    explanation: 'There is one body and one Spirit, just as you were called to one hope when you were called; one Lord, one faith, one baptism; one God and Father of all, who is over all and through all and in all.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'hard'
  },

  // 1 Peter 2:9
  {
    id: 'mem_enhanced_146',
    question: 'Complete this verse: "But you are a chosen people, a royal priesthood, a holy nation, God\'s special possession, that you may declare the praises of him who called you out of darkness into his wonderful light."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: '1 Peter 2:9',
    explanation: 'But you are a chosen people, a royal priesthood, a holy nation, God\'s special possession, that you may declare the praises of him who called you out of darkness into his wonderful light.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'hard'
  },

  // Ephesians 6:12
  {
    id: 'mem_enhanced_147',
    question: 'Complete this verse: "For our struggle is not against flesh and blood, but against the rulers, against the authorities, against the powers of this dark world and against the spiritual forces of evil in the heavenly realms."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Ephesians 6:12',
    explanation: 'For our struggle is not against flesh and blood, but against the rulers, against the authorities, against the powers of this dark world and against the spiritual forces of evil in the heavenly realms.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'hard'
  },

  // 2 Thessalonians 3:3
  {
    id: 'mem_enhanced_148',
    question: 'Complete this verse: "But the Lord is faithful, and he will strengthen you and protect you from the evil one."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: '2 Thessalonians 3:3',
    explanation: 'But the Lord is faithful, and he will strengthen you and protect you from the evil one.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // 1 John 3:1
  {
    id: 'mem_enhanced_149',
    question: 'Complete this verse: "See what great love the Father has lavished on us, that we should be called children of God! And that is what we are!"',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: '1 John 3:1',
    explanation: 'See what great love the Father has lavished on us, that we should be called children of God! And that is what we are!',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  },

  // Revelation 22:20-21
  {
    id: 'mem_enhanced_150',
    question: 'Complete this verse: "He who testifies to these things says, \'Yes, I am coming soon.\' Amen. Come, Lord Jesus. The grace of the Lord Jesus be with God\'s people. Amen."',
    options: ['This is a complete verse', 'The verse continues', 'There is no completion needed', 'This is the full text'],
    correctAnswer: 0,
    verse: 'Revelation 22:20-21',
    explanation: 'He who testifies to these things says, "Yes, I am coming soon." Amen. Come, Lord Jesus. The grace of the Lord Jesus be with God\'s people. Amen.',
    testament: 'new',
    category: 'memorization',
    difficulty: 'medium'
  }
];

// Helper functions for the enhanced memorization questions
export const getEnhancedMemorizationQuestions = (): MemorizationQuestion[] => {
  return ENHANCED_MEMORIZATION_QUESTIONS;
};

export const getEnhancedQuestionsByDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): MemorizationQuestion[] => {
  return ENHANCED_MEMORIZATION_QUESTIONS.filter(q => q.difficulty === difficulty);
};

export const getEnhancedQuestionsByTestament = (testament: 'old' | 'new'): MemorizationQuestion[] => {
  return ENHANCED_MEMORIZATION_QUESTIONS.filter(q => q.testament === testament);
};

export const getRandomEnhancedQuestions = (
  count: number,
  filters?: {
    difficulty?: 'easy' | 'medium' | 'hard';
    testament?: 'old' | 'new';
  }
): MemorizationQuestion[] => {
  let questions = [...ENHANCED_MEMORIZATION_QUESTIONS];

  if (filters) {
    if (filters.difficulty) {
      questions = questions.filter(q => q.difficulty === filters.difficulty);
    }
    if (filters.testament) {
      questions = questions.filter(q => q.testament === filters.testament);
    }
  }

  // Shuffle and return requested count
  const shuffled = questions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};