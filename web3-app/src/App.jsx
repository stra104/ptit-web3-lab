
import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'

import {
  getInfo,
  getProposals,
  isWallectConnected,
} from './Blockchain.services'

import Header from './components/Header'
import Home from './views/Home'
import Proposal from './views/Proposal'

const App = () => {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadBlockchain = async () => {
      try {
        await isWallectConnected()

        await Promise.all([
          getInfo(),
          getProposals(),
        ])
      } catch (error) {
        console.error('Error loading blockchain:', error)
      } finally {
        if (mounted) {
          setLoaded(true)
        }
      }
    }

    loadBlockchain()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-[#212936] dark:text-gray-300">
      <Header />

      {loaded ? (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/proposal/:id"
            element={<Proposal />}
          />
        </Routes>
      ) : (
        <div className="p-8 text-center">
          Loading blockchain data...
        </div>
      )}

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  )
}

export default App
