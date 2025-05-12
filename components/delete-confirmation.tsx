import * as React from 'react'
import { Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteConfirmation({ isOpen, onClose, onConfirm }: DeleteConfirmationProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-0.5 bg-red-500/25 rounded-[99px] shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.06)] shadow-[0px_1px_2px_-0.5px_rgba(0,0,0,0.06)] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.16)] border border-red-500/25 justify-center items-center gap-1.5 flex overflow-hidden">
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
            </div>
            <DialogTitle>Delete this todo?</DialogTitle>
          </div>
        </DialogHeader>
        
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            weight="medium"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 