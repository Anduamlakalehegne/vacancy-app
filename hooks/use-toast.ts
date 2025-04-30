"use client"

import type React from "react"

// Adapted from: https://ui.shadcn.com/docs/components/toast
import { useState, useEffect, useCallback } from "react"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type UseToastOptions = {
  duration?: number
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

export const useToast = () => {
  const [toasts, setToasts] = useState<ToasterToast[]>([])

  useEffect(() => {
    return () => {
      toastTimeouts.forEach((timeout) => {
        clearTimeout(timeout)
      })
      toastTimeouts.clear()
    }
  }, [])

  const dismiss = useCallback((toastId?: string) => {
    setToasts((toasts) => {
      if (toastId) {
        return toasts.filter((t) => t.id !== toastId)
      }
      return []
    })
  }, [])

  const toast = useCallback(
    ({
      title,
      description,
      action,
      variant = "default",
      duration = 5000,
    }: {
      title?: string
      description?: string
      action?: React.ReactNode
      variant?: "default" | "destructive"
      duration?: number
    }) => {
      const id = genId()

      setToasts((toasts) => {
        const newToasts = [
          {
            id,
            title,
            description,
            action,
            variant,
          },
          ...toasts,
        ].slice(0, TOAST_LIMIT)

        return newToasts
      })

      const timeout = setTimeout(() => {
        setToasts((toasts) => toasts.filter((t) => t.id !== id))
        toastTimeouts.delete(id)
      }, duration)

      toastTimeouts.set(id, timeout)

      return id
    },
    [],
  )

  return {
    toast,
    dismiss,
    toasts,
  }
}
