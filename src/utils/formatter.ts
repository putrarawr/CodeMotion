/**
 * Client-side lightweight code formatter & indentation cleaner.
 * Formats JSON, JS/TS, HTML, CSS, Python, SQL, and generic code snippets.
 */
export function formatCode(code: string, language: string): string {
  if (!code || !code.trim()) return code;

  const lang = (language || '').toLowerCase();
  const trimmed = code.trim();

  // 1. JSON Formatter
  if (lang === 'json' || (trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      const parsed = JSON.parse(trimmed);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // If JSON parse fails, fall through to generic formatter
    }
  }

  // 2. SQL Formatter
  if (lang === 'sql') {
    return formatSql(trimmed);
  }

  // 3. CSS Formatter
  if (lang === 'css' || lang === 'scss') {
    return formatCss(trimmed);
  }

  // 4. Generic C-like / TS / JS / Python / HTML Formatter
  return formatGenericIndent(trimmed);
}

function formatSql(sql: string): string {
  const keywords = ['SELECT', 'FROM', 'WHERE', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'JOIN', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE'];
  let formatted = sql;

  keywords.forEach((kw) => {
    const reg = new RegExp(`\\b${kw.replace(/ /g, '\\s+')}\\b`, 'gi');
    formatted = formatted.replace(reg, `\n${kw}`);
  });

  return formatted
    .split('\n')
    .map((line) => line.trim())
    .filter((line, i, arr) => line.length > 0 || (i > 0 && arr[i - 1].length > 0))
    .join('\n')
    .trim();
}

function formatCss(css: string): string {
  let depth = 0;
  const lines = css
    .replace(/\{/g, ' {\n')
    .replace(/\}/g, '\n}\n')
    .replace(/;/g, ';\n')
    .split('\n');

  const result: string[] = [];

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.includes('}')) {
      depth = Math.max(0, depth - 1);
    }

    const indent = '  '.repeat(depth);
    result.push(`${indent}${line}`);

    if (line.includes('{')) {
      depth += 1;
    }
  }

  return result.join('\n');
}

function formatGenericIndent(code: string): string {
  // Convert tabs to 2 spaces and normalize line breaks
  const rawLines = code.replace(/\r\n/g, '\n').replace(/\t/g, '  ').split('\n');

  let depth = 0;
  const result: string[] = [];

  for (let rawLine of rawLines) {
    const trimmedLine = rawLine.trim();

    if (!trimmedLine) {
      // Don't accumulate multiple empty lines
      if (result.length > 0 && result[result.length - 1] !== '') {
        result.push('');
      }
      continue;
    }

    // Check closing brackets at start of line
    const startsWithClosing = /^[}\]\)>]/.test(trimmedLine);
    if (startsWithClosing) {
      depth = Math.max(0, depth - 1);
    }

    const indent = '  '.repeat(depth);
    result.push(`${indent}${trimmedLine}`);

    // Count net opening/closing brackets for next line
    const openBrackets = (trimmedLine.match(/[{[(]/g) || []).length;
    const closeBrackets = (trimmedLine.match(/[}\])]/g) || []).length;
    const net = openBrackets - closeBrackets;

    if (!startsWithClosing) {
      depth = Math.max(0, depth + net);
    } else {
      depth = Math.max(0, depth + Math.max(0, net));
    }
  }

  return result.join('\n');
}
