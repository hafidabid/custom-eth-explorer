import { useState, useEffect } from 'react';

import {makeRPCRequest} from "../../../helper/ethHelper";
import {useRouter} from "next/router";

export default function AddressPage() {
    // Converts the block's gasLimit and gasUsed from Wei to Ether for easier reading
    const [addressInfo, setAddressInfo] = useState(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    useEffect(() => {
        if(router.isReady){
            const addressPointed = router.query["addr"]
            console.log("rq",router.query)
            if(!addressPointed && router.isReady){
                alert("block id UNDEFINED/NULL")
                window.location.replace("/")
                return
            }
            const run = async () =>{
                if (addressPointed) {
                    const blockData = await makeRPCRequest("eth_getBlockByHash",[addressPointed] )

                    if(!blockData)
                        throw "can't find block data in merkle tree, insert hash please!"

                    setAddressInfo(blockData)
                    console.log(blockData)
                }
            }
            console.log("bid is", addressPointed)
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
                        <h1 className="text-3xl font-bold mb-4">Address {addressInfo.number}</h1>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="border border-gray-200 rounded p-4 shadow-md">
                                <h2 className="text-xl font-bold mb-2">Block Information</h2>
                                <p><strong>Hash: </strong>{addressInfo.hash}</p>
                                <p><strong>Nonce: </strong>{addressInfo.nonce}</p>
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
