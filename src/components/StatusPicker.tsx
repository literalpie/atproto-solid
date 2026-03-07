"use client";
import { For } from "solid-js";

const EMOJIS = [
  "👍",
  "👎",
  "💙",
  "🔥",
  "😆",
  "😢",
  "🤔",
  "😴",
  "🎉",
  "🤩",
  "😭",
  "🥳",
  "😤",
  "💀",
  "✨",
  "👀",
  "🙏",
  "📚",
  "💻",
  "🍕",
  "🌴",
];

interface StatusPickerProps {
  status?: string | undefined;
  setStatus: (status: string) => void;
  isPending: boolean;
}

export function StatusPicker(props: StatusPickerProps) {
  return (
    <div>
      <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-3">Set your status</p>
      <div class="flex flex-wrap gap-2">
        <For each={EMOJIS}>
          {(emoji) => (
            <button
              onClick={() => props.setStatus(emoji)}
              disabled={props.isPending}
              class={`text-2xl p-2 rounded-lg transition-all
              ${
                props.status === emoji
                  ? "bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }
              disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {emoji} {props.status === emoji ? "(selected)" : null}
            </button>
          )}
        </For>
      </div>
    </div>
  );
}
