/// <reference types="jest" />

import { buildStudyGuideHtml, escapeHtml } from '@/src/lib/studyGuidePdf';
import type { UnitStudyGuide } from '@/src/types';

const emptyGuide: UnitStudyGuide = { status: 'ready' };

describe('escapeHtml', () => {
  it('escapes &, <, and > so raw AI-generated text can\'t break out of the surrounding HTML', () => {
    expect(escapeHtml('<script>alert("x")</script> & more')).toBe(
      '&lt;script&gt;alert("x")&lt;/script&gt; &amp; more',
    );
  });

  it('leaves plain text untouched', () => {
    expect(escapeHtml('SN1 vs SN2 mechanisms')).toBe('SN1 vs SN2 mechanisms');
  });
});

describe('buildStudyGuideHtml', () => {
  it('includes the escaped unit title in an <h1>', () => {
    const html = buildStudyGuideHtml('Unit 1 <Intro>', emptyGuide);
    expect(html).toContain('<h1>Unit 1 &lt;Intro&gt; — Study Guide</h1>');
  });

  it('omits a section entirely when its content is empty/undefined', () => {
    const html = buildStudyGuideHtml('Unit 1', emptyGuide);
    expect(html).not.toContain('<h2>Study Guide</h2>');
    expect(html).not.toContain('<h2>Key Concepts</h2>');
    expect(html).not.toContain('<h2>Vocabulary</h2>');
    expect(html).not.toContain('<h2>Flashcards</h2>');
    expect(html).not.toContain('<h2>Practice Quiz</h2>');
  });

  it('renders the study guide body with newlines converted to <br/>, HTML-escaped', () => {
    const html = buildStudyGuideHtml('Unit 1', {
      ...emptyGuide,
      studyGuide: 'Line one\nLine <two>',
    });
    expect(html).toContain('<h2>Study Guide</h2><p>Line one<br/>Line &lt;two&gt;</p>');
  });

  it('renders a key-concepts list, escaping each item', () => {
    const html = buildStudyGuideHtml('Unit 1', {
      ...emptyGuide,
      keyConcepts: ['SN1 vs SN2', 'A & B'],
    });
    expect(html).toContain('<h2>Key Concepts</h2>');
    expect(html).toContain('<li>SN1 vs SN2</li>');
    expect(html).toContain('<li>A &amp; B</li>');
  });

  it('renders vocabulary as a definition list', () => {
    const html = buildStudyGuideHtml('Unit 1', {
      ...emptyGuide,
      vocabulary: [{ term: 'Nucleophile', definition: 'An electron-rich species.' }],
    });
    expect(html).toContain('<dt><b>Nucleophile</b></dt><dd>An electron-rich species.</dd>');
  });

  it('renders flashcards as front/back pairs', () => {
    const html = buildStudyGuideHtml('Unit 1', {
      ...emptyGuide,
      flashcards: [{ front: 'What is SN1?', back: 'Unimolecular nucleophilic substitution.' }],
    });
    expect(html).toContain('<h2>Flashcards</h2>');
    expect(html).toContain('<b>What is SN1?</b><br/>Unimolecular nucleophilic substitution.');
  });

  it('numbers practice quiz questions and includes the answer', () => {
    const html = buildStudyGuideHtml('Unit 1', {
      ...emptyGuide,
      practiceQuiz: [
        { question: 'What is SN2?', answer: 'Bimolecular nucleophilic substitution.' },
        { question: 'What is SN1?', answer: 'Unimolecular nucleophilic substitution.' },
      ],
    });
    expect(html).toContain('<h2>Practice Quiz</h2>');
    expect(html).toContain('1. What is SN2?<br/><i>Answer: Bimolecular nucleophilic substitution.</i>');
    expect(html).toContain('2. What is SN1?<br/><i>Answer: Unimolecular nucleophilic substitution.</i>');
  });

  it('keeps practice quiz and practice exam sections separate', () => {
    const html = buildStudyGuideHtml('Unit 1', {
      ...emptyGuide,
      practiceQuiz: [{ question: 'Quiz question', answer: 'Quiz answer' }],
      practiceExam: [{ question: 'Exam question', answer: 'Exam answer' }],
    });
    expect(html).toContain('<h2>Practice Quiz</h2>');
    expect(html).toContain('<h2>Practice Exam</h2>');
    expect(html).toContain('Quiz question');
    expect(html).toContain('Exam question');
  });
});
