import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { UnitStudyGuide } from '@/src/types';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function listSection(title: string, items: string[] | undefined): string {
  if (!items || items.length === 0) return '';
  return `
    <h2>${escapeHtml(title)}</h2>
    <ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
  `;
}

function buildStudyGuideHtml(unitTitle: string, guide: UnitStudyGuide): string {
  const vocabularyHtml =
    guide.vocabulary && guide.vocabulary.length > 0
      ? `<h2>Vocabulary</h2><dl>${guide.vocabulary
          .map((entry) => `<dt><b>${escapeHtml(entry.term)}</b></dt><dd>${escapeHtml(entry.definition)}</dd>`)
          .join('')}</dl>`
      : '';

  const flashcardsHtml =
    guide.flashcards && guide.flashcards.length > 0
      ? `<h2>Flashcards</h2>${guide.flashcards
          .map((card) => `<p><b>${escapeHtml(card.front)}</b><br/>${escapeHtml(card.back)}</p>`)
          .join('')}`
      : '';

  const quizHtml = (title: string, questions: UnitStudyGuide['practiceQuiz']) =>
    questions && questions.length > 0
      ? `<h2>${escapeHtml(title)}</h2>${questions
          .map(
            (q, index) =>
              `<p>${index + 1}. ${escapeHtml(q.question)}<br/><i>Answer: ${escapeHtml(q.answer)}</i></p>`,
          )
          .join('')}`
      : '';

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 24px; color: #1a1a1a; }
          h1 { font-size: 24px; }
          h2 { font-size: 18px; margin-top: 24px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
          p, li, dd { font-size: 13px; line-height: 1.5; }
          dt { font-size: 13px; margin-top: 8px; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(unitTitle)} — Study Guide</h1>
        ${guide.studyGuide ? `<h2>Study Guide</h2><p>${escapeHtml(guide.studyGuide).replace(/\n/g, '<br/>')}</p>` : ''}
        ${guide.reviewSheet ? `<h2>Review Sheet</h2><p>${escapeHtml(guide.reviewSheet).replace(/\n/g, '<br/>')}</p>` : ''}
        ${guide.chapterSummary ? `<h2>Chapter Summary</h2><p>${escapeHtml(guide.chapterSummary).replace(/\n/g, '<br/>')}</p>` : ''}
        ${listSection('Key Concepts', guide.keyConcepts)}
        ${vocabularyHtml}
        ${listSection('Equations & Formulas', guide.equationsAndFormulas)}
        ${flashcardsHtml}
        ${quizHtml('Practice Quiz', guide.practiceQuiz)}
        ${quizHtml('Practice Exam', guide.practiceExam)}
        ${listSection('Likely Exam Topics', guide.likelyExamTopics)}
        ${listSection('Professor Emphasized', guide.professorEmphasis)}
        ${listSection('Memory Tricks & Mnemonics', guide.mnemonics)}
        ${listSection('Review Checklist', guide.reviewChecklist)}
      </body>
    </html>
  `;
}

export async function exportStudyGuideToPdf(unitTitle: string, guide: UnitStudyGuide): Promise<void> {
  const html = buildStudyGuideHtml(unitTitle, guide);
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  }
}
