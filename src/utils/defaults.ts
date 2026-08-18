import type { SnippetSettings, SnippetTab } from '../types';

export const INITIAL_TABS: SnippetTab[] = [
  {
    id: 'tab-1',
    title: 'App.tsx',
    language: 'typescript',
    code: `interface UserProfile {
  id: string;
  username: string;
  role: 'admin' | 'creator' | 'guest';
}

async function fetchSnippet(id: string): Promise<UserProfile> {
  const res = await fetch(\`/api/snippets/\${id}\`);
  if (!res.ok) throw new Error("Failed to load snippet");
  return res.json();
}`,
  },
  {
    id: 'tab-2',
    title: 'styles.css',
    language: 'css',
    code: `.glass-container {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
}`,
  },
  {
    id: 'tab-3',
    title: 'refactor.ts',
    language: 'typescript',
    code: `- function calculatePrice(total) {
-   return total * 1.1;
- }
+ function calculateTotalPrice(subtotal: number, taxRate: number = 0.1): number {
+   const tax = subtotal * taxRate;
+   return Math.round((subtotal + tax) * 100) / 100;
+ }`,
  },
];

export const INITIAL_CODE_SAMPLES: Record<string, string> = {
  typescript: `interface UserProfile {
  id: string;
  username: string;
  role: 'admin' | 'creator' | 'guest';
}

async function fetchSnippet(id: string): Promise<UserProfile> {
  const res = await fetch(\`/api/snippets/\${id}\`);
  if (!res.ok) throw new Error("Failed to load snippet");
  return res.json();
}`,
  javascript: `const calculateMetrics = (items) => {
  return items.reduce((acc, curr) => {
    acc.total += curr.value;
    acc.count += 1;
    return acc;
  }, { total: 0, count: 0 });
};

console.log(calculateMetrics([{ value: 42 }, { value: 18 }]));`,
  python: `def calculate_fibonacci(n: int) -> list[int]:
    """Generate Fibonacci sequence up to n terms."""
    if n <= 0:
        return []
    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence[:n]

print(calculate_fibonacci(8))`,
  rust: `pub fn process_stream(data: &[u8]) -> Result<String, std::io::Error> {
    let mut buffer = String::new();
    for &byte in data {
        if byte.is_ascii_alphanumeric() {
            buffer.push(byte as char);
        }
    }
    Ok(buffer)
}`,
  go: `package main

import "fmt"

func main() {
    messages := make(chan string)
    go func() { messages <- "CodeSnap high performance worker" }()

    msg := <-messages
    fmt.Println(msg)
}`,
};

export const DEFAULT_SETTINGS: SnippetSettings = {
  tabs: INITIAL_TABS,
  activeTabId: 'tab-1',
  diffMode: false,
  theme: 'vitesse-dark',
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: 14,
  lineHeight: 1.5,
  lineNumbers: true,
  padding: 40,
  background: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
  windowStyle: 'macos',
  dropShadow: true,
  shadowBlur: 30,
  watermark: true,
  watermarkText: 'codesnap.dev',
  aspectRatio: 'auto',
  borderRadius: 16,
  appTheme: 'dark',
};
