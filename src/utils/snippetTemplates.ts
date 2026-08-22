import type { SupportedLanguage, SupportedTheme } from '../types';

export interface SnippetTemplate {
  id: string;
  name: string;
  category: string;
  language: SupportedLanguage;
  fileName: string;
  code: string;
  theme: SupportedTheme;
  themeName: string;
  background: string;
  bgLabel: string;
}

export const SNIPPET_TEMPLATES: SnippetTemplate[] = [
  // 1. React Custom Hook (Deep Indigo + Vitesse Dark)
  {
    id: 'react-hook',
    name: 'React Custom Hook',
    category: 'React',
    language: 'typescript',
    fileName: 'useDebounce.ts',
    theme: 'vitesse-dark',
    themeName: 'Vitesse Dark',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    bgLabel: 'Deep Indigo',
    code: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}`,
  },
  // 2. React Component (Dracula Violet + Dracula)
  {
    id: 'react-component',
    name: 'React Component',
    category: 'React',
    language: 'typescript',
    fileName: 'Button.tsx',
    theme: 'dracula',
    themeName: 'Dracula',
    background: 'linear-gradient(135deg, #1e1035 0%, #282a36 100%)',
    bgLabel: 'Dracula Violet',
    code: `interface ButtonProps {
  label: string;
  variant?: 'primary' | 'ghost';
  onClick: () => void;
}

export function Button({ label, variant = 'primary', onClick }: ButtonProps) {
  const base = 'px-4 py-2 rounded-lg font-medium transition-colors';
  const styles = variant === 'primary'
    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
    : 'bg-transparent border border-zinc-700 text-zinc-300';

  return (
    <button className={\`\${base} \${styles}\`} onClick={onClick}>
      {label}
    </button>
  );
}`,
  },
  // 3. FastAPI Route (Emerald Dark + Tokyo Night)
  {
    id: 'python-fastapi',
    name: 'FastAPI Route',
    category: 'Python',
    language: 'python',
    fileName: 'main.py',
    theme: 'tokyo-night',
    themeName: 'Tokyo Night',
    background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
    bgLabel: 'Emerald Dark',
    code: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float
    in_stock: bool = True

items: dict[str, Item] = {}

@app.post("/items/{item_id}")
async def create_item(item_id: str, item: Item):
    if item_id in items:
        raise HTTPException(status_code=400, detail="Item exists")
    items[item_id] = item
    return {"id": item_id, **item.model_dump()}`,
  },
  // 4. Python Decorator (Catppuccin Berry + Mocha)
  {
    id: 'python-decorator',
    name: 'Python Decorator',
    category: 'Python',
    language: 'python',
    fileName: 'decorators.py',
    theme: 'catppuccin-mocha',
    themeName: 'Catppuccin Mocha',
    background: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)',
    bgLabel: 'Berry Violet',
    code: `import functools
import time

def timer(func):
    """Measure execution time of a function."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

@timer
def process_data(n: int) -> list[int]:
    return [i ** 2 for i in range(n)]`,
  },
  // 5. Rust Struct + Impl (Amber Rust + One Dark Pro)
  {
    id: 'rust-struct',
    name: 'Rust Struct + Impl',
    category: 'Rust',
    language: 'rust',
    fileName: 'config.rs',
    theme: 'one-dark-pro',
    themeName: 'One Dark Pro',
    background: 'linear-gradient(135deg, #451a03 0%, #1c1917 100%)',
    bgLabel: 'Amber Rust',
    code: `use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct Config {
    entries: HashMap<String, String>,
}

impl Config {
    pub fn new() -> Self {
        Self { entries: HashMap::new() }
    }

    pub fn set(&mut self, key: &str, value: &str) {
        self.entries.insert(key.into(), value.into());
    }

    pub fn get(&self, key: &str) -> Option<&str> {
        self.entries.get(key).map(|v| v.as_str())
    }
}`,
  },
  // 6. Go HTTP Handler (Nordic Slate + Nord)
  {
    id: 'go-http-handler',
    name: 'Go HTTP Handler',
    category: 'Go',
    language: 'go',
    fileName: 'handler.go',
    theme: 'nord',
    themeName: 'Nord Theme',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    bgLabel: 'Nordic Slate',
    code: `package main

import (
    "encoding/json"
    "log"
    "net/http"
)

type Response struct {
    Status  string \`json:"status"\`
    Message string \`json:"message"\`
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(Response{
        Status:  "ok",
        Message: "Service is running",
    })
}

func main() {
    http.HandleFunc("/health", healthHandler)
    log.Fatal(http.ListenAndServe(":8080", nil))
}`,
  },
  // 7. Express API Route (Obsidian Black + GitHub Dark)
  {
    id: 'js-express-api',
    name: 'Express API Route',
    category: 'JavaScript',
    language: 'javascript',
    fileName: 'routes.js',
    theme: 'github-dark',
    themeName: 'GitHub Dark',
    background: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
    bgLabel: 'Obsidian Black',
    code: `const express = require('express');
const router = express.Router();

const users = new Map();

router.get('/users/:id', (req, res) => {
  const user = users.get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

router.post('/users', (req, res) => {
  const { name, email } = req.body;
  const id = crypto.randomUUID();
  users.set(id, { id, name, email });
  res.status(201).json({ id, name, email });
});

module.exports = router;`,
  },
  // 8. Swift Codable Model (Minimal Mist + Catppuccin Latte)
  {
    id: 'swift-model',
    name: 'Swift Codable Model',
    category: 'Swift',
    language: 'swift',
    fileName: 'User.swift',
    theme: 'catppuccin-latte',
    themeName: 'Catppuccin Latte',
    background: 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)',
    bgLabel: 'Minimal Slate Light',
    code: `import Foundation

struct User: Codable, Identifiable {
    let id: UUID
    var name: String
    var email: String
    var role: Role

    enum Role: String, Codable {
        case admin, editor, viewer
    }
}

extension User {
    static func decode(from data: Data) throws -> User {
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return try decoder.decode(User.self, from: data)
    }
}`,
  },
  // 9. SQL Analytics Query (Studio White + GitHub Light)
  {
    id: 'sql-query',
    name: 'SQL Analytics Query',
    category: 'SQL',
    language: 'sql',
    fileName: 'analytics.sql',
    theme: 'github-light',
    themeName: 'GitHub Light',
    background: 'linear-gradient(135deg, #ffffff 0%, #f4f4f5 100%)',
    bgLabel: 'Studio White',
    code: `SELECT
    u.name,
    COUNT(o.id) AS total_orders,
    SUM(o.amount) AS total_spent,
    ROUND(AVG(o.amount), 2) AS avg_order
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY u.id, u.name
HAVING total_orders > 3
ORDER BY total_spent DESC
LIMIT 10;`,
  },
  // 10. Glassmorphism Card (Ocean Blue + Vitesse Light)
  {
    id: 'css-glass',
    name: 'Glassmorphism Card',
    category: 'CSS',
    language: 'css',
    fileName: 'glass.css',
    theme: 'vitesse-light',
    themeName: 'Vitesse Light',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
    bgLabel: 'Deep Ocean',
    code: `.glass-card {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
}`,
  },
];

export const TEMPLATE_CATEGORIES = [...new Set(SNIPPET_TEMPLATES.map((t) => t.category))];
