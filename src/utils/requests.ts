import {
  PaginatedRequestParams,
  PaginatedResponse,
  RequestByEmployeeParams,
  SetTransactionApprovalParams,
  SuccessResponse,
  Transaction,
  Employee,
} from "./types"
import mockData from "../mock-data.json"

const TRANSACTIONS_PER_PAGE = 5

const data: { employees: Employee[]; transactions: Transaction[] } = {
  employees: mockData.employees,
  transactions: mockData.transactions,
}

export const getEmployees = (): Employee[] => data.employees

export const getTransactionsPaginated = ({
  displayPages
}: PaginatedRequestParams): PaginatedResponse<Transaction[]> => {
  const start = 0
  const end = (displayPages === null || displayPages === undefined) ? (start + TRANSACTIONS_PER_PAGE) : displayPages * (start + TRANSACTIONS_PER_PAGE)

  return {
    data: data.transactions.slice(start, Math.min(end, data.transactions.length)),
    displayViewMore: end < data.transactions.length
  }
}

export const getTransactionsByEmployee = ({ employeeId }: RequestByEmployeeParams) => {
  if (!employeeId) {
    throw new Error("Employee id cannot be empty")
  }

  return data.transactions.filter((transaction) => transaction.employee.id === employeeId)
}

export const setTransactionApproval = ({
  transactionId,
  value,
}: SetTransactionApprovalParams): SuccessResponse => {
  const transaction = data.transactions.find(
    (currentTransaction) => currentTransaction.id === transactionId
  )
  if (transaction) {
    transaction.approved = value
    return { success: true }
  }

  return { success: false }
}
