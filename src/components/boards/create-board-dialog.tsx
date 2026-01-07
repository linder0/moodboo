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
          className="gap-1.5 bg-[#2c2c2c] text-white/80 border border-[#3d3d3d] hover:bg-[#3d3d3d] hover:text-white"
        >
          <Plus className="h-4 w-4" />
          New
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] bg-[#1d1d1d] border-[#3d3d3d]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-white/90 text-lg font-normal">New board</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Board name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="bg-[#2c2c2c] border-[#3d3d3d] text-white placeholder:text-white/30 focus-visible:ring-white/20"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="text-white/50 hover:text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!title.trim() || isLoading}
              className="bg-white text-black hover:bg-white/90"
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
