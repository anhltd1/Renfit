"""In-memory conversation history for MVP."""

from threading import Lock
from typing import Any


class ConversationMemory:
    """Thread-safe store: conversation_id -> list of Anthropic message dicts."""

    def __init__(self, max_turns: int = 40):
        self._store: dict[str, list[dict[str, Any]]] = {}
        self._lock = Lock()
        self._max_messages = max_turns * 2

    def get(self, conversation_id: str) -> list[dict[str, Any]]:
        with self._lock:
            return list(self._store.get(conversation_id, []))

    def append(self, conversation_id: str, message: dict[str, Any]) -> None:
        with self._lock:
            messages = self._store.setdefault(conversation_id, [])
            messages.append(message)
            if len(messages) > self._max_messages:
                self._store[conversation_id] = messages[-self._max_messages :]

    def extend(self, conversation_id: str, new_messages: list[dict[str, Any]]) -> None:
        for msg in new_messages:
            self.append(conversation_id, msg)


# Singleton for app lifetime
_memory = ConversationMemory()


def get_conversation_memory() -> ConversationMemory:
    return _memory
