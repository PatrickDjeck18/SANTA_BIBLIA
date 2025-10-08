-- 200 Bible Verse Memorization Questions
-- Questions designed to help users memorize Bible verses

-- Drop table if exists to ensure clean state
DROP TABLE IF EXISTS quiz_questions CASCADE;

-- Create quiz_questions table
CREATE TABLE quiz_questions (
    id BIGSERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT,
    option_d TEXT,
    correct_answer TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Bible',
    difficulty TEXT NOT NULL DEFAULT 'Easy',
    bible_reference TEXT,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Admins can insert quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Admins can update quiz questions" ON quiz_questions;

-- Create RLS policies for quiz_questions (public read, admin write)
CREATE POLICY "Anyone can view quiz questions" ON quiz_questions
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert quiz questions" ON quiz_questions
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update quiz questions" ON quiz_questions
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

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
('"Giving thanks always for all things unto God and the _____ in the name of our Lord Jesus Christ."', 'Father', 'Lord', 'God', 'Creator', 'Father', 'Bible', 'Medium', 'Ephesians 5:20', 'Ephesians 5:20 - Attitude of gratitude.'),

-- Acts Questions (201-220)
('"And it shall come to pass in the last days, saith God, I will pour out of my _____ upon all flesh."', 'Spirit', 'Power', 'Grace', 'Love', 'Spirit', 'Bible', 'Medium', 'Acts 2:17', 'Acts 2:17 - Prophecy fulfilled at Pentecost.'),
('"Repent, and be baptized every one of you in the name of Jesus Christ for the _____ of sins."', 'remission', 'forgiveness', 'cleansing', 'washing', 'remission', 'Bible', 'Medium', 'Acts 2:38', 'Acts 2:38 - Peter''s call to repentance.'),
('"And they continued stedfastly in the apostles'' doctrine and fellowship, and in breaking of bread, and in _____."', 'prayers', 'worship', 'singing', 'praise', 'prayers', 'Bible', 'Medium', 'Acts 2:42', 'Acts 2:42 - Early church practices.'),
('"And the Lord added to the church daily such as should be _____."', 'saved', 'converted', 'redeemed', 'chosen', 'saved', 'Bible', 'Easy', 'Acts 2:47', 'Acts 2:47 - Church growth.'),
('"But Peter and John answered and said unto them, Whether it be right in the sight of God to hearken unto you more than unto _____."', 'God', 'Christ', 'Jesus', 'Lord', 'God', 'Bible', 'Medium', 'Acts 4:19', 'Acts 4:19 - Priority of obedience to God.'),
('"Neither is there salvation in any other: for there is none other _____ under heaven given among men."', 'name', 'way', 'path', 'door', 'name', 'Bible', 'Easy', 'Acts 4:12', 'Acts 4:12 - Exclusive salvation through Christ.'),
('"And daily in the temple, and in every house, they ceased not to teach and preach Jesus _____."', 'Christ', 'Lord', 'Savior', 'King', 'Christ', 'Bible', 'Medium', 'Acts 5:42', 'Acts 5:42 - Early church evangelism.'),
('"And the word of God increased; and the number of the disciples multiplied in Jerusalem greatly; and a great company of the priests were obedient to the _____."', 'faith', 'gospel', 'truth', 'word', 'faith', 'Bible', 'Medium', 'Acts 6:7', 'Acts 6:7 - Growth of the early church.'),
('"Then Philip went down to the city of Samaria, and preached _____ unto them."', 'Christ', 'Jesus', 'Lord', 'Savior', 'Christ', 'Bible', 'Easy', 'Acts 8:5', 'Acts 8:5 - Philip''s ministry in Samaria.'),
('"And as they went on their way, they came unto a certain water: and the eunuch said, See, here is water; what doth hinder me to be _____?"', 'baptized', 'saved', 'converted', 'cleansed', 'baptized', 'Bible', 'Medium', 'Acts 8:36', 'Acts 8:36 - Ethiopian eunuch''s conversion.'),

-- Philippians Questions (221-240)
('"Let this mind be in you, which was also in Christ _____."', 'Jesus', 'Lord', 'Savior', 'King', 'Jesus', 'Bible', 'Medium', 'Philippians 2:5', 'Philippians 2:5 - Mind of Christ.'),
('"Who, being in the form of God, thought it not robbery to be equal with _____."', 'God', 'the Father', 'the Almighty', 'the Creator', 'God', 'Bible', 'Medium', 'Philippians 2:6', 'Philippians 2:6 - Christ''s preexistence.'),
('"But made himself of no reputation, and took upon him the form of a _____."', 'servant', 'slave', 'bondservant', 'worker', 'servant', 'Bible', 'Medium', 'Philippians 2:7', 'Philippians 2:7 - Christ''s humility.'),
('"And being found in fashion as a man, he humbled himself, and became obedient unto _____."', 'death', 'suffering', 'pain', 'crucifixion', 'death', 'Bible', 'Medium', 'Philippians 2:8', 'Philippians 2:8 - Christ''s obedience.'),
('"Wherefore God also hath highly exalted him, and given him a name which is above every _____."', 'name', 'title', 'honor', 'position', 'name', 'Bible', 'Medium', 'Philippians 2:9', 'Philippians 2:9 - Christ''s exaltation.'),
('"That at the name of Jesus every knee should bow, of things in heaven, and things in earth, and things under the _____."', 'earth', 'ground', 'world', 'creation', 'earth', 'Bible', 'Medium', 'Philippians 2:10', 'Philippians 2:10 - Universal worship of Christ.'),
('"And that every tongue should confess that Jesus Christ is _____."', 'Lord', 'God', 'Savior', 'King', 'Lord', 'Bible', 'Easy', 'Philippians 2:11', 'Philippians 2:11 - Universal confession.'),
('"I can do all things through _____ which strengtheneth me."', 'Christ', 'God', 'Jesus', 'the Lord', 'Christ', 'Bible', 'Easy', 'Philippians 4:13', 'Philippians 4:13 - Strength in Christ.'),
('"But my God shall supply all your need according to his riches in glory by Christ _____."', 'Jesus', 'Lord', 'Savior', 'King', 'Jesus', 'Bible', 'Medium', 'Philippians 4:19', 'Philippians 4:19 - God''s provision.'),
('"Finally, brethren, whatsoever things are true, whatsoever things are honest, whatsoever things are just, whatsoever things are pure, whatsoever things are lovely, whatsoever things are of good report; if there be any virtue, and if there be any praise, think on these _____."', 'things', 'matters', 'subjects', 'topics', 'things', 'Bible', 'Medium', 'Philippians 4:8', 'Philippians 4:8 - Mindset of believers.'),

-- Colossians Questions (241-260)
('"For by him were all things created, that are in heaven, and that are in earth, visible and invisible, whether they be thrones, or dominions, or principalities, or powers: all things were created by him, and for _____."', 'him', 'God', 'the Father', 'the Creator', 'him', 'Bible', 'Hard', 'Colossians 1:16', 'Colossians 1:16 - Christ''s role in creation.'),
('"And he is the head of the body, the _____."', 'church', 'assembly', 'congregation', 'fellowship', 'church', 'Bible', 'Easy', 'Colossians 1:18', 'Colossians 1:18 - Christ''s headship.'),
('"In whom we have redemption through his blood, even the forgiveness of _____."', 'sins', 'transgressions', 'iniquities', 'wrongs', 'sins', 'Bible', 'Easy', 'Colossians 1:14', 'Colossians 1:14 - Redemption through Christ.'),
('"Let no man therefore judge you in meat, or in drink, or in respect of an holyday, or of the new moon, or of the sabbath days: Which are a shadow of things to _____."', 'come', 'pass', 'happen', 'occur', 'come', 'Bible', 'Medium', 'Colossians 2:16-17', 'Colossians 2:16-17 - Old Testament shadows.'),
('"If ye then be risen with Christ, seek those things which are _____."', 'above', 'heavenly', 'eternal', 'spiritual', 'above', 'Bible', 'Easy', 'Colossians 3:1', 'Colossians 3:1 - Focus on heavenly things.'),
('"Set your affection on things above, not on things on the _____."', 'earth', 'ground', 'world', 'land', 'earth', 'Bible', 'Easy', 'Colossians 3:2', 'Colossians 3:2 - Earthly vs heavenly focus.'),
('"Put on therefore, as the elect of God, holy and beloved, bowels of mercies, kindness, humbleness of mind, meekness, _____."', 'longsuffering', 'patience', 'endurance', 'tolerance', 'longsuffering', 'Bible', 'Medium', 'Colossians 3:12', 'Colossians 3:12 - Christian virtues.'),
('"And above all these things put on _____, which is the bond of perfectness."', 'charity', 'love', 'grace', 'mercy', 'charity', 'Bible', 'Easy', 'Colossians 3:14', 'Colossians 3:14 - Love as the perfect bond.'),
('"And whatsoever ye do in word or deed, do all in the name of the Lord Jesus, giving thanks to God and the Father by _____."', 'him', 'Jesus', 'Christ', 'the Lord', 'him', 'Bible', 'Medium', 'Colossians 3:17', 'Colossians 3:17 - Doing all for Christ.'),
('"Wives, submit yourselves unto your own husbands, as it is fit in the _____."', 'Lord', 'Bible', 'Scripture', 'Word', 'Lord', 'Bible', 'Easy', 'Colossians 3:18', 'Colossians 3:18 - Biblical marriage roles.'),

-- 1 Thessalonians Questions (261-280)
('"For the Lord himself shall descend from heaven with a shout, with the voice of the archangel, and with the trump of _____."', 'God', 'Heaven', 'the Lord', 'Christ', 'God', 'Bible', 'Medium', '1 Thessalonians 4:16', '1 Thessalonians 4:16 - Second coming of Christ.'),
('"Then we which are alive and remain shall be caught up together with them in the clouds, to meet the Lord in the air: and so shall we ever be with the _____."', 'Lord', 'Christ', 'Jesus', 'Savior', 'Lord', 'Bible', 'Medium', '1 Thessalonians 4:17', '1 Thessalonians 4:17 - Rapture of believers.'),
('"Wherefore comfort one another with these _____."', 'words', 'promises', 'truths', 'sayings', 'words', 'Bible', 'Easy', '1 Thessalonians 4:18', '1 Thessalonians 4:18 - Comfort in Christ''s return.'),
('"But of the times and the seasons, brethren, ye have no need that I write unto you. For yourselves know perfectly that the day of the Lord so cometh as a thief in the _____."', 'night', 'darkness', 'shadow', 'secret', 'night', 'Bible', 'Medium', '1 Thessalonians 5:1-2', '1 Thessalonians 5:1-2 - Unexpectedness of Christ''s return.'),
('"Therefore let us not sleep, as do others; but let us watch and be _____."', 'sober', 'alert', 'vigilant', 'awake', 'sober', 'Bible', 'Easy', '1 Thessalonians 5:6', '1 Thessalonians 5:6 - Christian watchfulness.'),
('"Pray without _____."', 'ceasing', 'stopping', 'ending', 'pausing', 'ceasing', 'Bible', 'Easy', '1 Thessalonians 5:17', '1 Thessalonians 5:17 - Continuous prayer.'),
('"Quench not the _____."', 'Spirit', 'Holy Spirit', 'fire', 'flame', 'Spirit', 'Bible', 'Easy', '1 Thessalonians 5:19', '1 Thessalonians 5:19 - Do not hinder the Holy Spirit.'),
('"Prove all things; hold fast that which is _____."', 'good', 'true', 'right', 'pure', 'good', 'Bible', 'Easy', '1 Thessalonians 5:21', '1 Thessalonians 5:21 - Test everything.'),
('"And the very God of peace sanctify you wholly; and I pray God your whole spirit and soul and body be preserved blameless unto the coming of our Lord Jesus _____."', 'Christ', 'Lord', 'Savior', 'King', 'Christ', 'Bible', 'Medium', '1 Thessalonians 5:23', '1 Thessalonians 5:23 - Complete sanctification.'),
('"Faithful is he that calleth you, who also will do _____."', 'it', 'this', 'that', 'everything', 'it', 'Bible', 'Easy', '1 Thessalonians 5:24', '1 Thessalonians 5:24 - God''s faithfulness.'),

-- 2 Timothy Questions (281-300)
('"For God hath not given us the spirit of fear; but of power, and of love, and of a sound _____."', 'mind', 'heart', 'spirit', 'soul', 'mind', 'Bible', 'Easy', '2 Timothy 1:7', '2 Timothy 1:7 - Spirit of power, love, and sound mind.'),
('"All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in _____."', 'righteousness', 'holiness', 'purity', 'godliness', 'righteousness', 'Bible', 'Easy', '2 Timothy 3:16', '2 Timothy 3:16 - Purpose of Scripture.'),
('"Preach the _____."', 'word', 'gospel', 'truth', 'message', 'word', 'Bible', 'Easy', '2 Timothy 4:2', '2 Timothy 4:2 - Preach the Word.'),
('"I have fought a good fight, I have finished my course, I have kept the _____."', 'faith', 'way', 'path', 'truth', 'faith', 'Bible', 'Easy', '2 Timothy 4:7', '2 Timothy 4:7 - Paul''s testimony.'),
('"Henceforth there is laid up for me a crown of _____."', 'righteousness', 'glory', 'honor', 'victory', 'righteousness', 'Bible', 'Easy', '2 Timothy 4:8', '2 Timothy 4:8 - Crown of righteousness.'),
('"Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of _____."', 'truth', 'God', 'life', 'wisdom', 'truth', 'Bible', 'Easy', '2 Timothy 2:15', '2 Timothy 2:15 - Study and rightly divide Scripture.'),
('"The Lord knoweth them that are _____."', 'his', 'saved', 'redeemed', 'chosen', 'his', 'Bible', 'Easy', '2 Timothy 2:19', '2 Timothy 2:19 - God knows His own.'),
('"Flee also youthful lusts: but follow righteousness, faith, charity, peace, with them that call on the Lord out of a pure _____."', 'heart', 'mind', 'spirit', 'soul', 'heart', 'Bible', 'Medium', '2 Timothy 2:22', '2 Timothy 2:22 - Flee lusts, follow righteousness.'),
('"And the servant of the Lord must not strive; but be gentle unto all men, apt to teach, patient, In meekness instructing those that oppose themselves; if God peradventure will give them repentance to the acknowledging of the _____."', 'truth', 'way', 'path', 'light', 'truth', 'Bible', 'Hard', '2 Timothy 2:24-25', '2 Timothy 2:24-25 - Gentle instruction in truth.'),
('"For the time will come when they will not endure sound doctrine; but after their own lusts shall they heap to themselves teachers, having itching _____."', 'ears', 'hearts', 'minds', 'souls', 'ears', 'Bible', 'Medium', '2 Timothy 4:3', '2 Timothy 4:3 - People seeking teachers who please them.'),

-- Hebrews Questions (301-320)
('"Now faith is the substance of things hoped for, the evidence of things not _____."', 'seen', 'visible', 'present', 'manifest', 'seen', 'Bible', 'Easy', 'Hebrews 11:1', 'Hebrews 11:1 - Definition of faith.'),
('"But without faith it is impossible to please him: for he that cometh to God must believe that he is, and that he is a rewarder of them that diligently seek _____."', 'him', 'God', 'the Lord', 'truth', 'him', 'Bible', 'Medium', 'Hebrews 11:6', 'Hebrews 11:6 - Faith required to please God.'),
('"By faith Noah, being warned of God of things not seen as yet, moved with fear, prepared an ark to the saving of his _____."', 'house', 'family', 'people', 'kin', 'house', 'Bible', 'Medium', 'Hebrews 11:7', 'Hebrews 11:7 - Noah''s faith.'),
('"By faith Abraham, when he was called to go out into a place which he should after receive for an inheritance, obeyed; and he went out, not knowing whither he _____."', 'went', 'journeyed', 'traveled', 'departed', 'went', 'Bible', 'Medium', 'Hebrews 11:8', 'Hebrews 11:8 - Abraham''s faith.'),
('"For he looked for a city which hath _____."', 'foundations', 'walls', 'gates', 'towers', 'foundations', 'Bible', 'Medium', 'Hebrews 11:10', 'Hebrews 11:10 - Heavenly city.'),
('"These all died in faith, not having received the promises, but having seen them afar off, and were persuaded of them, and embraced them, and confessed that they were strangers and pilgrims on the _____."', 'earth', 'world', 'land', 'ground', 'earth', 'Bible', 'Medium', 'Hebrews 11:13', 'Hebrews 11:13 - Faith heroes as pilgrims.'),
('"And what shall I more say? for the time would fail me to tell of Gedeon, and of Barak, and of Samson, and of Jephthae; of David also, and Samuel, and of the _____."', 'prophets', 'kings', 'priests', 'judges', 'prophets', 'Bible', 'Medium', 'Hebrews 11:32', 'Hebrews 11:32 - Heroes of faith.'),
('"Who through faith subdued kingdoms, wrought righteousness, obtained promises, stopped the mouths of lions, Quenched the violence of fire, escaped the edge of the sword, out of weakness were made strong, waxed valiant in fight, turned to flight the armies of the _____."', 'aliens', 'enemies', 'foreigners', 'strangers', 'aliens', 'Bible', 'Hard', 'Hebrews 11:33-34', 'Hebrews 11:33-34 - Victories through faith.'),
('"Wherefore seeing we also are compassed about with so great a cloud of witnesses, let us lay aside every weight, and the sin which doth so easily beset us, and let us run with patience the race that is set before _____."', 'us', 'me', 'thee', 'him', 'us', 'Bible', 'Medium', 'Hebrews 12:1', 'Hebrews 12:1 - Running the race of faith.'),
('"Looking unto Jesus the author and finisher of our _____."', 'faith', 'hope', 'salvation', 'journey', 'faith', 'Bible', 'Easy', 'Hebrews 12:2', 'Hebrews 12:2 - Jesus, author and finisher of faith.'),

-- James Questions (321-340)
('"But be ye doers of the word, and not hearers only, deceiving your own _____."', 'selves', 'hearts', 'minds', 'souls', 'selves', 'Bible', 'Easy', 'James 1:22', 'James 1:22 - Doers of the Word.'),
('"If any man among you seem to be religious, and bridleth not his tongue, but deceiveth his own heart, this man''s religion is _____."', 'vain', 'worthless', 'empty', 'useless', 'vain', 'Bible', 'Easy', 'James 1:26', 'James 1:26 - True religion involves tongue control.'),
('"Pure religion and undefiled before God and the Father is this, To visit the fatherless and widows in their affliction, and to keep himself unspotted from the _____."', 'world', 'sin', 'evil', 'corruption', 'world', 'Bible', 'Medium', 'James 1:27', 'James 1:27 - Pure religion.'),
('"My brethren, count it all joy when ye fall into divers temptations; Knowing this, that the trying of your faith worketh _____."', 'patience', 'endurance', 'perseverance', 'strength', 'patience', 'Bible', 'Medium', 'James 1:2-3', 'James 1:2-3 - Joy in trials.'),
('"Blessed is the man that endureth temptation: for when he is tried, he shall receive the crown of _____."', 'life', 'glory', 'honor', 'victory', 'life', 'Bible', 'Medium', 'James 1:12', 'James 1:12 - Crown of life.'),
('"Every good gift and every perfect gift is from _____."', 'above', 'heaven', 'God', 'the Father', 'above', 'Bible', 'Easy', 'James 1:17', 'James 1:17 - Source of good gifts.'),
('"Wherefore, my beloved brethren, let every man be swift to hear, slow to speak, slow to _____."', 'wrath', 'anger', 'fury', 'rage', 'wrath', 'Bible', 'Easy', 'James 1:19', 'James 1:19 - Control of speech and anger.'),
('"But the tongue can no man tame; it is an unruly evil, full of deadly _____."', 'poison', 'venom', 'toxin', 'substance', 'poison', 'Bible', 'Medium', 'James 3:8', 'James 3:8 - Power of the tongue.'),
('"This wisdom descendeth not from above, but is earthly, sensual, _____."', 'devilish', 'demonic', 'satanic', 'evil', 'devilish', 'Bible', 'Medium', 'James 3:15', 'James 3:15 - False wisdom.'),
('"But the wisdom that is from above is first pure, then peaceable, gentle, and easy to be intreated, full of mercy and good fruits, without partiality, and without _____."', 'hypocrisy', 'deceit', 'falsehood', 'pretense', 'hypocrisy', 'Bible', 'Medium', 'James 3:17', 'James 3:17 - True wisdom from above.'),

-- 1 Peter Questions (341-360)
('"Blessed be the God and Father of our Lord Jesus Christ, which according to his abundant mercy hath begotten us again unto a lively hope by the resurrection of Jesus Christ from the _____."', 'dead', 'grave', 'tomb', 'sepulchre', 'dead', 'Bible', 'Medium', '1 Peter 1:3', '1 Peter 1:3 - Living hope through resurrection.'),
('"Wherein ye greatly rejoice, though now for a season, if need be, ye are in heaviness through manifold temptations: That the trial of your faith, being much more precious than of gold that perisheth, though it be tried with fire, might be found unto praise and honour and glory at the appearing of Jesus _____."', 'Christ', 'Lord', 'Savior', 'King', 'Christ', 'Bible', 'Hard', '1 Peter 1:6-7', '1 Peter 1:6-7 - Purpose of trials.'),
('"But ye are a chosen generation, a royal priesthood, an holy nation, a peculiar _____."', 'people', 'nation', 'race', 'tribe', 'people', 'Bible', 'Medium', '1 Peter 2:9', '1 Peter 2:9 - Identity of believers.'),
('"But sanctify the Lord God in your hearts: and be ready always to give an answer to every man that asketh you a reason of the hope that is in you with meekness and _____."', 'fear', 'respect', 'reverence', 'awe', 'fear', 'Bible', 'Medium', '1 Peter 3:15', '1 Peter 3:15 - Defending the faith.'),
('"For Christ also hath once suffered for sins, the just for the unjust, that he might bring us to God, being put to death in the flesh, but quickened by the _____."', 'Spirit', 'God', 'Father', 'Lord', 'Spirit', 'Bible', 'Medium', '1 Peter 3:18', '1 Peter 3:18 - Christ''s suffering for us.'),
('"The like figure whereunto even baptism doth also now save us (not the putting away of the filth of the flesh, but the answer of a good conscience toward God,) by the resurrection of Jesus _____."', 'Christ', 'Lord', 'Savior', 'King', 'Christ', 'Bible', 'Medium', '1 Peter 3:21', '1 Peter 3:21 - Baptism and salvation.'),
('"Humble yourselves therefore under the mighty hand of God, that he may exalt you in due _____."', 'time', 'season', 'moment', 'hour', 'time', 'Bible', 'Easy', '1 Peter 5:6', '1 Peter 5:6 - Humility before God.'),
('"Be sober, be vigilant; because your adversary the devil, as a roaring lion, walketh about, seeking whom he may _____."', 'devour', 'consume', 'destroy', 'eat', 'devour', 'Bible', 'Easy', '1 Peter 5:8', '1 Peter 5:8 - Vigilance against the devil.'),
('"Casting all your care upon him; for he careth for _____."', 'you', 'us', 'thee', 'me', 'you', 'Bible', 'Easy', '1 Peter 5:7', '1 Peter 5:7 - Cast cares on God.'),
('"And the God of all grace, who hath called us unto his eternal glory by Christ Jesus, after that ye have suffered a while, make you perfect, stablish, strengthen, _____."', 'settle', 'establish', 'fix', 'ground', 'settle', 'Bible', 'Medium', '1 Peter 5:10', '1 Peter 5:10 - God''s work in suffering.'),

-- 1 John Questions (361-380)
('"Beloved, let us love one another: for love is of _____."', 'God', 'heaven', 'Christ', 'Jesus', 'God', 'Bible', 'Easy', '1 John 4:7', '1 John 4:7 - Love originates from God.'),
('"He that loveth not knoweth not God; for God is _____."', 'love', 'light', 'truth', 'life', 'love', 'Bible', 'Easy', '1 John 4:8', '1 John 4:8 - God is love.'),
('"Herein is love, not that we loved God, but that he loved us, and sent his Son to be the propitiation for our _____."', 'sins', 'transgressions', 'iniquities', 'wrongs', 'sins', 'Bible', 'Medium', '1 John 4:10', '1 John 4:10 - God''s love demonstrated.'),
('"If a man say, I love God, and hateth his brother, he is a _____."', 'liar', 'hypocrite', 'deceiver', 'pretender', 'liar', 'Bible', 'Easy', '1 John 4:20', '1 John 4:20 - Cannot love God and hate brother.'),
('"Whosoever believeth that Jesus is the Christ is born of _____."', 'God', 'heaven', 'the Spirit', 'Christ', 'God', 'Bible', 'Easy', '1 John 5:1', '1 John 5:1 - Born of God through faith.'),
('"For whatsoever is born of God overcometh the world: and this is the victory that overcometh the world, even our _____."', 'faith', 'belief', 'trust', 'hope', 'faith', 'Bible', 'Easy', '1 John 5:4', '1 John 5:4 - Faith overcomes the world.'),
('"And this is the record, that God hath given to us eternal life, and this life is in his _____."', 'Son', 'Christ', 'Jesus', 'Lord', 'Son', 'Bible', 'Easy', '1 John 5:11', '1 John 5:11 - Eternal life in Christ.'),
('"These things have I written unto you that believe on the name of the Son of God; that ye may know that ye have eternal life, and that ye may believe on the name of the Son of _____."', 'God', 'Heaven', 'Christ', 'Jesus', 'God', 'Bible', 'Medium', '1 John 5:13', '1 John 5:13 - Assurance of eternal life.'),
('"And we know that the Son of God is come, and hath given us an understanding, that we may know him that is true, and we are in him that is true, even in his Son Jesus Christ. This is the true God, and eternal _____."', 'life', 'salvation', 'hope', 'peace', 'life', 'Bible', 'Medium', '1 John 5:20', '1 John 5:20 - Christ is true God and eternal life.'),
('"Little children, keep yourselves from _____."', 'idols', 'false gods', 'graven images', 'heathen gods', 'idols', 'Bible', 'Easy', '1 John 5:21', '1 John 5:21 - Warning against idolatry.'),

-- Revelation Questions (381-400)
('"I am Alpha and Omega, the beginning and the _____."', 'ending', 'end', 'finish', 'conclusion', 'ending', 'Bible', 'Easy', 'Revelation 1:8', 'Revelation 1:8 - Christ is eternal.'),
('"Behold, he cometh with _____."', 'clouds', 'angels', 'power', 'glory', 'clouds', 'Bible', 'Easy', 'Revelation 1:7', 'Revelation 1:7 - Christ''s second coming.'),
('"And, behold, I come quickly; and my reward is with me, to give every man according as his work shall _____."', 'be', 'have been', 'was', 'is', 'be', 'Bible', 'Easy', 'Revelation 22:12', 'Revelation 22:12 - Christ''s reward.'),
('"He that hath an ear, let him hear what the Spirit saith unto the _____."', 'churches', 'people', 'nations', 'world', 'churches', 'Bible', 'Easy', 'Revelation 2:7', 'Revelation 2:7 - Call to hear.'),
('"And I saw a new heaven and a new earth: for the first heaven and the first earth were passed away; and there was no more _____."', 'sea', 'ocean', 'water', 'wave', 'sea', 'Bible', 'Easy', 'Revelation 21:1', 'Revelation 21:1 - New heaven and earth.'),
('"And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more _____."', 'pain', 'suffering', 'grief', 'anguish', 'pain', 'Bible', 'Easy', 'Revelation 21:4', 'Revelation 21:4 - No more pain in heaven.'),
('"And the city had no need of the sun, neither of the moon, to shine in it: for the glory of God did lighten it, and the Lamb is the light _____."', 'thereof', 'within', 'inside', 'of it', 'thereof', 'Bible', 'Medium', 'Revelation 21:23', 'Revelation 21:23 - God''s glory lights the city.'),
('"And the Spirit and the bride say, _____."', 'Come', 'Welcome', 'Enter', 'Approach', 'Come', 'Bible', 'Easy', 'Revelation 22:17', 'Revelation 22:17 - Invitation to come.'),
('"And let him that heareth say, _____."', 'Come', 'Welcome', 'Enter', 'Approach', 'Come', 'Bible', 'Easy', 'Revelation 22:17', 'Revelation 22:17 - Call to invite others.'),
('"I Jesus have sent mine angel to testify unto you these things in the churches. I am the root and the offspring of David, and the bright and morning _____."', 'star', 'light', 'sun', 'moon', 'star', 'Bible', 'Medium', 'Revelation 22:16', 'Revelation 22:16 - Christ as morning star.')