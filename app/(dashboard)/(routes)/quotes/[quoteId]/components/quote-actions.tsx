"use client"

import axios from "axios";
import { AlertModal } from "@/components/modals/alert-modal";
import { Button } from "@/components/ui/button"
import { toast } from "sonner";
import { useParams } from "next/navigation"
import { useState } from "react";

function QuoteActions(){
    const params = useParams();

    const [loading, setIsLoading] = useState(false)
    const [openExport, setOpenExport] = useState(false)

    const exportQuote = async () => {
        try {
            setOpenExport(false)
            setIsLoading(true)
            const res = await axios.patch(`/api/quotes/${params.quoteId}/export`)
            console.log(res.data)
            toast.success("Flex export completed")
        } catch (error) {
            toast.error("There was a problem with your request.");
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
        <AlertModal 
        isOpen={openExport} 
        onClose={() => setOpenExport(false)} 
        onConfirm={exportQuote} 
        loading={loading}/>
        {/* disabled for demo */}
        <Button onClick={() => setOpenExport(true)} disabled >Export to Flex</Button>
        </>
    )
}

export default QuoteActions;