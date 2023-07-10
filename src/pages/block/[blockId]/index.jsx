import BlockDetail from "../../../components/blockDetail";
import {Inter} from "next/font/google";
import PageHeader from "../../../components/header";
const inter = Inter({ subsets: ['latin'] })
export default function Block() {

    return (
        <main
            className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
        >
            <PageHeader title={`Block Detail Page`}/>

            <BlockDetail/>
        </main>
    )
}
