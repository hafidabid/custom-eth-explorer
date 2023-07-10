import {useRouter} from "next/router";
import {hexToInt, makeRPCRequest} from "../helper/ethHelper";
import {useEffect, useState} from "react";
import {AppConfig} from "../../app_config";

export default function AddressDetail(){
    const [addressInfo, setAddressInfo] = useState(null)
    const [balance, setAddrBalance] = useState(null)
    const [transactionCount, setTxCount] = useState(null)
    const [loading, setLoading] = useState(true)
    const [transactions, setTransactions] = useState([]);

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
                    const balanceResult = await makeRPCRequest("eth_getBalance",[addressPointed, "latest"] )
                    const txCountResult = await makeRPCRequest("eth_getTransactionCount", [addressPointed, "latest"])

                    if(!(balanceResult && txCountResult))
                        throw "can't find address data in merkle tree, insert hash please!"

                    setAddrBalance(hexToInt(balanceResult))
                    setTxCount(hexToInt(txCountResult))
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
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl font-bold mb-4">Address Detail</h1>

                        <div className="space-y-8">
                            <div className="bg-white p-4 shadow rounded">
                                <h2 className="text-2xl font-bold mb-2">Your Address</h2>
                                <p>{router.query["addr"]}</p>
                            </div>

                            <div className="bg-white p-4 shadow rounded">
                                <h2 className="text-2xl font-bold mb-2">Balance</h2>
                                <p>{balance/Math.pow(10,18)} {AppConfig.tokenSymbol}</p>
                            </div>

                            <div className="bg-white p-4 shadow rounded">
                                <h2 className="text-2xl font-bold mb-2">Transaction Count</h2>
                                <p>{transactionCount}</p>
                            </div>

                            <div className="bg-white p-4 shadow rounded">
                                <h2 className="text-2xl font-bold mb-2">Transactions</h2>
                                {/* Display a list of transactions here */}
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