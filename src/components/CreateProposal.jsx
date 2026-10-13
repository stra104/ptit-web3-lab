
import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { setGlobalState, useGlobalState } from '../store'
import { raiseProposal } from '../Blockchain.services'
import { toast } from 'react-toastify'

const CreateProposal = () => {
  const [createModal] = useGlobalState('createModal')

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [beneficiary, setBeneficiary] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const resetForm = () => {
    setTitle('')
    setAmount('')
    setBeneficiary('')
    setDescription('')
  }

  const closeModal = () => {
    if (submitting) return

    setGlobalState('createModal', 'scale-0')
    resetForm()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title || !description || !beneficiary || !amount) {
      toast.warning('Please fill in all fields')
      return
    }

    if (
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0
    ) {
      toast.warning('Invalid proposal amount')
      return
    }

    if (!window.web3?.utils.isAddress(beneficiary)) {
      toast.warning('Invalid beneficiary address')
      return
    }

    if (submitting) return

    const proposal = {
      title,
      description,
      beneficiary,
      amount,
    }

    setSubmitting(true)

    try {
      await raiseProposal(proposal)

      toast.success('Proposal created successfully!')

      setGlobalState('createModal', 'scale-0')
      resetForm()

      setTimeout(() => {
        window.location.reload()
      }, 1200)
    } catch (error) {
      toast.error(error?.message || 'Proposal creation failed')
      setSubmitting(false)
    }
  }

  const inputClass =
    'block w-full text-sm bg-transparent border border-gray-400 rounded-xl px-3 py-3 focus:outline-none dark:border-gray-500'

  return (
    <div
      className={`fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black bg-opacity-50 transform z-50 transition-transform duration-300 ${createModal}`}
    >
      <div className="bg-white dark:bg-[#212936] shadow-xl rounded-xl w-11/12 md:w-2/5 p-6">
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <div className="flex flex-row justify-between items-center">
            <p className="font-semibold">Raise Proposal</p>

            <button
              type="button"
              onClick={closeModal}
              disabled={submitting}
              className="border-0 bg-transparent focus:outline-none"
            >
              <FaTimes />
            </button>
          </div>

          <div className="mt-5">
            <input
              className={inputClass}
              type="text"
              name="title"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="mt-5">
            <input
              className={inputClass}
              type="number"
              min="0"
              step="any"
              name="amount"
              placeholder="Amount in ETH"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="mt-5">
            <input
              className={inputClass}
              type="text"
              name="beneficiary"
              placeholder="Beneficiary Address"
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
              required
            />
          </div>

          <div className="mt-5">
            <textarea
              className={`${inputClass} h-24 resize-none`}
              name="description"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg px-6 py-2.5 bg-blue-600 text-white font-medium text-xs uppercase hover:bg-blue-700 transition duration-150 mt-5 disabled:opacity-50"
          >
            {submitting ? 'Processing...' : 'Submit Proposal'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateProposal
