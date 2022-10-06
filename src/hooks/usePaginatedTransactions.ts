import { useCallback, useState } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"
import { useWrappedRequest } from "./useWrappedRequest"

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { customFetch } = useCustomFetch()
  const { loading, wrappedRequest } = useWrappedRequest()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<
    Transaction[]
  > | null>(null)

  const fetchAll = useCallback(
    (displayPages?: number | null) =>
      wrappedRequest(async () => {
        const response = await customFetch<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
          "paginatedTransactions",
          {
            displayPages: displayPages
          }
        )

        setPaginatedTransactions((previousResponse) => {
          if (previousResponse === null) {
            return response
          }

          return { data: response.data, displayViewMore: response.displayViewMore }
        })
      }),
    [customFetch, paginatedTransactions, wrappedRequest]
  )

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
  }, [])

  return { data: paginatedTransactions, loading, fetchAll, invalidateData }
}
