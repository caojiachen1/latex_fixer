use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum DelimiterType {
    InlineDollar,
    BlockDollar,
    InlineParen,
    BlockBracket,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Formula {
    pub id: String,
    pub raw: String,
    pub raw_with_delimiters: String,
    pub delimiter_type: DelimiterType,
    pub start_offset: usize,
    pub end_offset: usize,
    pub line_number: usize,
    pub is_valid: bool,
    pub error_message: Option<String>,
}

/// Returns the char index of `pattern` within `chars` starting from `from`,
/// or `None` if not found.
fn chars_index_of(chars: &[char], from: usize, pattern: &[char]) -> Option<usize> {
    let pat_len = pattern.len();
    if pat_len == 0 {
        return Some(from);
    }
    let limit = chars.len().saturating_sub(pat_len);
    for i in from..=limit {
        if chars[i..i + pat_len] == *pattern {
            return Some(i);
        }
    }
    None
}

fn create_formula(
    index: usize,
    chars: &[char],
    raw_start: usize,
    raw_end: usize,
    delim_start: usize,
    delim_end: usize,
    delimiter_type: DelimiterType,
) -> Formula {
    let raw: String = chars[raw_start..raw_end]
        .iter()
        .collect::<String>()
        .trim()
        .to_string();
    let raw_with_delimiters: String = chars[delim_start..delim_end].iter().collect();
    // Count newlines before delim_start (matches TypeScript's split('\n').length)
    let line_number = chars[..delim_start].iter().filter(|&&c| c == '\n').count() + 1;

    Formula {
        id: format!("formula-{}", index),
        raw,
        raw_with_delimiters,
        delimiter_type,
        start_offset: delim_start,
        end_offset: delim_end,
        line_number,
        is_valid: true,
        error_message: None,
    }
}

fn extract_formulas_impl(markdown: &str) -> Vec<Formula> {
    let chars: Vec<char> = markdown.chars().collect();
    let len = chars.len();
    let mut formulas: Vec<Formula> = Vec::new();
    let mut i = 0usize;
    let mut formula_index = 0usize;
    let mut in_code_block = false;
    let mut in_inline_code = false;

    let pat_fence: Vec<char> = "```".chars().collect();
    let pat_block_bracket_close: Vec<char> = "\\]".chars().collect();
    let pat_inline_paren_close: Vec<char> = "\\)".chars().collect();
    let pat_double_dollar: Vec<char> = "$$".chars().collect();

    while i < len {
        // Check for code fences (```)
        let is_fence = i + 3 <= len && chars[i..i + 3] == pat_fence[..];
        if is_fence {
            if in_code_block {
                in_code_block = false;
                i += 3;
                continue;
            } else if !in_inline_code {
                in_code_block = true;
                i += 3;
                continue;
            }
        }

        // Skip everything inside code blocks
        if in_code_block {
            i += 1;
            continue;
        }

        // Check for inline code (`) — single backtick, not part of ```
        if chars[i] == '`' && !(i + 3 <= len && chars[i..i + 3] == pat_fence[..]) {
            in_inline_code = !in_inline_code;
            i += 1;
            continue;
        }

        // Skip everything inside inline code
        if in_inline_code {
            i += 1;
            continue;
        }

        // Check for escaped characters
        if chars[i] == '\\' && i + 1 < len {
            let next = chars[i + 1];

            // \[ ... \] block formula
            if next == '[' {
                if let Some(result) = chars_index_of(&chars, i + 2, &pat_block_bracket_close) {
                    formulas.push(create_formula(
                        formula_index,
                        &chars,
                        i + 2,
                        result,
                        i,
                        result + 2,
                        DelimiterType::BlockBracket,
                    ));
                    formula_index += 1;
                    i = result + 2;
                    continue;
                }
            }

            // \( ... \) inline formula
            if next == '(' {
                if let Some(result) = chars_index_of(&chars, i + 2, &pat_inline_paren_close) {
                    formulas.push(create_formula(
                        formula_index,
                        &chars,
                        i + 2,
                        result,
                        i,
                        result + 2,
                        DelimiterType::InlineParen,
                    ));
                    formula_index += 1;
                    i = result + 2;
                    continue;
                }
            }

            // Escaped dollar \$ or any other escaped char — skip both chars
            i += 2;
            continue;
        }

        // Check for $$ (block formula) — must check before single $
        let is_double_dollar = i + 2 <= len && chars[i..i + 2] == pat_double_dollar[..];
        if is_double_dollar {
            let start = i;
            let search_from = i + 2;
            if let Some(end) = chars_index_of(&chars, search_from, &pat_double_dollar) {
                formulas.push(create_formula(
                    formula_index,
                    &chars,
                    search_from,
                    end,
                    start,
                    end + 2,
                    DelimiterType::BlockDollar,
                ));
                formula_index += 1;
                i = end + 2;
                continue;
            }
        }

        // Check for single $ (inline formula)
        if chars[i] == '$' {
            let start = i;
            let search_from = i + 1;
            let mut j = search_from;
            while j < len {
                if chars[j] == '$' && (j == 0 || chars[j - 1] != '\\') {
                    break;
                }
                j += 1;
            }
            if j < len {
                let first_char_is_digit = chars
                    .get(search_from)
                    .map(|c| c.is_ascii_digit())
                    .unwrap_or(false);
                let raw_len = j - search_from;
                if raw_len > 0 && !first_char_is_digit {
                    formulas.push(create_formula(
                        formula_index,
                        &chars,
                        search_from,
                        j,
                        start,
                        j + 1,
                        DelimiterType::InlineDollar,
                    ));
                    formula_index += 1;
                }
                i = j + 1;
                continue;
            }
        }

        i += 1;
    }

    formulas
}

#[tauri::command]
pub fn extract_formulas(markdown: String) -> Vec<Formula> {
    extract_formulas_impl(&markdown)
}
