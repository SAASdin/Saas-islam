# 📚 DATA_SOURCES.md — Sources de données religieuses

> **RÈGLE** : Les données religieuses ne doivent provenir QUE des sources listées ici.
> Toute nouvelle source doit être validée par les deux collaborateurs.

---

## 📖 Coran

| Source | URL | Usage | Statut |
|---|---|---|---|
| AlQuran.cloud | `https://api.alquran.cloud/v1` | Texte, audio, traductions | ✅ Approuvée |
| Quran.com API | `https://api.quran.com/api/v4` | Alternative | ✅ Approuvée |
| Tanzil.net | `https://tanzil.net/download` | Dataset complet Mushaf Hafs | ✅ Approuvée |

**Édition de référence** : Mushaf Uthmani — Hafs 'an 'Asim

---

## 📜 Hadiths

| Source | URL | Collections | Statut |
|---|---|---|---|
| Sunnah.com API | `https://api.sunnah.com/v1` | Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah | ✅ Approuvée |

**Règle** : Toujours afficher source + classification (sahih/hassan/da'if) + numéro

---

## 🕌 Horaires de prière

| Source | URL | Usage |
|---|---|---|
| Aladhan API | `https://api.aladhan.com/v1` | Calcul horaires, méthodes multiples |

**Règle** : Toujours afficher la méthode de calcul utilisée (MWL, ISNA, Egyptian, etc.)

---

## ❌ Sources INTERDITES

- Wikipedia (pour le contenu religieux)
- Forums, blogs, sites non authentifiés
- Génération IA (ChatGPT, Claude, Gemini...) pour du contenu religieux
- Traductions non vérifiées par des savants

---

## 🔐 Intégrité

Après chaque import de données religieuses :
1. Générer hash SHA-256 du dataset
2. Stocker dans `database/integrity/[source]-[date].sha256`
3. Vérifier via CI/CD à chaque déploiement
