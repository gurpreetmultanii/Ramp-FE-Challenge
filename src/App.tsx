import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { Employee } from "./utils/types"
import { InputSelect } from "./components/InputSelect"
import { TransactionPane } from "./components/TransactionPane"
import { Instructions } from "./components/Instructions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [employeesIsLoading, setEmployeesIsLoading] = useState(false)
  const [paginatedTransactionsIsLoading, setPaginatedTransactionsIsLoading] = useState(false)
  const [displayViewMore, setDisplayViewMore] = useState(true);
  const [pagesDisplayed, setPagesDisplayed] = useState(1);

  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  )

  const transactionsDisplayViewMore = useMemo(
    () => paginatedTransactions?.displayViewMore ?? null,
    [paginatedTransactions]
  )

  const loadAllTransactions = useCallback(async () => {
    if (displayViewMore) {
      setPagesDisplayed((prev) => prev + 1);
    }
    setDisplayViewMore(true);
    setEmployeesIsLoading(true)
    setPaginatedTransactionsIsLoading(true)
    transactionsByEmployeeUtils.invalidateData()

    await employeeUtils.fetchAll()
    setEmployeesIsLoading(false)
    
    await paginatedTransactionsUtils.fetchAll(pagesDisplayed)
    setPaginatedTransactionsIsLoading(false)
  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      paginatedTransactionsUtils.invalidateData()
      setDisplayViewMore(false)
      setPagesDisplayed(1)
      console.log(pagesDisplayed)
      await transactionsByEmployeeUtils.fetchById(employeeId)
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions()
    }
  }, [employeeUtils.loading, employees, loadAllTransactions])

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          employeesIsLoading={employeesIsLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return
            } else if (newValue.id === "All") {
              await loadAllTransactions()
            } else {
              await loadTransactionsByEmployee(newValue.id)
            }
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          {transactions === null ? (
            <div className="RampLoading--container">Loading...</div>
          ) : (
            <Fragment>
              <div data-testid="transaction-container">
                {transactions.map((transaction) => (
                  <TransactionPane key={transaction.id} transaction={transaction} />
                ))}
              </div>
              {displayViewMore && transactionsDisplayViewMore && (<button
                className="RampButton"
                disabled={paginatedTransactionsUtils.loading}
                onClick={async () => {
                  await loadAllTransactions()
                }}
              >
                View More
              </button>
              )}
            </Fragment>
          )}
        </div>
      </main>
    </Fragment>
  )
}
