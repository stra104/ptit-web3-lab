
import { useState } from 'react'
import { useGlobalState, setGlobalState } from '../store'
import { toast } from 'react-toastify'
import { performContribute } from '../Blockchain.services'

const Banner = () => {
  const [isStakeholder] = useGlobalState('isStakeholder')
  const [proposals] = useGlobalState('proposals')
  const [balance] = useGlobalState('balance')
  const [mybalance] = useGlobalState('mybalance')
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onPropose = () => {
    if (!isStakeholder) return
    setGlobalState('createModal', 'scale-100')
  }

  const onContribute = async () => {
    if (
      !amount ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0
    ) {
      toast.warning('Please enter a valid ETH amount')
      return
    }

    if (submitting) return

    setSubmitting(true)

    try {
      await performContribute(amount)
      toast.success('Contribution received')

      setTimeout(() => {
        window.location.reload()
      }, 1200)
    } catch (error) {
      toast.error(error?.message || 'Contribution failed')
      setSubmitting(false)
    }
  }

  const opened = () =>
    proposals.filter(
      (proposal) =>
        Date.now() < Number(proposal.duration) * 1000
    ).length

  return (
    <div className="p-8">
      <h2 className="font-semibold text-3xl mb-5">
        {opened()} Proposal
        {opened() === 1 ? '' : 's'} Currently Opened
      </h2>

      <p>
        Current DAO Balance:
        <strong> {balance} ETH</strong>
        <br />

        Your contributions:
        <strong> {mybalance} ETH</strong>

        {isStakeholder
          ? ', and you are now a stakeholder 😊'
          : null}
      </p>

      <hr className="my-6 border-gray-300 dark:border-gray-500" />

      <p>
        {isStakeholder
          ? 'You can now raise proposals on this platform 😆'
          : 'Contribute at least 0.01 ETH to become a stakeholder 😎'}
      </p>

      <div className="flex flex-row justify-start items-center md:w-1/3 w-full mt-4">
        <input
          type="number"
          min="0"
          step="any"
          className="block w-full px-3 py-2 text-base border border-gray-300 rounded shadow-md focus:outline-none dark:border-gray-500 dark:bg-transparent"
          placeholder="e.g 0.01 ETH"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="flex flex-row justify-start items-center space-x-3 mt-4">
        <button
          type="button"
          disabled={submitting}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium text-xs uppercase rounded-full hover:bg-blue-700 disabled:opacity-50"
          onClick={onContribute}
        >
          {submitting ? 'Processing...' : 'Contribute'}
        </button>

        {isStakeholder && (
          <button
            type="button"
            className="px-6 py-2.5 bg-blue-600 text-white font-medium text-xs uppercase rounded-full hover:bg-blue-700"
            onClick={onPropose}
          >
            Propose
          </button>
        )}
      </div>
    </div>
  )
}

export default Banner
