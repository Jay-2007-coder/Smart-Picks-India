export interface Token {
  type: "keyword" | "string" | "comment" | "number" | "function" | "class" | "plain";
  value: string;
}

export function tokenize(code: string, language: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  const length = code.length;

  const lang = language.toLowerCase();
  const isJsLike = lang === "javascript" || lang === "typescript" || lang === "js" || lang === "ts" || lang === "tsx" || lang === "jsx";
  const isPython = lang === "python" || lang === "py";
  const isJava = lang === "java";
  const isCpp = lang === "c++" || lang === "cpp" || lang === "c";

  const jsKeywords = new Set([
    "const", "let", "var", "function", "return", "if", "else", "for", "while", "do",
    "switch", "case", "break", "continue", "import", "export", "from", "class", "extends",
    "new", "this", "typeof", "instanceof", "async", "await", "try", "catch", "finally",
    "throw", "default", "null", "undefined", "true", "false", "in", "of"
  ]);

  const pyKeywords = new Set([
    "def", "return", "if", "elif", "else", "for", "while", "break", "continue", "import",
    "from", "class", "try", "except", "finally", "raise", "assert", "pass", "lambda",
    "yield", "global", "nonlocal", "in", "is", "and", "or", "not", "None", "True", "False",
    "with", "as"
  ]);

  const javaKeywords = new Set([
    "public", "private", "protected", "class", "interface", "enum", "extends", "implements",
    "import", "package", "return", "if", "else", "for", "while", "do", "switch", "case",
    "break", "continue", "new", "this", "super", "instanceof", "try", "catch", "finally",
    "throw", "throws", "static", "final", "abstract", "synchronized", "volatile",
    "transient", "native", "void", "int", "double", "float", "long", "short", "byte",
    "char", "boolean", "true", "false", "null"
  ]);

  const cppKeywords = new Set([
    "auto", "const", "double", "float", "int", "long", "short", "struct", "unsigned", "void",
    "volatile", "class", "namespace", "using", "public", "private", "protected", "template",
    "typename", "this", "new", "delete", "throw", "try", "catch", "inline", "virtual",
    "friend", "explicit", "operator", "return", "if", "else", "for", "while", "do",
    "switch", "case", "break", "continue", "true", "false", "nullptr", "include", "define"
  ]);

  const keywords = isJsLike
    ? jsKeywords
    : isPython
    ? pyKeywords
    : isJava
    ? javaKeywords
    : isCpp
    ? cppKeywords
    : jsKeywords;

  while (index < length) {
    const remaining = code.slice(index);

    // 1. Comments
    // JS/Java/C++ single line comments
    if ((isJsLike || isJava || isCpp) && remaining.startsWith("//")) {
      const endOfLine = remaining.indexOf("\n");
      const val = endOfLine === -1 ? remaining : remaining.slice(0, endOfLine);
      tokens.push({ type: "comment", value: val });
      index += val.length;
      continue;
    }
    // JS/Java/C++ block comments
    if ((isJsLike || isJava || isCpp) && remaining.startsWith("/*")) {
      const endComment = remaining.indexOf("*/");
      const val = endComment === -1 ? remaining : remaining.slice(0, endComment + 2);
      tokens.push({ type: "comment", value: val });
      index += val.length;
      continue;
    }
    // Python comments
    if (isPython && remaining.startsWith("#")) {
      const endOfLine = remaining.indexOf("\n");
      const val = endOfLine === -1 ? remaining : remaining.slice(0, endOfLine);
      tokens.push({ type: "comment", value: val });
      index += val.length;
      continue;
    }

    // 2. Strings
    // Double quotes
    if (remaining.startsWith('"')) {
      let val = '"';
      let i = 1;
      while (i < remaining.length) {
        const char = remaining[i];
        val += char;
        if (char === '"' && remaining[i - 1] !== "\\") {
          break;
        }
        i++;
      }
      tokens.push({ type: "string", value: val });
      index += val.length;
      continue;
    }
    // Single quotes
    if (remaining.startsWith("'")) {
      let val = "'";
      let i = 1;
      while (i < remaining.length) {
        const char = remaining[i];
        val += char;
        if (char === "'" && remaining[i - 1] !== "\\") {
          break;
        }
        i++;
      }
      tokens.push({ type: "string", value: val });
      index += val.length;
      continue;
    }
    // JS Template Literals
    if (isJsLike && remaining.startsWith("`")) {
      let val = "`";
      let i = 1;
      while (i < remaining.length) {
        const char = remaining[i];
        val += char;
        if (char === "`" && remaining[i - 1] !== "\\") {
          break;
        }
        i++;
      }
      tokens.push({ type: "string", value: val });
      index += val.length;
      continue;
    }

    // 3. Numbers
    const numberMatch = remaining.match(/^0x[0-9a-fA-F]+\b|^\b\d+(\.\d+)?\b/);
    if (numberMatch) {
      tokens.push({ type: "number", value: numberMatch[0] });
      index += numberMatch[0].length;
      continue;
    }

    // 4. Identifiers & Keywords & Functions & Classes
    const wordMatch = remaining.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
    if (wordMatch) {
      const word = wordMatch[0];
      if (keywords.has(word)) {
        tokens.push({ type: "keyword", value: word });
      } else if (remaining.slice(word.length).trimStart().startsWith("(")) {
        tokens.push({ type: "function", value: word });
      } else if (/^[A-Z]/.test(word)) {
        tokens.push({ type: "class", value: word });
      } else {
        tokens.push({ type: "plain", value: word });
      }
      index += word.length;
      continue;
    }

    // 5. White space and separators
    const char = remaining[0];
    tokens.push({ type: "plain", value: char });
    index += 1;
  }

  return tokens;
}

export interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
}

export function computeDiff(original: string, modified: string): DiffLine[] {
  const originalLines = original.split("\n");
  const modifiedLines = modified.split("\n");
  
  const diff: DiffLine[] = [];
  let i = 0, j = 0;
  
  while (i < originalLines.length || j < modifiedLines.length) {
    if (i < originalLines.length && j < modifiedLines.length) {
      if (originalLines[i] === modifiedLines[j]) {
        diff.push({ type: "unchanged", content: originalLines[i] });
        i++;
        j++;
      } else {
        let matchFound = false;
        // Check for line additions/removals with a small window lookahead
        for (let lookAhead = 1; lookAhead <= 5; lookAhead++) {
          if (i + lookAhead < originalLines.length && originalLines[i + lookAhead] === modifiedLines[j]) {
            // lines in original up to lookAhead were deleted
            for (let k = 0; k < lookAhead; k++) {
              diff.push({ type: "removed", content: originalLines[i + k] });
            }
            i += lookAhead;
            matchFound = true;
            break;
          }
          if (j + lookAhead < modifiedLines.length && originalLines[i] === modifiedLines[j + lookAhead]) {
            // lines in modified up to lookAhead were added
            for (let k = 0; k < lookAhead; k++) {
              diff.push({ type: "added", content: modifiedLines[j + k] });
            }
            j += lookAhead;
            matchFound = true;
            break;
          }
        }
        
        if (!matchFound) {
          diff.push({ type: "removed", content: originalLines[i] });
          diff.push({ type: "added", content: modifiedLines[j] });
          i++;
          j++;
        }
      }
    } else if (i < originalLines.length) {
      diff.push({ type: "removed", content: originalLines[i] });
      i++;
    } else {
      diff.push({ type: "added", content: modifiedLines[j] });
      j++;
    }
  }
  
  return diff;
}

export interface ThemeConfig {
  bg: string;
  text: string;
  border: string;
  headerBg: string;
  lineNumberColor: string;
  tokenColors: {
    keyword: string;
    string: string;
    comment: string;
    number: string;
    function: string;
    class: string;
    plain: string;
  };
}

export const THEME_STYLES: Record<string, ThemeConfig> = {
  vscode: {
    bg: "bg-[#1e1e1e]",
    text: "text-[#d4d4d4]",
    border: "border-neutral-850",
    headerBg: "bg-[#252526]",
    lineNumberColor: "text-[#858585]/70",
    tokenColors: {
      keyword: "#569cd6",
      string: "#ce9178",
      comment: "#6a9955",
      number: "#b5cea8",
      function: "#dcdcaa",
      class: "#4ec9b0",
      plain: "#d4d4d4",
    }
  },
  dracula: {
    bg: "bg-[#282a36]",
    text: "text-[#f8f8f2]",
    border: "border-purple-950/20",
    headerBg: "bg-[#191a21]",
    lineNumberColor: "text-[#6272a4]/75",
    tokenColors: {
      keyword: "#ff79c6",
      string: "#f1fa8c",
      comment: "#6272a4",
      number: "#bd93f9",
      function: "#50fa7b",
      class: "#8be9fd",
      plain: "#f8f8f2",
    }
  },
  onedark: {
    bg: "bg-[#282c34]",
    text: "text-[#abb2bf]",
    border: "border-slate-800/80",
    headerBg: "bg-[#21252b]",
    lineNumberColor: "text-[#4b5263]/75",
    tokenColors: {
      keyword: "#c678dd",
      string: "#98c379",
      comment: "#5c6370",
      number: "#d19a66",
      function: "#61afef",
      class: "#e5c07b",
      plain: "#abb2bf",
    }
  },
  monokai: {
    bg: "bg-[#272822]",
    text: "text-[#f8f8f2]",
    border: "border-[#1e1f1c]",
    headerBg: "bg-[#1e1f1c]",
    lineNumberColor: "text-[#75715e]/75",
    tokenColors: {
      keyword: "#f92672",
      string: "#e6db74",
      comment: "#75715e",
      number: "#ae81ff",
      function: "#66d9ef",
      class: "#a6e22e",
      plain: "#f8f8f2",
    }
  },
  github: {
    bg: "bg-[#f6f8fa] dark:bg-neutral-900",
    text: "text-[#24292e] dark:text-[#e1e4e8]",
    border: "border-neutral-200 dark:border-neutral-800",
    headerBg: "bg-[#ebf0f4] dark:bg-neutral-950",
    lineNumberColor: "text-[#959da5] dark:text-neutral-500",
    tokenColors: {
      keyword: "#d73a49",
      string: "#032f62",
      comment: "#6a737d",
      number: "#005cc5",
      function: "#6f42c1",
      class: "#e36209",
      plain: "#24292e",
    }
  }
};
