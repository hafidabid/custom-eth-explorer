import { useState, useEffect } from 'react';

import {makeRPCRequest} from "../../../helper/ethHelper";
import {useRouter} from "next/router";
import {Inter} from "next/font/google";
import PageHeader from "../../../components/header";
import AddressDetail from "../../../components/addressDetail";

const inter = Inter({ subsets: ['latin'] })

export default function AddressPage() {
    // Converts the block's gasLimit and gasUsed from Wei to Ether for easier reading
    return (
        <main
            className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
        >
            <PageHeader title={`Transaction Detail Page`}/>

            <AddressDetail/>
        </main>
    )
}
