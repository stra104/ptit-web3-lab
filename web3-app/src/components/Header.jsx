
import { Link } from 'react-router-dom'
import { MdLightMode } from 'react-icons/md'
import { FaMoon } from 'react-icons/fa'
import { useEffect, useState } from 'react'

import { truncate, useGlobalState } from '../store'
import { connectWallet } from '../Blockchain.services'

const Header = () => {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  )

  const [connectedAccount] = useGlobalState('connectedAccount')

  const darken = theme === 'dark'

  useEffect(() => {
    const root = document.documentElement

    root.classList.remove('light', 'dark')
    root.classList.add(theme)

    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleLight = () => {
    setTheme((current) =>
      current === 'dark' ? 'light' : 'dark'
    )
  }

  return (
    <header className="sticky top-0 z-50 dark:text-blue-500">
      <nav className="shadow-md py-2 relative flex items-center w-full justify-between bg-white dark:bg-[#212936]">
        <div className="px-6 w-full flex flex-wrap items-center justify-between">
          <div className="grow flex flex-row justify-between items-center p-2">
            <Link
              to="/"
              className="flex flex-row justify-start items-center space-x-3"
            >
              <img
                src="https://haitrieu.com/wp-content/uploads/2021/10/Logo-Hoc-Vien-Cong-Nghe-Buu-Chinh-Vien-Thong-PTITSimple-635x807.png"
                className="w-10 h-10"
                alt="PTIT logo"
              />

              <span className="hidden md:inline dark:text-gray-300 font-bold text-xl">
                PTIT Dominion
              </span>
            </Link>

            <div className="flex flex-row justify-center items-center space-x-5">
              {darken ? (
                <MdLightMode
                  className="cursor-pointer"
                  size={25}
                  onClick={toggleLight}
                />
              ) : (
                <FaMoon
                  className="cursor-pointer"
                  size={25}
                  onClick={toggleLight}
                />
              )}

              {connectedAccount ? (
                <button
                  type="button"
                  className="px-4 py-2.5 bg-blue-600 text-white font-medium text-xs uppercase rounded-full shadow-md dark:text-blue-500 dark:border dark:border-blue-500 dark:bg-transparent"
                >
                  {truncate(connectedAccount, 4, 4, 11)}
                </button>
              ) : (
                <button
                  type="button"
                  className="px-4 py-2.5 bg-blue-600 text-white font-medium text-xs uppercase rounded-full shadow-md hover:bg-blue-700 dark:text-blue-500 dark:border dark:border-blue-500 dark:bg-transparent"
                  onClick={connectWallet}
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
