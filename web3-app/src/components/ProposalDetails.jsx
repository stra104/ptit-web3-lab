
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
} from 'recharts'

import { voteOnProposal } from '../Blockchain.services'
import { useGlobalState, daysRemaining } from '../store'

const ProposalDetails = () => {
  const { id } = useParams()

  const [proposal, setProposal] = useState(null)
  const [data, setData] = useState([])
  const [voting, setVoting] = useState(false)

  const [isStakeholder] = useGlobalState('isStakeholder')
  const [proposals] = useGlobalState('proposals')

  useEffect(() => {
    const selected = proposals.find(
      (item) => String(item.id) === String(id)
    )

    if (!selected) {
      setProposal(null)
      setData([])
      return
    }

    setProposal(selected)

    setData([
      {
        name: 'Voters',
        Acceptees: selected.upvotes,
        Rejectees: selected.downvotes,
      },
    ])
  }, [id, proposals])

  const onVote = async (choice) => {
    if (!proposal || voting) return

    if (Date.now() >= Number(proposal.duration) * 1000) {
      toast.warning('Proposal expired!')
      return
    }

    setVoting(true)

    try {
      await voteOnProposal(id, choice)

      toast.success('Voted successfully!')

      setTimeout(() => {
        window.location.reload()
      }, 1200)
    } catch (error) {
      toast.error(error?.message || 'Vote failed')
      setVoting(false)
    }
  }

  if (!proposal) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold">
          Proposal not found
        </h2>
      </div>
    )
  }

  const isOpened =
    Date.now() < Number(proposal.duration) * 1000

  const canVote =
    isStakeholder &&
    isOpened &&
    !proposal.paid

  return (
    <div className="p-8">
      <h2 className="font-semibold text-3xl mb-5">
        {proposal.title}
      </h2>

      <p>
        This proposal is to payout{' '}
        <strong>{proposal.amount} ETH</strong>
        {' '}and currently has{' '}
        <strong>
          {proposal.upvotes + proposal.downvotes} votes
        </strong>
        {' '}and will expire in{' '}
        <strong>
          {daysRemaining(proposal.duration)}
        </strong>
      </p>

      <hr className="my-6 border-gray-300 dark:border-gray-500" />

      <p>{proposal.description}</p>

      <div className="flex flex-row justify-start items-center w-full mt-4 overflow-auto">
        <BarChart width={730} height={250} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Acceptees" fill="#2563eb" />
          <Bar dataKey="Rejectees" fill="#dc2626" />
        </BarChart>
      </div>

      <div
        className="flex flex-row justify-start items-center space-x-3 mt-4"
        role="group"
      >
        {canVote ? (
          <>
            <button
              type="button"
              disabled={voting}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium text-xs uppercase rounded-full shadow-md hover:bg-blue-700 disabled:opacity-50"
              onClick={() => onVote(true)}
            >
              {voting ? 'Processing...' : 'Accept'}
            </button>

            <button
              type="button"
              disabled={voting}
              className="px-6 py-2.5 bg-red-600 text-white font-medium text-xs uppercase rounded-full shadow-md hover:bg-red-700 disabled:opacity-50"
              onClick={() => onVote(false)}
            >
              Reject
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}

export default ProposalDetails
