import {
  type Component,
  createEffect,
  createSignal,
  For,
  Show,
} from "solid-js";
import { createStore, produce } from "solid-js/store";

import styles from "./App.module.css";

const initialValue = [...new Array(5)].map((_, index) => ({
  id: index + 1,
  name: `Todo ${index + 1}`,
  completed: false,
  editing: false,
}));

const filters = {
  COMPLETED: "Completed",
  NOT_COMPLETED: "Not Completed",
};

export const App: Component = () => {
  let inputRef: HTMLInputElement;

  const [filter, setFilter] = createSignal(filters.NOT_COMPLETED);
  const [state, setState] = createStore(
    structuredClone(initialValue) as typeof initialValue
  );

  const handleToggle = (id: number) =>
    setState(
      (todo) => todo.id === id,
      "completed",
      (completed) => !completed
    );

  const handleUncheckAll = () => setState({}, () => ({ completed: false }));
  const handleCompleteAll = () => setState({}, () => ({ completed: true }));
  const handleResetAll = () => {
    setFilter(filters.NOT_COMPLETED);
    inputRef.value = "";
    setState(structuredClone(initialValue));
  };

  const handleAddTodo = () => {
    if (!inputRef.value) return;

    setState(
      produce((todos) => {
        todos.push({
          id: todos.length + 1,
          name: inputRef.value,
          completed: false,
          editing: false,
        });
      })
    );

    inputRef.value = "";
    inputRef.focus();
  };

  createEffect(() => {
    console.log("effect", { ...state[0] });
    console.log("initialValue", initialValue);
  });

  const handleRemove = (id: number) => {
    setState(
      produce((todos) => {
        const foundIndex = todos.findIndex((todo) => todo.id === id);

        todos.splice(foundIndex, 1);
      })
    );
  };

  const handleFilter = (filter: keyof typeof filters) => setFilter(filter);

  const filteredTodos = () => {
    const isFilteringComplete = filter() === filters.COMPLETED;

    return state.filter((todo) => todo.completed === isFilteringComplete);
  };

  createEffect(() => {
    console.log(filteredTodos().map((todo) => ({ ...todo })));
  });

  const handleToggleEdit = (id: number) => {
    setState((todo) => todo.id === id, "editing", true);
  };

  const handleEdit = (
    id: number,
    e: KeyboardEvent & { currentTarget: HTMLInputElement; target: Element }
  ) => {
    const key = e.key;
    const value = e.currentTarget.value;

    if (!["Enter", "Escape"].includes(key)) return;

    setState((todo) => todo.id === id, { editing: false, name: value });
  };

  const handleRealtimeEdit = (
    id: number,
    e: InputEvent & { currentTarget: HTMLInputElement; target: Element }
  ) => {
    const value = e.currentTarget.value;

    setState((todo) => todo.id === id, { editing: false, name: value });
  };

  return (
    <div class={styles.App}>
      <h1>Todos</h1>

      <div style={{ display: "flex", gap: "16px" }}>
        <For each={Object.entries(filters)}>
          {([key, text]) => (
            <button
              style={{ background: filter() === text ? "lightblue" : "" }}
              onClick={[handleFilter, text]}
            >
              {text}
            </button>
          )}
        </For>
      </div>

      <div style={{ display: "flex", gap: "16px" }}>
        <button onClick={handleUncheckAll}>Uncheck All</button>
        <button onClick={handleCompleteAll}>Complete All</button>
        <button onClick={handleResetAll}>Reset</button>
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <input placeholder="Todo" ref={inputRef!} />
        <button onClick={handleAddTodo}>Add</button>
      </div>

      <div style={{ display: "flex", "flex-direction": "column", gap: "16px" }}>
        <For each={filteredTodos()} fallback={<div>No todos...</div>}>
          {(item) => {
            const newName = () => {
              return `( ${item.name} - 1337 )`;
            };

            return (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  "justify-content": "center",
                  "align-items": "center",
                }}
              >
                <Show
                  keyed={false}
                  when={item.editing}
                  fallback={
                    <span ondblclick={[handleToggleEdit, item.id]}>
                      {item.name}
                    </span>
                  }
                >
                  <input value={item.name} onKeyDown={[handleEdit, item.id]} />
                </Show>

                <span>{newName}</span>

                <input
                  type="checkbox"
                  checked={item.completed}
                  onClick={[handleToggle, item.id]}
                />
                <button onClick={[handleRemove, item.id]}>Remove</button>

                <input
                  value={item.name}
                  onInput={[handleRealtimeEdit, item.id]}
                />
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
};
