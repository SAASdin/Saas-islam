# Guide de complétion des Mutun islamiques

**Statut :** 🟡 Partiellement complet — Intervention manuelle requise  
**Dernière mise à jour :** 2026-02-25

---

## Pourquoi ce guide ?

Le scraping automatique de shamela.ws est impossible (Cloudflare).  
Les textes arabes des mutun sont **quasi-sacrés** : toute erreur dans un bayt mémorisé par des apprenants est une responsabilité spirituelle.  
**Règle absolue :** tout bayt doit être copié mot-à-mot depuis une édition imprimée fiable, avec tashkil (voyelles).

---

## État actuel

| Matn | Bayts vérifiés | Manquants | Source des vérifiés |
|------|---------------|-----------|---------------------|
| Al-Baiquniyya (34) | 1–10 ✅ | 11–34 (24 bayts) | mutun-data.ts |
| Tuhfat al-Atfal (61) | 1–8 ✅ | 9–61 (53 bayts) | mutun-data.ts |
| Al-Ajrumiyya (prose) | Structure uniquement ⚠️ | Texte complet | — |
| Al-Waraqat (prose) | Structure uniquement ⚠️ | Texte complet | — |
| Matn Abi Shuja' (prose) | Structure uniquement ⚠️ | Texte complet | — |

---

## Références imprimées recommandées

### 1. Al-Baiquniyya (المنظومة البيقونية)
**Auteur :** عمر بن محمد البيقوني (m. ~1080 AH)  
**Sujet :** Mustalah al-Hadith (terminologie du hadith)  
**Total :** 34 bayts  

**Éditions fiables :**
- Sharh al-Baiquniyya — Ibn Uthaymin — Dar al-Minhaj (ISBN : 978-603-8108-22-5)
- Sharh al-Baiquniyya — Muhammad 'Awwama — Dar al-Yusur
- Texte nu + tashkil sur archive.org : https://archive.org/search?query=البيقونية

**Sujets des bayts manquants (11–34) pour faciliter la vérification :**
```
11  : Mursal (المرسل)
12  : Munqati' (المنقطع)
13  : Mu'dhal (المعضل)
14  : Mudallis (المدلَّس)
15  : Mudraj (المدرَج)
16  : Mawdu' (الموضوع)
17  : Matruk + Munkar (المتروك والمنكر)
18  : Mu'allal (المعلَّل)
19  : Mudhtarib (المضطرب)
20  : Maqlub (المقلوب)
21  : Mawquf (الموقوف)
22  : Maqtu' (المقطوع)
23  : Marfu' (المرفوع)
24  : Raf' (حكم الرفع)
25  : Noms des transmetteurs (أسماء الرواة)
26  : Mashayikh (المشايخ)
27  : Mutawatir (المتواتر)
28  : 'Aziz (العزيز)
29  : Mashhur (المشهور)
30  : Gharib (الغريب)
31  : 'Ali al-isnad (عالي الإسناد)
32  : Nazil al-isnad (النازل)
33  : Salutation finale (الخاتمة - 1)
34  : Salutation finale (الخاتمة - 2)
```

---

### 2. Tuhfat al-Atfal (تحفة الأطفال)
**Auteur :** سليمان بن حسين الجمزوري (m. 1198 AH)  
**Sujet :** Tajweed  
**Total :** 61 bayts  

**Éditions fiables :**
- Tuhfat al-Atfal ma'a Sharh al-Hidaya — Dar Ibn Khuzayma
- Toute édition avec tashkil complet et numérotation des bayts

**Sujets des bayts manquants (9–61) :**
```
9-17  : Idgham (الإدغام) — complet + nakis
18-23 : Iqlab (الإقلاب)
24-32 : Ikhfa' haqiqi (الإخفاء الحقيقي) — lettres
33-38 : Meem sakin (الميم الساكنة)
39-43 : Idgham + Ikhfa' shafawi
44-45 : Lam ta'rif + Lam fi'l (لام التعريف)
46-51 : Ra' (الراء)
52-58 : Madd (المد) — types et règles
59-61 : Khatima (الخاتمة)
```

---

### 3. Al-Ajrumiyya (الآجرومية)
**Auteur :** أبو عبد الله محمد بن داود الصنهاجي (m. 723 AH)  
**Sujet :** Grammaire arabe (Nahw)  
**Type :** Prose (18 chapitres + introductions)  

**Éditions fiables :**
- Matn al-Ajrumiyya — Dar Ibn Hazm, Beyrouth
- Al-Ajrumiyya avec i'rab — Muhammad 'Ali al-Sabuni

**Note :** Texte court (~3 pages). Recommandé de saisir la version intégrale d'une édition moderne avec tashkil. L'édition de Dar al-Salam (Riyadh) est particulièrement claire.

---

### 4. Al-Waraqat (الورقات)
**Auteur :** أبو المعالي عبد الملك الجويني (m. 478 AH)  
**Sujet :** Usul al-Fiqh  
**Type :** Prose (~15 pages)  

**Éditions fiables :**
- Al-Waraqat fi Usul al-Fiqh — sharh al-'Uthaymi — Dar Ibn Abi al-Jazm
- Sharh al-Waraqat — al-Mahalli — édition ancienne

---

### 5. Matn Abi Shuja' (متن أبي شجاع — الغاية والتقريب)
**Auteur :** أبو شجاع أحمد بن الحسين الأصفهاني (m. ~593 AH)  
**Sujet :** Fiqh Chaféite  
**Type :** Prose (~30 pages)  

**Éditions fiables :**
- Al-Ghaya wa al-Taqrib — matn nur sans sharh — Dar al-Minhaj
- Matn Abi Shuja' avec sharh al-Bujayrani

---

## Procédure de complétion

### Étape 1 — Préparer
```bash
cd saas-islam
git checkout -b dev/moha/mutun-complete
```

### Étape 2 — Éditer le fichier de seed
```
database/seeds/03_mutun_seed.sql
```
Remplacer chaque `[PLACEHOLDER-N]` par le texte arabe exact avec tashkil.  
**Règles absolues :**
- Copier le texte caractère par caractère
- Conserver les voyelles (tashkil) exactement comme dans l'édition
- Ne jamais ajouter de espace en début/fin
- Ne jamais reformuler, corriger ou "améliorer" le texte

### Étape 3 — Mettre à jour mutun-data.ts
Ajouter les bayts manquants dans le même format que les bayts existants :
```typescript
// Fichier : apps/memorization-app/src/lib/mutun-data.ts
{
  id: 'baiquniyya-11', matnId: 'baiquniyya', number: 11,
  textAr:    '[TEXTE ARABE EXACT *** AVEC LES DEUX HEMISTICHES]',
  firstHalf: '[Premier hémistiche]',
  secondHalf:'[Second hémistiche]',
  // textFr optionnel — aide pédagogique seulement
},
```

### Étape 4 — Générer le hash SHA-256
```bash
# Après avoir importé en DB :
psql -U islampc -d saas_islam -c "
  SELECT encode(
    sha256(
      string_agg(text_arabic, '' '' ORDER BY m.text_key, ml.line_number)::bytea
    ),
    'hex'
  ) as hash
  FROM sacred.mutun_lines ml
  JOIN sacred.mutun m ON m.id = ml.matn_id
  WHERE ml.text_arabic NOT LIKE '[PLACEHOLDER%'
"
```

### Étape 5 — Valider + PR
```bash
git add database/seeds/03_mutun_seed.sql \
        apps/memorization-app/src/lib/mutun-data.ts

git commit -m "feat(mutun): complétion bayts [matn] depuis [édition/référence]

Source : [Titre exact de l'édition]
Éditeur : [Nom éditeur]
Édition : [Numéro d'édition, année]
Vérificateur : [Nom de la personne qui a vérifié]
Bayts ajoutés : [liste]"

git push origin dev/moha/mutun-complete
```
**Ouvrir une PR — Reviewers : Moha + Bilal (les deux doivent approuver)**

---

## ⚠️ Avertissement final

Ces textes seront mémorisés par des milliers d'apprenants.  
Une coquille dans un bayt peut se propager à vie dans la mémoire d'un étudiant.  
**Aucun compromis sur la vérification.**

بارك الله فيكم
