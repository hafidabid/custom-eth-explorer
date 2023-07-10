import { useState, useEffect } from 'react';

import {makeRPCRequest} from "../../../helper/ethHelper";
import {useRouter} from "next/router";
import PageHeader from "../../../components/header";
import BlockDetail from "../../../components/blockDetail";
import {TxDetail} from "../../../components/txDetail";
import {Inter} from "next/font/google";

const inter = Inter({ subsets: ['latin'] })

export default function TxPage() {
    // Converts the block's gasLimit and gasUsed from Wei to Ether for easier reading
    return(
        <main
            className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
        >
            <PageHeader title={`Address Detail Page`}/>

            <TxDetail/>
        </main>
    )
}
