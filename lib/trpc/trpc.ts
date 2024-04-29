import { initTRPC } from '@trpc/server'
import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import type { State } from '../../routes/_middleware.ts'

export const t = initTRPC.context<ReturnType<typeof createContext>>().create({
  errorFormatter({ error, shape }) {
    return {
      ...shape,
      message:
        error.cause instanceof ZodError
          ? fromZodError(error.cause).message
          : shape.message,
    }
  },
})
export const createContext = (state: State) => () => ({ state })
