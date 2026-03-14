import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

// --- str_replace_editor commands ---

test("ToolCallBadge shows 'Creating [filename]' for str_replace_editor create", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "src/components/Button.tsx" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("ToolCallBadge shows 'Editing [filename]' for str_replace_editor str_replace", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "2",
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "src/App.tsx" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Editing App.tsx")).toBeDefined();
});

test("ToolCallBadge shows 'Editing [filename]' for str_replace_editor insert", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "3",
        toolName: "str_replace_editor",
        args: { command: "insert", path: "src/App.tsx" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Editing App.tsx")).toBeDefined();
});

test("ToolCallBadge shows 'Reading [filename]' for str_replace_editor view", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "4",
        toolName: "str_replace_editor",
        args: { command: "view", path: "src/index.ts" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Reading index.ts")).toBeDefined();
});

test("ToolCallBadge shows 'Undoing edit in [filename]' for str_replace_editor undo_edit", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "5",
        toolName: "str_replace_editor",
        args: { command: "undo_edit", path: "src/App.tsx" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Undoing edit in App.tsx")).toBeDefined();
});

// --- file_manager commands ---

test("ToolCallBadge shows 'Renaming [filename]' for file_manager rename", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "6",
        toolName: "file_manager",
        args: { command: "rename", path: "src/Old.tsx", new_path: "src/New.tsx" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Renaming Old.tsx")).toBeDefined();
});

test("ToolCallBadge shows 'Deleting [filename]' for file_manager delete", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "7",
        toolName: "file_manager",
        args: { command: "delete", path: "src/components/Unused.tsx" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Deleting Unused.tsx")).toBeDefined();
});

// --- Basename extraction ---

test("ToolCallBadge extracts basename from deeply nested path", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "8",
        toolName: "str_replace_editor",
        args: { command: "create", path: "src/components/ui/forms/Input.tsx" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Creating Input.tsx")).toBeDefined();
});

test("ToolCallBadge handles path with no slashes", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "9",
        toolName: "str_replace_editor",
        args: { command: "create", path: "App.tsx" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Creating App.tsx")).toBeDefined();
});

// --- State rendering ---

test("ToolCallBadge shows spinner when state is not result", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "10",
        toolName: "str_replace_editor",
        args: { command: "create", path: "src/App.tsx" },
        state: "call",
      }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolCallBadge shows spinner when state is result but result is falsy", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "11",
        toolName: "str_replace_editor",
        args: { command: "create", path: "src/App.tsx" },
        state: "result",
        result: undefined,
      }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolCallBadge shows green dot when state is result and result is truthy", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "12",
        toolName: "str_replace_editor",
        args: { command: "create", path: "src/App.tsx" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

// --- Edge cases ---

test("ToolCallBadge falls back to raw tool name for unknown tool", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "13",
        toolName: "some_unknown_tool",
        args: {},
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("some_unknown_tool")).toBeDefined();
});

test("ToolCallBadge handles empty args (no command, no path) gracefully", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "14",
        toolName: "str_replace_editor",
        args: {},
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

test("ToolCallBadge handles missing path for file_manager delete", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "15",
        toolName: "file_manager",
        args: { command: "delete" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Deleting file")).toBeDefined();
});

test("ToolCallBadge applies correct card styling classes", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "16",
        toolName: "str_replace_editor",
        args: { command: "create", path: "src/App.tsx" },
        state: "call",
      }}
    />
  );
  const root = container.firstElementChild;
  expect(root?.className).toContain("inline-flex");
  expect(root?.className).toContain("bg-neutral-50");
  expect(root?.className).toContain("rounded-lg");
  expect(root?.className).toContain("border-neutral-200");
});
