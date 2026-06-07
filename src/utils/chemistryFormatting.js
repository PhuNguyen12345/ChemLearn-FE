const SKIP_FORMATTING_TAGS = new Set(['SCRIPT', 'STYLE']);

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const readBracedArg = (value, openIndex) => {
  if (value[openIndex] !== '{') {
    return null;
  }

  let depth = 0;
  for (let index = openIndex; index < value.length; index += 1) {
    const char = value[index];

    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return {
          value: value.slice(openIndex + 1, index),
          endIndex: index + 1,
        };
      }
    }
  }

  return null;
};

const replaceTexCommand = (value, command, argCount, render) => {
  const marker = `\\${command}`;
  let output = '';
  let cursor = 0;

  while (cursor < value.length) {
    const commandIndex = value.indexOf(marker, cursor);
    if (commandIndex === -1) {
      output += value.slice(cursor);
      break;
    }

    output += value.slice(cursor, commandIndex);

    const args = [];
    let readIndex = commandIndex + marker.length;
    let valid = true;

    for (let argIndex = 0; argIndex < argCount; argIndex += 1) {
      const arg = readBracedArg(value, readIndex);
      if (!arg) {
        valid = false;
        break;
      }

      args.push(arg.value);
      readIndex = arg.endIndex;
    }

    if (!valid) {
      output += marker;
      cursor = commandIndex + marker.length;
      continue;
    }

    output += render(...args);
    cursor = readIndex;
  }

  return output;
};

const normalizeFormulaText = (value) =>
  value
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\mathrm\{([^}]+)\}/g, '$1')
    .replace(/\\cdot/g, '·')
    .replace(/\\approx/g, '≈')
    .replace(/\\rightarrow/g, '→')
    .replace(/\\leftarrow/g, '←')
    .replace(/\\rightleftharpoons/g, '⇌')
    .replace(/\\uparrow/g, '↑')
    .replace(/\\downarrow/g, '↓')
    .replace(/\\circ/g, '°')
    .replace(/\\%/g, '%')
    .replace(/[ \t]{2,}/g, ' ');

const normalizeArrowBase = (value) => normalizeFormulaText(value.trim());

const formatFormulaExpression = (value = '') => {
  let normalized = String(value);

  normalized = replaceTexCommand(
    normalized,
    'frac',
    2,
    (numerator, denominator) =>
      `<span class="chem-fraction"><span>${formatFormulaExpression(numerator)}</span><span>${formatFormulaExpression(denominator)}</span></span>`
  );

  normalized = replaceTexCommand(
    normalized,
    'xrightarrow',
    1,
    (label) =>
      `<span class="chem-reaction-arrow"><span class="chem-arrow-label">${formatFormulaExpression(label)}</span><span>→</span></span>`
  );

  normalized = replaceTexCommand(
    normalized,
    'overset',
    2,
    (label, base) =>
      `<span class="chem-reaction-arrow"><span class="chem-arrow-label">${formatFormulaExpression(label)}</span><span>${normalizeArrowBase(base)}</span></span>`
  );

  return formatSubscriptsAndSuperscripts(escapeHtml(normalizeFormulaText(normalized)))
    .replace(/&lt;(\/?(?:span|sub|sup)\b[^&]*)&gt;/g, '<$1>')
    .replace(/&lt;(span class=&quot;[^&]+&quot;)&gt;/g, '<$1>')
    .replace(/&quot;/g, '"');
};

const formatSubscriptsAndSuperscripts = (value) =>
  value
    .replace(/_\{([^}]+)\}/g, '<sub>$1</sub>')
    .replace(/_([0-9]+)/g, '<sub>$1</sub>')
    .replace(/_([A-Za-z])/g, '<sub>$1</sub>')
    .replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>')
    .replace(/\^([+-]?[0-9]+|[A-Za-z]+|[+-]|°)/g, '<sup>$1</sup>');

const formatPlainChemicalToken = (token) =>
  token.replace(/([A-Za-z)])([0-9]+)/g, '$1<sub>$2</sub>');

const formatPlainChemicalText = (escapedText) => {
  let withTexCommands = escapedText;
  withTexCommands = replaceTexCommand(
    withTexCommands,
    'frac',
    2,
    (numerator, denominator) =>
      `<span class="chem-formula">${formatFormulaExpression(`\\frac{${numerator}}{${denominator}}`)}</span>`
  );
  withTexCommands = replaceTexCommand(
    withTexCommands,
    'xrightarrow',
    1,
    (label) =>
      `<span class="chem-formula">${formatFormulaExpression(`\\xrightarrow{${label}}`)}</span>`
  );
  withTexCommands = replaceTexCommand(
    withTexCommands,
    'overset',
    2,
    (label, base) =>
      `<span class="chem-formula">${formatFormulaExpression(`\\overset{${label}}{${base}}`)}</span>`
  );

  const withSimpleTex = formatSubscriptsAndSuperscripts(normalizeFormulaText(withTexCommands));

  const withTexStyleCompounds = withSimpleTex.replace(
    /(^|[^A-Za-z])((?:[A-Z][a-z]?)(?:(?:_\{?[0-9]+\}?)|[A-Z][a-z]?|[0-9]|[(][A-Za-z0-9_{}]+[)])+(?:\^\{?[+-]?[0-9]*\}?)?)(?=$|[^A-Za-z])/g,
    (match, prefix, token) => {
      if (!/_/.test(token)) {
        return match;
      }

      return `${prefix}<span class="chem-formula">${formatSubscriptsAndSuperscripts(token)}</span>`;
    }
  );

  return withTexStyleCompounds.replace(
    /(^|[^A-Za-z])((?:[A-Z][a-z]?|\([A-Za-z0-9]+\)|[0-9])+(?:[+-])?)(?=$|[^A-Za-z<])/g,
    (match, prefix, token) => {
      if (!/[0-9]/.test(token) || !/^[A-Z(]/.test(token)) {
        return match;
      }

      return `${prefix}<span class="chem-formula">${formatPlainChemicalToken(token)}</span>`;
    }
  );
};

export const formatChemistryText = (text = '') => {
  const source = String(text);
  let output = '';
  let cursor = 0;

  while (cursor < source.length) {
    const start = source.indexOf('$', cursor);
    if (start === -1) {
      output += formatPlainChemicalText(escapeHtml(source.slice(cursor)));
      break;
    }

    const end = source.indexOf('$', start + 1);
    if (end === -1) {
      output += formatPlainChemicalText(escapeHtml(source.slice(cursor)));
      break;
    }

    output += formatPlainChemicalText(escapeHtml(source.slice(cursor, start)));

    output += `<span class="chem-formula">${formatFormulaExpression(source.slice(start + 1, end).trim())}</span>`;
    cursor = end + 1;
  }

  return output;
};

export const formatChemistryHtml = (html = '') => {
  if (!html || typeof window === 'undefined' || !window.DOMParser) {
    return html || '';
  }

  const document = new window.DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const root = document.body.firstElementChild;
  if (!root) {
    return html;
  }

  const walk = (node) => {
    if (node.nodeType === window.Node.TEXT_NODE) {
      const template = document.createElement('template');
      template.innerHTML = formatChemistryText(node.nodeValue);
      node.replaceWith(template.content);
      return;
    }

    if (node.nodeType !== window.Node.ELEMENT_NODE || SKIP_FORMATTING_TAGS.has(node.tagName)) {
      return;
    }

    Array.from(node.childNodes).forEach(walk);
  };

  Array.from(root.childNodes).forEach(walk);
  return root.innerHTML;
};
