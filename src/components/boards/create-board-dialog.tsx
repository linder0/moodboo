'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Loader2 } from 'lucide-react'

interface CreateBoardDialogProps {
  onCreateBoard: (title: string, description?: string) => Promise<void>
}

export function CreateBoardDialog({ onCreateBoard }: CreateBoardDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsLoading(true)
    try {
      await onCreateBoard(title.trim())
      setOpen(false)
      setTitle('')
    } catch (error) {
      console.error('Failed to create board:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-1.5 bg-[#1a1816] text-[#e8e0d4] hover:bg-[#2a2826]"
        >
          <Plus className="h-4 w-4" />
          New
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] bg-[#f5f2ed] border-[#d0c8ba]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-[#1a1816] text-lg font-medium">New board</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Board name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="bg-[#e8e0d4] border-[#d0c8ba] text-[#1a1816] placeholder:text-[#8a8278] focus-visible:ring-[#1a1816]/20"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="text-[#6b635a] hover:text-[#1a1816] hover:bg-[#ddd4c6]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!title.trim() || isLoading}
              className="bg-[#1a1816] text-[#e8e0d4] hover:bg-[#2a2826]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
