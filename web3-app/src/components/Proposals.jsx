
import Identicon from 'react-identicons'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { truncate, useGlobalState, daysRemaining } from '../store'
import { payoutBeneficiary } from '../Blockchain.services'
import { toast } from 'react-toastify'

const Proposals = () => {
  const [data] = useGlobalState('proposals')
  const [isStakeholder] = useGlobalState('isStakeholder')

  const [filter, setFilter] = useState('all')
  const [payingId, setPayingId] = useState(null)

  const isExpired = (proposal) =>
    Date.now() >= Number(proposal.duration) * 1000

  const proposals = data.filter((proposal) => {
    if (filter === 'open') return !isExpired(proposal)
    if (filter === 'closed') return isExpired(proposal)
    return true
  })

  const active =
    'bg-blue-600 text-white font-medium text-xs uppercase border border-blue-600'

  const deactive =
    'bg-transparent text-blue-600 font-medium text-xs uppercase border border-blue-600 hover:bg-blue-100'

  const handlePayout = async (id) => {
    if (payingId !== null || !isStakeholder) return

    setPayingId(id)

    try {
      await payoutBeneficiary(id)

      toast.success('Beneficiary successfully Paid Out!')

      setTimeout(() => {
        window.location.reload()
      }, 1200)
    } catch (error) {
      toast.error(error?.message || 'Payout failed')
      setPayingId(null)
    }
  }

  return (
    <div className="flex flex-col p-8">
      <div
        className="flex flex-row justify-center items-center"
        role="group"
      >
        <button
          type="button"
          className={`rounded-l-full px-6 py-2.5 ${
            filter === 'all' ? active : deactive
          }`}
          onClick={() => setFilter('all')}
        >
          All
        </button>

        <button
          type="button"
          className={`px-6 py-2.5 ${
            filter === 'open' ? active : deactive
          }`}
          onClick={() => setFilter('open')}
        >
          Open
        </button>

        <button
          type="button"
          className={`rounded-r-full px-6 py-2.5 ${
            filter === 'closed' ? active : deactive
          }`}
          onClick={() => setFilter('closed')}
        >
          Closed
        </button>
      </div>

      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
          <div className="h-[calc(100vh_-_20rem)] overflow-y-auto shadow-md rounded-md">
            <table className="min-w-full">
              <thead className="border-b dark:border-gray-500">
                <tr>
                  <th className="text-sm font-medium px-6 py-4 text-left">
                    Created By
                  </th>

                  <th className="text-sm font-medium px-6 py-4 text-left">
                    Title
                  </th>

                  <th className="text-sm font-medium px-6 py-4 text-left">
                    Expires
                  </th>

                  <th className="text-sm font-medium px-6 py-4 text-left">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {proposals.map((proposal) => {
                  const expired = isExpired(proposal)

                  const accepted =
                    proposal.upvotes > proposal.downvotes

                  const canPayout =
                    expired &&
                    accepted &&
                    !proposal.paid

                  return (
                    <tr
                      key={proposal.id}
                      className="border-b dark:border-gray-500"
                    >
                      <td className="text-sm font-light px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-row justify-start items-center space-x-3">
                          <Identicon
                            string={proposal.proposer.toLowerCase()}
                            size={25}
                          />

                          <span>
                            {truncate(
                              proposal.proposer,
                              4,
                              4,
                              11
                            )}
                          </span>
                        </div>
                      </td>

                      <td className="text-sm font-light px-6 py-4">
                        {proposal.title.length > 80
                          ? proposal.title.substring(0, 80) + '...'
                          : proposal.title}
                      </td>

                      <td className="text-sm font-light px-6 py-4 whitespace-nowrap">
                        {expired
                          ? 'Expired'
                          : daysRemaining(proposal.duration)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Link
                            to={'/proposal/' + proposal.id}
                            className="rounded-full px-6 py-2.5 text-white bg-blue-600 text-xs uppercase hover:bg-blue-700"
                          >
                            View
                          </Link>

                          {proposal.paid ? (
                            <span className="rounded-full px-6 py-2.5 text-white bg-green-600 text-xs uppercase">
                              Paid
                            </span>
                          ) : canPayout ? (
                            <button
                              type="button"
                              disabled={
                                !isStakeholder ||
                                payingId !== null
                              }
                              className="rounded-full px-6 py-2.5 text-white bg-red-600 text-xs uppercase hover:bg-red-700 disabled:opacity-50"
                              onClick={() =>
                                handlePayout(proposal.id)
                              }
                            >
                              {payingId === proposal.id
                                ? 'Processing...'
                                : 'Payout'}
                            </button>
                          ) : expired ? (
                            <span className="rounded-full px-6 py-2.5 text-white bg-red-600 text-xs uppercase">
                              Rejected
                            </span>
                          ) : (
                            <span className="rounded-full px-6 py-2.5 text-blue-600 border border-blue-600 text-xs uppercase">
                              Pending
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {proposals.length === 0 && (
              <p className="text-center py-8">
                No proposals found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Proposals
