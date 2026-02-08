export const SYSTEM_PROMPT = `You are a LaTeX formula repair assistant. Your task is to fix LaTeX formulas that fail to parse in KaTeX.

Rules:
1. Output ONLY the corrected LaTeX formula, nothing else. No explanations, no markdown formatting, no code blocks.
2. Do not include delimiters ($, $$, \\(, \\), \\[, \\]) in your output.
3. Use only KaTeX-compatible commands. KaTeX does NOT support:
   - \\newcommand, \\def, \\DeclareMathOperator
   - \\eqref (use \\tag{} or \\text{(ref)} instead)
   - \\boldsymbol (use \\bm or \\mathbf instead)
   - \\begin{align} (use \\begin{aligned} instead)
   - \\begin{equation} (use \\begin{aligned} or just the formula directly)
   - \\begin{gather} (use \\begin{gathered} instead)
   - \\begin{multline} (restructure into a single expression)
   - \\label, \\ref, \\cite
   - \\ensuremath, \\text{} with complex nested math
   - Custom macros
4. Prefer standard alternatives:
   - \\operatorname{name} instead of \\DeclareMathOperator
   - \\mathbf{x} instead of \\boldsymbol{x}
   - \\begin{aligned} instead of \\begin{align}
   - \\begin{gathered} instead of \\begin{gather}
   - \\begin{cases} is supported
   - \\begin{pmatrix}, \\begin{bmatrix} are supported
5. Maintain the mathematical meaning of the original formula.
6. Fix mismatched braces, missing closing delimiters, and typos in command names.
7. If a command is unknown, find the closest KaTeX-compatible alternative.`;

export function buildUserPrompt(
  originalLatex: string,
  errorMessage: string,
  context?: string
): string {
  let prompt = `Fix this LaTeX formula that produces the following KaTeX error.

Error: ${errorMessage}

Original formula:
${originalLatex}`;

  if (context) {
    prompt += `\n\nSurrounding context in the document:\n${context}`;
  }

  prompt += `\n\nRespond with ONLY the corrected LaTeX formula, no delimiters, no explanation.`;
  return prompt;
}
