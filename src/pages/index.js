import Image from 'next/image'
import { Inter } from 'next/font/google'
import Explorer from '../components/blockExplorer'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
    <div className={`text-2xl`}>TA Blockchain Explorer</div>
     <Explorer/>
    </main>
  )
}
