/**
 * use-toast.ts
 *
 * Custom hook and toast state manager for Fintrack GenZ Vision.
 * - Provides global toast notification system with queueing, auto-dismiss, and update/dismiss actions.
 * - Implements reducer pattern for predictable state management.
 * - Designed for extensibility and integration with UI components.
 *
 * Dependencies:
 * - React: useState, useEffect
 * - Toast UI components (see '@/components/ui/toast')
 *
 * Data Contracts:
 * - Toasts are objects with id, title, description, action, open, and callbacks.
 * - All state changes are handled via reducer and dispatched actions.
 *
 * Edge Cases & Limitations:
 * - Only one toast is shown at a time (TOAST_LIMIT = 1).
 * - Toasts are auto-dismissed after TOAST_REMOVE_DELAY (default: 1,000,000ms).
 * - Side effects (timeouts) are managed outside reducer for simplicity.
 * - No persistence; all state is in-memory and lost on reload.
 *
 * TODO: Add support for multiple concurrent toasts, persistence, and accessibility improvements.
 * FIXME: Ensure all listeners are cleaned up to prevent memory leaks.
 * NOTE: All toast actions are logged for debugging and traceability.
 */

import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

/**
 * addToRemoveQueue
 * Schedules a toast for removal after TOAST_REMOVE_DELAY.
 * @param {string} toastId - Unique toast identifier
 * @sideEffect Sets a timeout and dispatches REMOVE_TOAST
 * @limitation Only works for toasts currently in state
 */
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }
  // Schedule removal after delay
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)
  toastTimeouts.set(toastId, timeout)
}

/**
 * reducer
 * Handles all toast state transitions based on dispatched actions.
 * @param {State} state - Current toast state
 * @param {Action} action - Action to perform
 * @returns {State} New state after action
 * @sideEffect DISMISS_TOAST triggers addToRemoveQueue (timeout)
 * @edgeCase Only one toast shown at a time (TOAST_LIMIT)
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      // Add new toast, enforce limit
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }
    case "UPDATE_TOAST":
      // Update toast by id
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }
    case "DISMISS_TOAST": {
      const { toastId } = action
      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but kept here for simplicity. Schedules removal for one/all toasts.
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }
      // Mark toast(s) as closed
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      // Remove toast by id or clear all
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

/**
 * dispatch
 * Dispatches an action to update toast state and notifies listeners.
 * @param {Action} action - Action to dispatch
 * @sideEffect Updates memoryState and calls all listeners
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

/**
 * toast
 * Creates a new toast and returns control functions.
 * @param {Toast} props - Toast properties (title, description, etc.)
 * @returns {object} Toast control (id, dismiss, update)
 * @sideEffect Dispatches ADD_TOAST and sets up onOpenChange
 * @edgeCase Only one toast shown at a time
 */
function toast({ ...props }: Toast) {
  const id = genId()
  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })
  return {
    id: id,
    dismiss,
    update,
  }
}

/**
 * useToast
 * Custom React hook to access toast state and actions.
 * @returns {object} Toast state, toast(), and dismiss() function
 * @sideEffect Registers/unregisters listener for state updates
 * @limitation State is in-memory only; not persisted
 */
function useToast() {
  const [state, setState] = React.useState<State>(memoryState)
  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])
  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
