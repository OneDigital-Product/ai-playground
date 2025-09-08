"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

const storageKey = "todos:v1";

export default function Page() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  // Load from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setTodos(JSON.parse(raw) as Todo[]);
    } catch {}
  }, []);

  // Persist changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(todos));
    } catch {}
  }, [todos]);

  const visibleTodos = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter((t) => !t.completed);
      case "completed":
        return todos.filter((t) => t.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  function addTodo() {
    const clean = title.trim();
    if (!clean) return;
    const next: Todo = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: clean,
      completed: false,
    };
    setTodos((prev) => [next, ...prev]);
    setTitle("");
  }

  function toggleTodo(id: string) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function removeTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.completed));
  }

  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Card className="gap-4 py-5">
        <CardHeader className="pb-4">
          <CardTitle>To-Dos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a task"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addTodo();
              }}
            />
            <Button onClick={addTodo} aria-label="Add todo">
              <Plus className="size-4" />
              <span className="sr-only">Add</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{remaining} remaining</span>
            <div className="ml-auto flex gap-1">
              <Button variant={filter === "all" ? "default" : "secondary"} size="sm" onClick={() => setFilter("all")}>
                All
              </Button>
              <Button variant={filter === "active" ? "default" : "secondary"} size="sm" onClick={() => setFilter("active")}>
                Active
              </Button>
              <Button
                variant={filter === "completed" ? "default" : "secondary"}
                size="sm"
                onClick={() => setFilter("completed")}
              >
                Completed
              </Button>
            </div>
          </div>

          <ul className="divide-y rounded-md border">
            {visibleTodos.length === 0 && (
              <li className="p-4 text-sm text-muted-foreground">No to-dos</li>
            )}
            {visibleTodos.map((t) => (
              <li key={t.id} className="flex items-center gap-3 p-3">
                <Checkbox checked={t.completed} onCheckedChange={() => toggleTodo(t.id)} />
                <span className={`flex-1 ${t.completed ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
                <Button variant="ghost" size="icon" onClick={() => removeTodo(t.id)} aria-label="Delete">
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={clearCompleted} disabled={todos.every((t) => !t.completed)}>
              Clear completed
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

