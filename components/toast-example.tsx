"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function ToastExample() {
  const { toast } = useToast()

  return (
    <Button
      variant="outline"
      onClick={() => {
        toast({
          title: "Sidebar Expand Test",
          description: "If you clicked the sidebar icon in the header and this appeared, the functionality needs to be fixed.",
        })
      }}
    >
      Test Toast
    </Button>
  )
}