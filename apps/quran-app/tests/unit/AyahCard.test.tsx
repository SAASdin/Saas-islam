// ============================================================
// AyahCard.test.tsx — Tests d'affichage islamique
//
// Vérifie les RÈGLES ABSOLUES d'affichage :
//   1. dir="rtl" présent sur le conteneur arabe
//   2. lang="ar" présent sur le conteneur arabe
//   3. Texte arabe affiché AVANT la traduction dans le DOM
//   4. Référence Sourate:Verset présente
// ============================================================

import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AyahCard from '@/components/quran/AyahCard'

// ── Props de test ─────────────────────────────────────────────

const BASE_PROPS = {
  surahName:     'Al-Baqarah',
  surahNumber:   2,
  ayahNumber:    255,
  // ⚠️ Texte arabe sacré — utilisé ici en test UNIQUEMENT, jamais modifier
  textArabic:    'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
  translationFr: "Allah ! Point de divinité à part Lui, le Vivant, Celui qui subsiste par lui-même",
  translationEn: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence.",
}

// ── Describe principal ────────────────────────────────────────

describe('AyahCard — Règles d\'affichage islamique', () => {

  // ── Règle 1 : dir="rtl" ────────────────────────────────────
  describe('Règle 1 : dir="rtl" obligatoire sur le texte arabe', () => {
    it('le conteneur du texte arabe a dir="rtl"', () => {
      render(<AyahCard {...BASE_PROPS} />)
      const arabicText = screen.getByTestId('arabic-text')
      expect(arabicText).toHaveAttribute('dir', 'rtl')
    })

    it('le conteneur du texte arabe n\'a pas dir="ltr"', () => {
      render(<AyahCard {...BASE_PROPS} />)
      const arabicText = screen.getByTestId('arabic-text')
      expect(arabicText).not.toHaveAttribute('dir', 'ltr')
    })
  })

  // ── Règle 2 : lang="ar" ────────────────────────────────────
  describe('Règle 2 : lang="ar" obligatoire sur le texte arabe', () => {
    it('le conteneur du texte arabe a lang="ar"', () => {
      render(<AyahCard {...BASE_PROPS} />)
      const arabicText = screen.getByTestId('arabic-text')
      expect(arabicText).toHaveAttribute('lang', 'ar')
    })

    it('la traduction française a lang="fr"', () => {
      render(<AyahCard {...BASE_PROPS} />)
      const translation = screen.getByTestId('translation-fr')
      expect(translation).toHaveAttribute('lang', 'fr')
    })
  })

  // ── Règle 3 : Texte arabe AVANT la traduction dans le DOM ──
  describe('Règle 3 : texte arabe affiché AVANT la traduction', () => {
    it('le nœud DOM du texte arabe précède la traduction française', () => {
      const { container } = render(<AyahCard {...BASE_PROPS} />)

      const arabicEl     = container.querySelector('[data-testid="arabic-text"]')
      const translationEl = container.querySelector('[data-testid="translation-fr"]')

      expect(arabicEl).not.toBeNull()
      expect(translationEl).not.toBeNull()

      // Vérification de l'ordre dans le DOM via compareDocumentPosition
      // DOCUMENT_POSITION_FOLLOWING (4) = arabicEl précède translationEl
      const position = arabicEl!.compareDocumentPosition(translationEl!)
      expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })

    it('le texte arabe original est affiché sans modification', () => {
      render(<AyahCard {...BASE_PROPS} />)
      const arabicText = screen.getByTestId('arabic-text')
      // ⚠️ Le texte arabe est affiché TEL QUEL — READ ONLY
      expect(arabicText).toHaveTextContent(BASE_PROPS.textArabic)
    })

    it('la traduction française est affichée telle quelle', () => {
      render(<AyahCard {...BASE_PROPS} />)
      const translation = screen.getByTestId('translation-fr')
      expect(translation).toHaveTextContent(BASE_PROPS.translationFr)
    })
  })

  // ── Règle 4 : Référence Sourate:Verset obligatoire ─────────
  describe('Règle 4 : référence Sourate:Verset présente', () => {
    it('la référence "Al-Baqarah 2:255" est visible', () => {
      render(<AyahCard {...BASE_PROPS} />)
      const ref = screen.getByTestId('ayah-reference')
      expect(ref).toHaveTextContent('Al-Baqarah 2:255')
    })

    it('le nom de la sourate est présent dans la référence', () => {
      render(<AyahCard {...BASE_PROPS} />)
      const ref = screen.getByTestId('ayah-reference')
      expect(ref).toHaveTextContent('Al-Baqarah')
    })

    it('le numéro de verset est présent dans la référence', () => {
      render(<AyahCard {...BASE_PROPS} />)
      const ref = screen.getByTestId('ayah-reference')
      expect(ref).toHaveTextContent('255')
    })

    it('le format exact est NomSourate NuméroSourate:NuméroVerset', () => {
      render(<AyahCard {...BASE_PROPS} />)
      const ref = screen.getByTestId('ayah-reference')
      // Format : "Al-Baqarah 2:255"
      expect(ref.textContent).toMatch(/Al-Baqarah\s+2:255/)
    })
  })

  // ── Tests complémentaires ───────────────────────────────────
  describe('Fonctionnalités complémentaires', () => {
    it('le numéro de verset est affiché dans le cercle décoratif', () => {
      render(<AyahCard {...BASE_PROPS} />)
      // Le numéro est présent quelque part dans le composant
      expect(screen.getAllByText('255').length).toBeGreaterThanOrEqual(1)
    })

    it('le bouton audio est affiché si audioUrl est fourni', () => {
      render(<AyahCard {...BASE_PROPS} audioUrl="https://example.com/audio.mp3" />)
      const playBtn = screen.getByLabelText(/Écouter/i)
      expect(playBtn).toBeInTheDocument()
    })

    it('le bouton audio n\'est pas affiché sans audioUrl', () => {
      render(<AyahCard {...BASE_PROPS} />)
      expect(screen.queryByLabelText(/Écouter/i)).not.toBeInTheDocument()
    })

    it('le bouton favori est affiché', () => {
      render(<AyahCard {...BASE_PROPS} />)
      expect(screen.getByLabelText(/favoris/i)).toBeInTheDocument()
    })

    it('le bouton marque-page est affiché', () => {
      render(<AyahCard {...BASE_PROPS} />)
      expect(screen.getByLabelText(/marque-page/i)).toBeInTheDocument()
    })

    it('le panneau Tafsir est masqué par défaut', () => {
      render(<AyahCard {...BASE_PROPS} />)
      expect(screen.queryByText(/Contenu Tafsir/i)).not.toBeInTheDocument()
    })

    it('le panneau Tafsir s\'ouvre au clic sur le bouton Tafsir', async () => {
      const user = userEvent.setup()
      render(<AyahCard {...BASE_PROPS} />)
      const tafsirBtn = screen.getByLabelText(/Tafsir/i)
      await user.click(tafsirBtn)
      expect(screen.getByText(/Contenu Tafsir/i)).toBeInTheDocument()
    })

    it('la traduction anglaise est masquée par défaut', () => {
      render(<AyahCard {...BASE_PROPS} />)
      expect(screen.queryByTestId('translation-en')).not.toBeInTheDocument()
    })

    it('le callback onFavorite est appelé au clic', async () => {
      const user = userEvent.setup()
      const onFavorite = jest.fn()
      render(<AyahCard {...BASE_PROPS} onFavorite={onFavorite} />)
      await user.click(screen.getByLabelText(/favoris/i))
      expect(onFavorite).toHaveBeenCalledTimes(1)
    })

    it('le callback onBookmark est appelé au clic', async () => {
      const user = userEvent.setup()
      const onBookmark = jest.fn()
      render(<AyahCard {...BASE_PROPS} onBookmark={onBookmark} />)
      await user.click(screen.getByLabelText(/marque-page/i))
      expect(onBookmark).toHaveBeenCalledTimes(1)
    })
  })

  // ── Test différentes sourates ──────────────────────────────
  describe('Test avec différentes sourates', () => {
    it('fonctionne avec Al-Fatiha (sourate 1)', () => {
      render(
        <AyahCard
          surahName="Al-Fatiha"
          surahNumber={1}
          ayahNumber={1}
          textArabic="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
          translationFr="Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux"
        />
      )
      expect(screen.getByTestId('ayah-reference')).toHaveTextContent('Al-Fatiha 1:1')
      expect(screen.getByTestId('arabic-text')).toHaveAttribute('dir', 'rtl')
      expect(screen.getByTestId('arabic-text')).toHaveAttribute('lang', 'ar')
    })

    it('fonctionne avec An-Nas (dernière sourate, 114)', () => {
      render(
        <AyahCard
          surahName="An-Nas"
          surahNumber={114}
          ayahNumber={6}
          textArabic="مِنَ الْجِنَّةِ وَالنَّاسِ"
          translationFr="Des djinns et des hommes."
        />
      )
      expect(screen.getByTestId('ayah-reference')).toHaveTextContent('An-Nas 114:6')
    })
  })
})
