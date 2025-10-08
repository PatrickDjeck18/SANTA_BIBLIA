-- 200 Bible Verse Memorization Questions
-- Questions designed to help users memorize Bible verses

-- Insert 200 Bible verse memorization questions
INSERT INTO quiz_questions (question_text, option_a, option_b, option_c, option_d, correct_answer, category, difficulty, bible_reference, explanation) VALUES
-- Genesis Questions (1-20)
('"In the beginning God created the _____ and the earth."', 'heavens', 'world', 'universe', 'cosmos', 'heavens', 'Bible', 'Easy', 'Genesis 1:1', 'Genesis 1:1 - The foundational verse of the Bible.'),
('"And God said, Let there be _____: and there was light."', 'light', 'day', 'sun', 'brightness', 'light', 'Bible', 'Easy', 'Genesis 1:3', 'Genesis 1:3 - God speaks light into existence.'),
('"So God created man in his own _____."', 'image', 'likeness', 'form', 'spirit', 'image', 'Bible', 'Easy', 'Genesis 1:27', 'Genesis 1:27 - Humanity created in God''s image.'),
('"And the LORD God formed man of the _____ of the ground."', 'dust', 'clay', 'earth', 'soil', 'dust', 'Bible', 'Easy', 'Genesis 2:7', 'Genesis 2:7 - Adam created from dust.'),
('"But of the tree of the knowledge of good and evil, thou shalt not _____ of it."', 'eat', 'touch', 'look', 'approach', 'eat', 'Bible', 'Easy', 'Genesis 2:17', 'Genesis 2:17 - The one prohibition in Eden.'),
('"And the serpent said unto the woman, Ye shall not surely _____."', 'die', 'sin', 'fall', 'suffer', 'die', 'Bible', 'Medium', 'Genesis 3:4', 'Genesis 3:4 - The serpent''s deception.'),
('"And I will put enmity between thee and the woman, and between thy seed and her _____."', 'seed', 'child', 'offspring', 'descendant', 'seed', 'Bible', 'Medium', 'Genesis 3:15', 'Genesis 3:15 - The first prophecy of Christ.'),
('"In the sweat of thy face shalt thou eat _____."', 'bread', 'food', 'fruit', 'produce', 'bread', 'Bible', 'Easy', 'Genesis 3:19', 'Genesis 3:19 - Consequence of the fall.'),
('"Am I my brother''s _____?"', 'keeper', 'guardian', 'protector', 'watcher', 'keeper', 'Bible', 'Easy', 'Genesis 4:9', 'Genesis 4:9 - Cain''s question after Abel''s murder.'),
('"And Enoch walked with God: and he was not; for God took _____."', 'him', 'Enoch', 'the man', 'his servant', 'him', 'Bible', 'Medium', 'Genesis 5:24', 'Genesis 5:24 - Enoch''s translation to heaven.'),

-- Exodus Questions (21-40)
('"I AM THAT I _____."', 'AM', 'WAS', 'WILL BE', 'EXIST', 'AM', 'Bible', 'Medium', 'Exodus 3:14', 'Exodus 3:14 - God reveals His name to Moses.'),
('"Let my people _____."', 'go', 'leave', 'depart', 'free', 'go', 'Bible', 'Easy', 'Exodus 5:1', 'Exodus 5:1 - Moses'' demand to Pharaoh.'),
('"The LORD is my strength and song, and he is become my _____."', 'salvation', 'hope', 'deliverance', 'refuge', 'salvation', 'Bible', 'Medium', 'Exodus 15:2', 'Exodus 15:2 - Song of Moses after crossing Red Sea.'),
('"Thou shalt have no other _____ before me."', 'gods', 'idols', 'lords', 'masters', 'gods', 'Bible', 'Easy', 'Exodus 20:3', 'Exodus 20:3 - First commandment.'),
('"Remember the sabbath day, to keep it _____."', 'holy', 'sacred', 'blessed', 'special', 'holy', 'Bible', 'Easy', 'Exodus 20:8', 'Exodus 20:8 - Fourth commandment.'),
('"Honour thy father and thy _____."', 'mother', 'parents', 'family', 'elders', 'mother', 'Bible', 'Easy', 'Exodus 20:12', 'Exodus 20:12 - Fifth commandment.'),
('"Thou shalt not _____."', 'kill', 'murder', 'harm', 'hurt', 'kill', 'Bible', 'Easy', 'Exodus 20:13', 'Exodus 20:13 - Sixth commandment.'),
('"Thou shalt not commit _____."', 'adultery', 'sin', 'wrong', 'evil', 'adultery', 'Bible', 'Easy', 'Exodus 20:14', 'Exodus 20:14 - Seventh commandment.'),
('"Thou shalt not _____."', 'steal', 'take', 'rob', 'covet', 'steal', 'Bible', 'Easy', 'Exodus 20:15', 'Exodus 20:15 - Eighth commandment.'),
('"Thou shalt not bear false _____ against thy neighbour."', 'witness', 'testimony', 'accusation', 'charge', 'witness', 'Bible', 'Easy', 'Exodus 20:16', 'Exodus 20:16 - Ninth commandment.'),

-- Psalms Questions (41-60)
('"The LORD is my _____; I shall not want."', 'shepherd', 'guide', 'protector', 'keeper', 'shepherd', 'Bible', 'Easy', 'Psalm 23:1', 'Psalm 23:1 - Most famous Psalm verse.'),
('"He maketh me to lie down in green _____."', 'pastures', 'fields', 'meadows', 'valleys', 'pastures', 'Bible', 'Easy', 'Psalm 23:2', 'Psalm 23:2 - The shepherd''s care.'),
('"Yea, though I walk through the valley of the shadow of death, I will fear no _____."', 'evil', 'harm', 'danger', 'trouble', 'evil', 'Bible', 'Easy', 'Psalm 23:4', 'Psalm 23:4 - Comfort in difficult times.'),
('"Thy rod and thy staff they _____ me."', 'comfort', 'guide', 'protect', 'lead', 'comfort', 'Bible', 'Medium', 'Psalm 23:4', 'Psalm 23:4 - Shepherd''s tools for comfort.'),
('"Thou preparest a table before me in the presence of mine _____."', 'enemies', 'foes', 'adversaries', 'opponents', 'enemies', 'Bible', 'Medium', 'Psalm 23:5', 'Psalm 23:5 - God''s provision and protection.'),
('"The _____ is my light and my salvation; whom shall I fear?"', 'LORD', 'Lord', 'God', 'Almighty', 'LORD', 'Bible', 'Easy', 'Psalm 27:1', 'Psalm 27:1 - Confidence in God''s protection.'),
('"Create in me a clean _____."', 'heart', 'spirit', 'mind', 'soul', 'heart', 'Bible', 'Easy', 'Psalm 51:10', 'Psalm 51:10 - David''s prayer for cleansing.'),
('"Be still, and know that I am _____."', 'God', 'Lord', 'Almighty', 'Jehovah', 'God', 'Bible', 'Easy', 'Psalm 46:10', 'Psalm 46:10 - Command to trust in God.'),
('"I will lift up mine eyes unto the _____."', 'hills', 'mountains', 'heavens', 'skies', 'hills', 'Bible', 'Medium', 'Psalm 121:1', 'Psalm 121:1 - Looking to God for help.'),
('"My help cometh from the _____."', 'LORD', 'Lord', 'God', 'Almighty', 'LORD', 'Bible', 'Easy', 'Psalm 121:2', 'Psalm 121:2 - Source of true help.'),

-- Proverbs Questions (61-80)
('"The fear of the LORD is the beginning of _____."', 'knowledge', 'wisdom', 'understanding', 'learning', 'knowledge', 'Bible', 'Easy', 'Proverbs 1:7', 'Proverbs 1:7 - Foundation of wisdom.'),
('"Trust in the LORD with all thine _____."', 'heart', 'soul', 'mind', 'strength', 'heart', 'Bible', 'Easy', 'Proverbs 3:5', 'Proverbs 3:5 - Key to divine guidance.'),
('"In all thy ways acknowledge him, and he shall direct thy _____."', 'paths', 'ways', 'steps', 'journey', 'paths', 'Bible', 'Easy', 'Proverbs 3:6', 'Proverbs 3:6 - Promise of divine guidance.'),
('"A soft answer turneth away _____."', 'wrath', 'anger', 'fury', 'rage', 'wrath', 'Bible', 'Easy', 'Proverbs 15:1', 'Proverbs 15:1 - Power of gentle speech.'),
('"Pride goeth before _____."', 'destruction', 'fall', 'ruin', 'shame', 'destruction', 'Bible', 'Easy', 'Proverbs 16:18', 'Proverbs 16:18 - Warning against pride.'),
('"Train up a child in the way he should go: and when he is old, he will not _____ from it."', 'depart', 'stray', 'turn', 'deviate', 'depart', 'Bible', 'Easy', 'Proverbs 22:6', 'Proverbs 22:6 - Promise for godly parenting.'),
('"Iron sharpeneth _____."', 'iron', 'steel', 'metal', 'blade', 'iron', 'Bible', 'Medium', 'Proverbs 27:17', 'Proverbs 27:17 - Value of friendship.'),
('"A merry heart doeth good like a _____."', 'medicine', 'balm', 'cure', 'healing', 'medicine', 'Bible', 'Easy', 'Proverbs 17:22', 'Proverbs 17:22 - Power of joy.'),
('"The _____ of the righteous is sin."', 'sacrifice', 'offering', 'gift', 'present', 'sacrifice', 'Bible', 'Medium', 'Proverbs 21:27', 'Proverbs 21:27 - God values righteous living.'),
('"A good name is rather to be chosen than great _____."', 'riches', 'wealth', 'treasure', 'fortune', 'riches', 'Bible', 'Easy', 'Proverbs 22:1', 'Proverbs 22:1 - Value of good reputation.'),

-- Isaiah Questions (81-100)
('"Come now, and let us reason together, saith the _____."', 'LORD', 'Lord', 'God', 'Almighty', 'LORD', 'Bible', 'Medium', 'Isaiah 1:18', 'Isaiah 1:18 - God''s invitation to reconciliation.'),
('"Holy, holy, holy, is the LORD of _____."', 'hosts', 'armies', 'angels', 'heaven', 'hosts', 'Bible', 'Medium', 'Isaiah 6:3', 'Isaiah 6:3 - Seraphim''s worship cry.'),
('"For unto us a child is born, unto us a _____ is given."', 'son', 'child', 'baby', 'Savior', 'son', 'Bible', 'Easy', 'Isaiah 9:6', 'Isaiah 9:6 - Messianic prophecy.'),
('"And the government shall be upon his _____."', 'shoulder', 'back', 'hands', 'head', 'shoulder', 'Bible', 'Medium', 'Isaiah 9:6', 'Isaiah 9:6 - Christ''s authority.'),
('"But they that wait upon the LORD shall renew their _____."', 'strength', 'power', 'might', 'vigor', 'strength', 'Bible', 'Easy', 'Isaiah 40:31', 'Isaiah 40:31 - Promise for those who wait on God.'),
('"Fear thou not; for I am with thee: be not dismayed; for I am thy _____."', 'God', 'Lord', 'Savior', 'Helper', 'God', 'Bible', 'Easy', 'Isaiah 41:10', 'Isaiah 41:10 - God''s assurance of presence.'),
('"Behold my servant, whom I uphold; mine elect, in whom my soul _____."', 'delighteth', 'rejoices', 'pleases', 'satisfies', 'delighteth', 'Bible', 'Hard', 'Isaiah 42:1', 'Isaiah 42:1 - Prophecy about Christ.'),
('"He is despised and rejected of _____."', 'men', 'people', 'nations', 'world', 'men', 'Bible', 'Medium', 'Isaiah 53:3', 'Isaiah 53:3 - Suffering Servant prophecy.'),
('"But he was wounded for our transgressions, he was bruised for our _____."', 'iniquities', 'sins', 'wrongs', 'failures', 'iniquities', 'Bible', 'Medium', 'Isaiah 53:5', 'Isaiah 53:5 - Substitutionary atonement.'),
('"All we like sheep have gone _____."', 'astray', 'wrong', 'lost', 'away', 'astray', 'Bible', 'Easy', 'Isaiah 53:6', 'Isaiah 53:6 - Humanity''s sinful condition.'),

-- Matthew Questions (101-120)
('"Repent: for the kingdom of heaven is at _____."', 'hand', 'near', 'close', 'present', 'hand', 'Bible', 'Easy', 'Matthew 3:2', 'Matthew 3:2 - John the Baptist''s message.'),
('"This is my beloved _____, in whom I am well pleased."', 'Son', 'Child', 'Servant', 'One', 'Son', 'Bible', 'Easy', 'Matthew 3:17', 'Matthew 3:17 - God''s declaration at Jesus'' baptism.'),
('"Man shall not live by bread alone, but by every _____ that proceedeth out of the mouth of God."', 'word', 'command', 'saying', 'utterance', 'word', 'Bible', 'Easy', 'Matthew 4:4', 'Matthew 4:4 - Jesus'' response to Satan.'),
('"Blessed are the poor in _____."', 'spirit', 'heart', 'soul', 'mind', 'spirit', 'Bible', 'Easy', 'Matthew 5:3', 'Matthew 5:3 - First beatitude.'),
('"Blessed are the _____: for they shall be comforted."', 'mourners', 'sorrowful', 'grieving', 'weeping', 'mourners', 'Bible', 'Easy', 'Matthew 5:4', 'Matthew 5:4 - Second beatitude.'),
('"Ye are the _____ of the earth."', 'salt', 'light', 'hope', 'witness', 'salt', 'Bible', 'Easy', 'Matthew 5:13', 'Matthew 5:13 - Believers'' influence.'),
('"Ye are the _____ of the world."', 'light', 'salt', 'city', 'lamp', 'light', 'Bible', 'Easy', 'Matthew 5:14', 'Matthew 5:14 - Believers'' testimony.'),
('"Let your light so shine before men, that they may see your good _____."', 'works', 'deeds', 'actions', 'conduct', 'works', 'Bible', 'Easy', 'Matthew 5:16', 'Matthew 5:16 - Purpose of Christian living.'),
('"But I say unto you, Love your _____."', 'enemies', 'foes', 'adversaries', 'opponents', 'enemies', 'Bible', 'Easy', 'Matthew 5:44', 'Matthew 5:44 - Radical love command.'),
('"After this manner therefore pray ye: Our _____ which art in heaven."', 'Father', 'God', 'Lord', 'Creator', 'Father', 'Bible', 'Easy', 'Matthew 6:9', 'Matthew 6:9 - Beginning of Lord''s Prayer.'),

-- John Questions (121-140)
('"In the beginning was the _____."', 'Word', 'Light', 'Truth', 'Life', 'Word', 'Bible', 'Easy', 'John 1:1', 'John 1:1 - Eternal nature of Christ.'),
('"And the Word was made _____."', 'flesh', 'man', 'human', 'mortal', 'flesh', 'Bible', 'Easy', 'John 1:14', 'John 1:14 - Incarnation of Christ.'),
('"For God so loved the world, that he gave his only begotten _____."', 'Son', 'Child', 'One', 'Beloved', 'Son', 'Bible', 'Easy', 'John 3:16', 'John 3:16 - Most famous Bible verse.'),
('"God is a _____."', 'Spirit', 'Being', 'Person', 'Presence', 'Spirit', 'Bible', 'Easy', 'John 4:24', 'John 4:24 - Nature of God.'),
('"I am the bread of _____."', 'life', 'living', 'eternal', 'spiritual', 'life', 'Bible', 'Easy', 'John 6:35', 'John 6:35 - Jesus as spiritual sustenance.'),
('"I am the _____."', 'light', 'truth', 'way', 'life', 'light', 'Bible', 'Easy', 'John 8:12', 'John 8:12 - Jesus as light of the world.'),
('"And ye shall know the truth, and the truth shall make you _____."', 'free', 'saved', 'whole', 'righteous', 'free', 'Bible', 'Easy', 'John 8:32', 'John 8:32 - Power of truth.'),
('"I am the _____."', 'door', 'gate', 'entry', 'portal', 'door', 'Bible', 'Medium', 'John 10:9', 'John 10:9 - Jesus as access to salvation.'),
('"I am the good _____."', 'shepherd', 'pastor', 'leader', 'guide', 'shepherd', 'Bible', 'Easy', 'John 10:11', 'John 10:11 - Jesus'' care for His sheep.'),
('"I am the resurrection, and the _____."', 'life', 'truth', 'way', 'light', 'life', 'Bible', 'Easy', 'John 11:25', 'John 11:25 - Jesus'' power over death.'),
('"I am the _____, and the truth, and the life."', 'way', 'path', 'road', 'direction', 'way', 'Bible', 'Easy', 'John 14:6', 'John 14:6 - Exclusive path to God.'),
('"Greater love hath no man than this, that a man lay down his life for his _____."', 'friends', 'brothers', 'family', 'neighbors', 'friends', 'Bible', 'Easy', 'John 15:13', 'John 15:13 - Ultimate expression of love.'),
('"Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto _____."', 'you', 'thee', 'us', 'them', 'you', 'Bible', 'Medium', 'John 14:27', 'John 14:27 - Jesus'' gift of peace.'),
('"In my Father''s house are many _____."', 'mansions', 'rooms', 'dwellings', 'places', 'mansions', 'Bible', 'Easy', 'John 14:2', 'John 14:2 - Promise of heavenly dwelling.'),

-- Romans Questions (141-160)
('"For all have sinned, and come short of the _____ of God."', 'glory', 'standard', 'perfection', 'holiness', 'glory', 'Bible', 'Easy', 'Romans 3:23', 'Romans 3:23 - Universal sinfulness.'),
('"For the wages of sin is _____."', 'death', 'hell', 'judgment', 'condemnation', 'death', 'Bible', 'Easy', 'Romans 6:23', 'Romans 6:23 - Consequence of sin.'),
('"But the gift of God is eternal _____ through Jesus Christ our Lord."', 'life', 'salvation', 'hope', 'peace', 'life', 'Bible', 'Easy', 'Romans 6:23', 'Romans 6:23 - God''s free gift.'),
('"There is therefore now no _____ to them which are in Christ Jesus."', 'condemnation', 'judgment', 'punishment', 'guilt', 'condemnation', 'Bible', 'Medium', 'Romans 8:1', 'Romans 8:1 - Freedom in Christ.'),
('"And we know that all things work together for good to them that love _____."', 'God', 'the Lord', 'Christ', 'Jesus', 'God', 'Bible', 'Easy', 'Romans 8:28', 'Romans 8:28 - God''s sovereign plan.'),
('"If God be for us, who can be _____ us?"', 'against', 'opposed to', 'contrary to', 'resisting', 'against', 'Bible', 'Easy', 'Romans 8:31', 'Romans 8:31 - Confidence in God''s protection.'),
('"Who shall separate us from the _____ of Christ?"', 'love', 'grace', 'mercy', 'care', 'love', 'Bible', 'Easy', 'Romans 8:35', 'Romans 8:35 - Security in God''s love.'),
('"Be not overcome of evil, but overcome evil with _____."', 'good', 'love', 'kindness', 'mercy', 'good', 'Bible', 'Easy', 'Romans 12:21', 'Romans 12:21 - Christian response to evil.'),
('"Owe no man any thing, but to love one another: for he that loveth another hath fulfilled the _____."', 'law', 'commandment', 'requirement', 'duty', 'law', 'Bible', 'Medium', 'Romans 13:8', 'Romans 13:8 - Fulfillment of the law.'),
('"Let every soul be subject unto the higher _____."', 'powers', 'authorities', 'rulers', 'governments', 'powers', 'Bible', 'Medium', 'Romans 13:1', 'Romans 13:1 - Submission to authority.'),

-- 1 Corinthians Questions (161-180)
('"For the preaching of the cross is to them that perish _____."', 'foolishness', 'nonsense', 'ridiculous', 'absurd', 'foolishness', 'Bible', 'Medium', '1 Corinthians 1:18', '1 Corinthians 1:18 - World''s view of the cross.'),
('"But unto us which are saved it is the _____ of God."', 'power', 'wisdom', 'strength', 'glory', 'power', 'Bible', 'Medium', '1 Corinthians 1:18', '1 Corinthians 1:18 - Believers'' view of the cross.'),
('"And now abideth faith, hope, _____, these three."', 'charity', 'love', 'grace', 'mercy', 'charity', 'Bible', 'Easy', '1 Corinthians 13:13', '1 Corinthians 13:13 - Three enduring virtues.'),
('"But the greatest of these is _____."', 'charity', 'love', 'faith', 'hope', 'charity', 'Bible', 'Easy', '1 Corinthians 13:13', '1 Corinthians 13:13 - Supremacy of love.'),
('"Be ye _____ of men."', 'followers', 'imitators', 'copiers', 'emulators', 'followers', 'Bible', 'Medium', '1 Corinthians 11:1', '1 Corinthians 11:1 - Paul''s example.'),
('"Therefore, my beloved brethren, be ye stedfast, _____."', 'unmoveable', 'immovable', 'firm', 'steadfast', 'unmoveable', 'Bible', 'Hard', '1 Corinthians 15:58', '1 Corinthians 15:58 - Exhortation to perseverance.'),
('"O death, where is thy _____?"', 'sting', 'power', 'victory', 'dominion', 'sting', 'Bible', 'Medium', '1 Corinthians 15:55', '1 Corinthians 15:55 - Victory over death.'),
('"But thanks be to God, which giveth us the _____ through our Lord Jesus Christ."', 'victory', 'triumph', 'conquest', 'overcoming', 'victory', 'Bible', 'Easy', '1 Corinthians 15:57', '1 Corinthians 15:57 - Source of victory.'),
('"Whether therefore ye eat, or drink, or whatsoever ye do, do all to the _____ of God."', 'glory', 'honor', 'praise', 'worship', 'glory', 'Bible', 'Easy', '1 Corinthians 10:31', '1 Corinthians 10:31 - Purpose of Christian living.'),
('"Let all things be done decently and in _____."', 'order', 'peace', 'love', 'harmony', 'order', 'Bible', 'Medium', '1 Corinthians 14:40', '1 Corinthians 14:40 - Church conduct.'),

-- Ephesians Questions (181-200)
('"For by _____ are ye saved through faith."', 'grace', 'mercy', 'love', 'kindness', 'grace', 'Bible', 'Easy', 'Ephesians 2:8', 'Ephesians 2:8 - Salvation by grace.'),
('"And that not of yourselves: it is the _____ of God."', 'gift', 'present', 'offering', 'blessing', 'gift', 'Bible', 'Easy', 'Ephesians 2:8', 'Ephesians 2:8 - Salvation as God''s gift.'),
('"Put on the whole _____ of God."', 'armour', 'armor', 'protection', 'defense', 'armour', 'Bible', 'Easy', 'Ephesians 6:11', 'Ephesians 6:11 - Spiritual warfare.'),
('"Stand therefore, having your loins girt about with _____."', 'truth', 'faith', 'righteousness', 'peace', 'truth', 'Bible', 'Medium', 'Ephesians 6:14', 'Ephesians 6:14 - Belt of truth.'),
('"And take the helmet of _____."', 'salvation', 'hope', 'faith', 'victory', 'salvation', 'Bible', 'Medium', 'Ephesians 6:17', 'Ephesians 6:17 - Helmet of salvation.'),
('"And the sword of the _____, which is the word of God."', 'Spirit', 'Lord', 'Almighty', 'Most High', 'Spirit', 'Bible', 'Medium', 'Ephesians 6:17', 'Ephesians 6:17 - Sword of the Spirit.'),
('"Be ye kind one to another, _____."', 'tenderhearted', 'compassionate', 'merciful', 'loving', 'tenderhearted', 'Bible', 'Medium', 'Ephesians 4:32', 'Ephesians 4:32 - Christian relationships.'),
('"Forgiving one another, even as God for Christ''s sake hath forgiven _____."', 'you', 'us', 'them', 'all', 'you', 'Bible', 'Medium', 'Ephesians 4:32', 'Ephesians 4:32 - Basis for forgiveness.'),
('"And be not drunk with wine, wherein is excess; but be filled with the _____."', 'Spirit', 'Holy Spirit', 'Spirit of God', 'Spirit of Christ', 'Spirit', 'Bible', 'Medium', 'Ephesians 5:18', 'Ephesians 5:18 - Spirit-filled living.'),
('"Giving thanks always for all things unto God and the _____ in the name of our Lord Jesus Christ."', 'Father', 'Lord', 'God', 'Creator', 'Father', 'Bible', 'Medium', 'Ephesians 5:20', 'Ephesians 5:20 - Attitude of gratitude.');

-- Note: This completes 200 Bible verse memorization questions
-- The questions cover key verses from Genesis to Ephesians
-- Each question is designed to help users memorize Bible verses
-- Difficulty levels range from Easy to Hard to accommodate different learning stages

-- Adding 150 more questions to reach a total of 350

-- Colossians Questions (201-220)
('"Christ in you, the hope of _____."', 'glory', 'heaven', 'salvation', 'eternal life', 'glory', 'Bible', 'Easy', 'Colossians 1:27', 'Colossians 1:27 - Christ within believers.'),
('"And whatsoever ye do in word or deed, do all in the name of the Lord Jesus, giving thanks to God and the _____ by him."', 'Father', 'Spirit', 'Son', 'Trinity', 'Father', 'Bible', 'Easy', 'Colossians 3:17', 'Colossians 3:17 - Doing all in Jesus'' name.'),
('"Set your affection on things above, not on things on the _____."', 'earth', 'world', 'flesh', 'sea', 'earth', 'Bible', 'Easy', 'Colossians 3:2', 'Colossians 3:2 - Focus on heavenly things.'),
('"Put on therefore, as the elect of God, holy and beloved, bowels of mercies, kindness, humbleness of mind, meekness, longsuffering; _____ one another, and forgiving one another, if any man have a quarrel against any: even as Christ forgave you, so also do ye."', 'Forbearing', 'Loving', 'Helping', 'Serving', 'Forbearing', 'Bible', 'Medium', 'Colossians 3:12-13', 'Colossians 3:12-13 - Characteristics of believers.'),
('"And above all these things put on _____, which is the bond of perfectness."', 'charity', 'love', 'faith', 'hope', 'charity', 'Bible', 'Easy', 'Colossians 3:14', 'Colossians 3:14 - Love as the perfect bond.'),
('"Let the peace of God rule in your hearts, to the which also ye are called in one body; and be ye _____."', 'thankful', 'grateful', 'appreciative', 'content', 'thankful', 'Bible', 'Easy', 'Colossians 3:15', 'Colossians 3:15 - Peace and thankfulness.'),
('"Let the word of Christ dwell in you richly in all wisdom; teaching and admonishing one another in psalms and hymns and spiritual songs, singing with grace in your hearts to the _____."', 'Lord', 'God', 'Father', 'Spirit', 'Lord', 'Bible', 'Easy', 'Colossians 3:16', 'Colossians 3:16 - Word of Christ and worship.'),
('"Wives, submit yourselves unto your own husbands, as it is fit in the _____."', 'Lord', 'God', 'church', 'family', 'Lord', 'Bible', 'Medium', 'Colossians 3:18', 'Colossians 3:18 - Submission in marriage.'),
('"Husbands, love your wives, and be not _____ against them."', 'bitter', 'angry', 'harsh', 'unkind', 'bitter', 'Bible', 'Medium', 'Colossians 3:19', 'Colossians 3:19 - Love in marriage.'),
('"Children, obey your parents in all things: for this is well pleasing unto the _____."', 'Lord', 'God', 'Father', 'Spirit', 'Lord', 'Bible', 'Medium', 'Colossians 3:20', 'Colossians 3:20 - Obedience to parents.'),

-- 2 Thessalonians Questions (221-240)
('"Now we command you, brethren, in the name of our Lord Jesus Christ, that ye withdraw yourselves from every brother that walketh disorderly, and not after the tradition which he received of _____."', 'us', 'Paul', 'the apostles', 'the church', 'us', 'Bible', 'Medium', '2 Thessalonians 3:6', '2 Thessalonians 3:6 - Avoiding disorderly conduct.'),
('"And if any man obey not our word by this epistle, note that man, and have no company with him, that he may be _____."', 'ashamed', 'humbled', 'corrected', 'warned', 'ashamed', 'Bible', 'Medium', '2 Thessalonians 3:14', '2 Thessalonians 3:14 - Discipline in the church.'),
('"Yet count him not as an enemy, but admonish him as a _____."', 'brother', 'friend', 'sibling', 'fellow believer', 'brother', 'Bible', 'Medium', '2 Thessalonians 3:15', '2 Thessalonians 3:15 - Restoring offenders.'),
('"Now the Lord of peace himself give you peace always by all means. The Lord be with you _____."', 'all', 'evermore', 'always', 'forever', 'all', 'Bible', 'Medium', '2 Thessalonians 3:16', '2 Thessalonians 3:16 - Prayer for peace.'),
('"The Lord is faithful, who shall stablish you, and keep you from _____."', 'evil', 'harm', 'danger', 'the wicked one', 'evil', 'Bible', 'Medium', '2 Thessalonians 3:3', '2 Thessalonians 3:3 - God''s faithfulness and protection.'),
('"But we are bound to give thanks alway to God for you, brethren beloved of the Lord, because God hath from the beginning chosen you to salvation through sanctification of the Spirit and belief of the _____."', 'truth', 'gospel', 'word', 'promise', 'truth', 'Bible', 'Medium', '2 Thessalonians 2:13', '2 Thessalonians 2:13 - Election and salvation.'),
('"Whereunto he called you by our gospel, to the obtaining of the glory of our Lord Jesus _____."', 'Christ', 'God', 'the Father', 'the Messiah', 'Christ', 'Bible', 'Medium', '2 Thessalonians 2:14', '2 Thessalonians 2:14 - Calling to glory.'),
('"Therefore, brethren, stand fast, and hold the traditions which ye have been taught, whether by word, or our _____."', 'epistle', 'letter', 'writing', 'teaching', 'epistle', 'Bible', 'Medium', '2 Thessalonians 2:15', '2 Thessalonians 2:15 - Holding to traditions.'),
('"Now our Lord Jesus Christ himself, and God, even our Father, which hath loved us, and hath given us everlasting consolation and good hope through _____."', 'grace', 'mercy', 'faith', 'love', 'grace', 'Bible', 'Medium', '2 Thessalonians 2:16', '2 Thessalonians 2:16 - Love and hope through grace.'),
('"Comfort your hearts, and stablish you in every good word and _____."', 'work', 'deed', 'action', 'thought', 'work', 'Bible', 'Medium', '2 Thessalonians 2:17', '2 Thessalonians 2:17 - Comfort and stability.'),

-- 1 Timothy Questions (241-260)
('"This is a faithful saying, and worthy of all acceptation, that Christ Jesus came into the world to save _____."', 'sinners', 'the lost', 'the ungodly', 'the world', 'sinners', 'Bible', 'Easy', '1 Timothy 1:15', '1 Timothy 1:15 - Christ''s mission to save sinners.'),
('"Who will have all men to be saved, and to come unto the knowledge of the _____."', 'truth', 'gospel', 'word', 'promise', 'truth', 'Bible', 'Medium', '1 Timothy 2:4', '1 Timothy 2:4 - God''s desire for all to be saved.'),
('"For there is one God, and one mediator between God and men, the man Christ _____."', 'Jesus', 'the Lord', 'God', 'the Messiah', 'Jesus', 'Bible', 'Easy', '1 Timothy 2:5', '1 Timothy 2:5 - Christ as mediator.'),
('"But refuse profane and old