-- 500 Bible Verse Memorization Questions
-- Questions designed to help users memorize Bible verses

-- Insert 500 Bible verse memorization questions
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
('"I am the bread of _____."', 'life', 'living', 'eternal', '