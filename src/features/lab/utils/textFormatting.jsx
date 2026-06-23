import React from 'react';

// ---------------------------------------------------------------------------
// formatChemicalText  –  LaTeX-lite Markup Parser
//
// Notation:
//   _{...}  → subscript     e.g.  H_{2}O  →  H₂O
//   ^{...}  → superscript   e.g.  Fe^{3+} →  Fe³⁺
//
// Fallback: if no markup is found, applies legacy heuristic
//   (digit after letter or ')' / ']' → subscript)
//   so existing un-migrated data still renders correctly.
// ---------------------------------------------------------------------------

const SUB_STYLE = {
  fontSize: '0.7em',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  opacity: 0.9,
  verticalAlign: 'sub',
  lineHeight: 0,
};

const SUP_STYLE = {
  fontSize: '0.7em',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  opacity: 0.9,
  verticalAlign: 'super',
  lineHeight: 0,
};

// ── Primary: explicit markup parser ──────────────────────────────────────────
const MARKUP_RE = /(_\{[^}]*\}|\^\{[^}]*\})/;

function parseMarkup(text) {
  const parts = text.split(MARKUP_RE);
  if (parts.length === 1) return null; // no markup found → signal to use fallback

  const elements = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    if (part.startsWith('_{') && part.endsWith('}')) {
      const inner = part.slice(2, -1);
      elements.push(<sub key={i} style={SUB_STYLE}>{inner}</sub>);
    } else if (part.startsWith('^{') && part.endsWith('}')) {
      const inner = part.slice(2, -1);
      elements.push(<sup key={i} style={SUP_STYLE}>{inner}</sup>);
    } else {
      elements.push(<span key={i}>{part}</span>);
    }
  }
  return <>{elements}</>;
}

// ── Fallback: legacy heuristic parser ────────────────────────────────────────
// Keeps backward compatibility for data that hasn't been migrated yet.
// Rule: digit(s) immediately after a letter or ')' / ']' → subscript.
function parseLegacy(text) {
  // 1. Normalize any existing Unicode subscripts to plain digits
  const UNICODE_SUBSCRIPTS = {
    '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
    '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9'
  };
  const normalizedText = text.replace(/[₀-₉]/g, char => UNICODE_SUBSCRIPTS[char]);

  const elements = [];
  let buffer = "";

  for (let i = 0; i < normalizedText.length; i++) {
    const char = normalizedText[i];

    if (/[0-9]/.test(char)) {
      const prevChar = i > 0 ? normalizedText[i - 1] : "";

      let numStr = char;
      while (i + 1 < normalizedText.length && /[0-9]/.test(normalizedText[i + 1])) {
        numStr += normalizedText[i + 1];
        i++;
      }

      if (prevChar && /[a-zA-Z)\]]/.test(prevChar)) {
        if (buffer) {
          elements.push(<span key={elements.length}>{buffer}</span>);
          buffer = "";
        }
        elements.push(<sub key={elements.length} style={SUB_STYLE}>{numStr}</sub>);
      } else {
        buffer += numStr;
      }
    } else {
      buffer += char;
    }
  }

  if (buffer) {
    elements.push(<span key={elements.length}>{buffer}</span>);
  }

  return <>{elements}</>;
}

// ── Public API ───────────────────────────────────────────────────────────────
export const formatChemicalText = (text) => {
  if (!text) return text;

  // Try explicit markup first
  const markupResult = parseMarkup(text);
  if (markupResult) return markupResult;

  // Fall back to heuristic for un-migrated data
  return parseLegacy(text);
};
