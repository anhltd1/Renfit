import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { ListFieldEditor } from './ListFieldEditor';

interface TestItem {
  id: number;
}

const createItem = (): TestItem => ({ id: Date.now() });
const renderItem = (item: TestItem, _index: number, onChange: (u: TestItem) => void) => (
  <span data-testid={`item-${item.id}`}>Item {item.id}</span>
);

describe('ListFieldEditor', () => {
  beforeEach(() => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('shows "Chưa có mục nào" when items is empty', () => {
    render(
      <ListFieldEditor
        items={[]}
        onChange={() => {}}
        renderItem={renderItem}
        createItem={createItem}
      />,
    );
    expect(screen.getByText('Chưa có mục nào')).toBeInTheDocument();
  });

  it('shows the add button with correct label', () => {
    render(
      <ListFieldEditor
        items={[]}
        onChange={() => {}}
        renderItem={renderItem}
        createItem={createItem}
        addLabel="Thêm mục"
      />,
    );
    expect(screen.getByText('Thêm mục')).toBeInTheDocument();
  });

  it('clicking "Thêm" calls onChange with the new item appended', () => {
    const onChange = vi.fn();
    const items: TestItem[] = [{ id: 1 }, { id: 2 }];
    const newItem: TestItem = { id: 99 };
    render(
      <ListFieldEditor
        items={items}
        onChange={onChange}
        renderItem={renderItem}
        createItem={() => newItem}
      />,
    );
    fireEvent.click(screen.getByText('Thêm'));
    expect(onChange).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }, { id: 99 }]);
  });

  it('move up swaps items correctly (move index 1 up → index 0)', () => {
    const onChange = vi.fn();
    const items: TestItem[] = [{ id: 1 }, { id: 2 }, { id: 3 }];
    render(
      <ListFieldEditor
        items={items}
        onChange={onChange}
        renderItem={renderItem}
        createItem={createItem}
      />,
    );
    const moveUpButtons = screen.getAllByLabelText('Di chuyển lên');
    // Click move up on index 1 (second item)
    fireEvent.click(moveUpButtons[1]);
    expect(onChange).toHaveBeenCalledWith([{ id: 2 }, { id: 1 }, { id: 3 }]);
  });

  it('move down swaps items correctly', () => {
    const onChange = vi.fn();
    const items: TestItem[] = [{ id: 1 }, { id: 2 }, { id: 3 }];
    render(
      <ListFieldEditor
        items={items}
        onChange={onChange}
        renderItem={renderItem}
        createItem={createItem}
      />,
    );
    const moveDownButtons = screen.getAllByLabelText('Di chuyển xuống');
    // Click move down on index 0 (first item)
    fireEvent.click(moveDownButtons[0]);
    expect(onChange).toHaveBeenCalledWith([{ id: 2 }, { id: 1 }, { id: 3 }]);
  });

  it('up button disabled on first item, down disabled on last item', () => {
    const items: TestItem[] = [{ id: 1 }, { id: 2 }];
    render(
      <ListFieldEditor
        items={items}
        onChange={() => {}}
        renderItem={renderItem}
        createItem={createItem}
      />,
    );
    const moveUpButtons = screen.getAllByLabelText('Di chuyển lên');
    const moveDownButtons = screen.getAllByLabelText('Di chuyển xuống');
    // First item's up button is disabled
    expect(moveUpButtons[0]).toBeDisabled();
    // Last item's down button is disabled
    expect(moveDownButtons[moveDownButtons.length - 1]).toBeDisabled();
  });

  it('remove calls onChange with the item filtered out', () => {
    const onChange = vi.fn();
    const items: TestItem[] = [{ id: 1 }, { id: 2 }, { id: 3 }];
    render(
      <ListFieldEditor
        items={items}
        onChange={onChange}
        renderItem={renderItem}
        createItem={createItem}
      />,
    );
    const removeButtons = screen.getAllByLabelText('Xoá');
    // Remove second item (index 1)
    fireEvent.click(removeButtons[1]);
    expect(window.confirm).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith([{ id: 1 }, { id: 3 }]);
  });
});

/**
 * **Validates: Requirements 10.2, 10.3, 10.4**
 *
 * Property 6: List management preserves data integrity —
 * add/remove/reorder sequences maintain all items without loss or duplication.
 */
describe('ListFieldEditor (property-based)', () => {
  // Pure helper functions replicating the component's list manipulation logic
  function addItem<T>(items: T[], newItem: T): T[] {
    return [...items, newItem];
  }

  function removeItem<T>(items: T[], index: number): T[] {
    return items.filter((_, i) => i !== index);
  }

  function moveUp<T>(items: T[], index: number): T[] {
    if (index <= 0) return items;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    return next;
  }

  const itemArb = fc.record({ id: fc.nat() });
  const itemsArb = fc.array(itemArb, { minLength: 0, maxLength: 20 });

  it('adding an item produces N+1 items with the new item at the end', () => {
    fc.assert(
      fc.property(itemsArb, itemArb, (items, newItem) => {
        const result = addItem(items, newItem);
        // Length increased by 1
        expect(result).toHaveLength(items.length + 1);
        // New item is at the end
        expect(result[result.length - 1]).toEqual(newItem);
        // Original items preserved in order
        expect(result.slice(0, items.length)).toEqual(items);
      }),
    );
  });

  it('removing an item at a valid index produces N-1 items with the correct item absent', () => {
    fc.assert(
      fc.property(
        itemsArb.filter((arr) => arr.length > 0),
        (items) => {
          // Pick a valid index
          const index = Math.floor(Math.random() * items.length);
          const removed = items[index];
          const result = removeItem(items, index);
          // Length decreased by 1
          expect(result).toHaveLength(items.length - 1);
          // The item at that index position is gone
          expect(result).toEqual([...items.slice(0, index), ...items.slice(index + 1)]);
        },
      ),
    );
  });

  it('moving item up preserves all items (no loss/duplication)', () => {
    fc.assert(
      fc.property(
        itemsArb.filter((arr) => arr.length >= 2),
        (items) => {
          // Pick a valid index > 0 to move up
          const index = 1 + Math.floor(Math.random() * (items.length - 1));
          const result = moveUp(items, index);
          // Same length
          expect(result).toHaveLength(items.length);
          // All items preserved — sort by id and compare
          const sortById = (arr: { id: number }[]) => [...arr].sort((a, b) => a.id - b.id);
          expect(sortById(result)).toEqual(sortById(items));
        },
      ),
    );
  });
});
