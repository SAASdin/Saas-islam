-- hadiths_01_collections.sql
INSERT INTO sacred.hadith_collections (name_arabic, name_french, name_english, author, death_year_hijri, total_hadiths, collection_key) VALUES
  ('صحيح البخاري', 'Sahih Al-Bukhari', 'Sahih al-Bukhari', 'Al-Bukhari', 256, 0, 'bukhari'),
  ('صحيح مسلم', 'Sahih Muslim', 'Sahih Muslim', 'Muslim ibn al-Hajjaj', 261, 0, 'muslim'),
  ('سنن النسائي', 'Sunan an-Nasa''i', 'Sunan an-Nasa''i', 'An-Nasa''i', 303, 0, 'nasai'),
  ('سنن أبي داود', 'Sunan Abi Dawud', 'Sunan Abi Dawud', 'Abu Dawud', 275, 0, 'abudawud'),
  ('جامع الترمذي', 'Jami'' at-Tirmidhi', 'Jami'' at-Tirmidhi', 'At-Tirmidhi', 279, 0, 'tirmidhi'),
  ('سنن ابن ماجه', 'Sunan Ibn Majah', 'Sunan Ibn Majah', 'Ibn Majah', 273, 0, 'ibnmajah'),
  ('موطأ مالك', 'Muwatta Malik', 'Muwatta Malik', 'Malik ibn Anas', 179, 0, 'malik'),
  ('الأربعون النووية', '40 Hadiths de Nawawi', 'An-Nawawi''s Forty Hadith', 'An-Nawawi', 676, 0, 'nawawi40'),
  ('الحديث القدسي', '40 Hadiths Qudsi', 'Forty Hadith Qudsi', 'Divers', NULL, 0, 'qudsi40')
ON CONFLICT (collection_key) DO UPDATE SET name_arabic=EXCLUDED.name_arabic, name_french=EXCLUDED.name_french, name_english=EXCLUDED.name_english;
