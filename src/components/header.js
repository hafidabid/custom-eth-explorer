import Link from "next/link";
import {ArrowLeftIcon} from "@heroicons/react/20/solid";

export default function PageHeader({title}) {
    function back(){
        window.history.back()
    }

    return (
        <div className="bg-red-700 p-4 text-white shadow-md">
            <div className="container mx-auto flex items-center">
                <div className="bg-blue-500 p-4 text-white shadow-md">
                    <div className="container mx-auto flex items-center justify-between">
                        <button onClick={back}>
                            <div className="flex items-center text-white hover:text-blue-200">
                                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                                Back
                            </div>
                        </button>
                        <div className="mr-2 ml-2"></div>


                    </div>
                </div>
                <h1 className="text-4xl font-bold mx-6">{title}</h1>
            </div>
        </div>
    )
}