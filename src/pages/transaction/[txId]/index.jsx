import { useState, useEffect } from 'react';

import {makeRPCRequest} from "../../../helper/ethHelper";
import {useRouter} from "next/router";

export default function TxPage() {
    // Converts the block's gasLimit and gasUsed from Wei to Ether for easier reading
    const [txInfo, setTxInfo] = useState(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    useEffect(() => {
        if(router.isReady){
            const txId = router.query["txId"]
            if(!txId && router.isReady){
                alert("tx id UNDEFINED/NULL")
                window.location.replace("/")
                return
            }
            const run = async () =>{
                if (txId) {
                    const txDataResult = await makeRPCRequest("eth_getTransactionReceipt",[txId] )

                    if(!txDataResult)
                        throw "can't find tx data in merkle tree, insert hash please!"

                    setTxInfo(txDataResult)
                    console.log(txDataResult)
                }
            }
            console.log("bid is", txId)
            setLoading(true)
            run().then(()=>setLoading(false)).catch(e=>{
                alert(`error: ${e}`)
                window.location.replace("/")
                return
            })
        }

    }, [router.isReady]);

    return (
        <>
            {
                !loading? (
                    <div className="p-4">
                        <h1 className="text-3xl font-bold mb-4">Transaction {router.query["txId"]}</h1>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="border border-gray-200 rounded p-4 shadow-md">
                                <h2 className="text-xl font-bold mb-2">Transaction Information</h2>
                                <p><strong>Hash: </strong>{txInfo.hash}</p>
                                <p><strong>Nonce: </strong>{txInfo.nonce}</p>
                            </div>

                        </div>
                    </div>
                ) : <div>
                    <h2 className="text-xl font-bold mb-2">Loading ...</h2>
                </div>
            }
        </>
    )
}
