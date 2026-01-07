'use client'

import { useEffect, useState } from 'react'
import { Board } from '@/lib/types'
import { CreateBoardDialog } from '@/components/boards/create-board-dialog'
import { toast } from 'sonner'
import { Loader2, MoreHorizontal, Trash2, Copy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn, formatDistanceToNow } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const router = useRouter()
  const [boards, setBoards] = useState<Board[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchBoards()
  }, [])

  const fetchBoards = async () => {
    try {
      const response = await fetch('/api/boards')
      if (!response.ok) throw new Error('Failed to fetch boards')
      const data = await response.json()
      setBoards(data)
    } catch (error) {
      console.error('Error fetching boards:', error)
      toast.error('Failed to load boards')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateBoard = async (title: string, description?: string) => {
    const response = await fetch('/api/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    })

    if (!response.ok) {
      throw new Error('Failed to create board')
    }

    const newBoard = await response.json()
    toast.success('Board created!')
    router.push(`/board/${newBoard.id}`)
  }

  const handleDeleteBoard = async (id: string) => {
    if (!confirm('Are you sure you want to delete this board?')) return

    try {
      const response = await fetch(`/api/boards/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete board')

      setBoards(boards.filter(b => b.id !== id))
      toast.success('Board deleted')
    } catch (error) {
      console.error('Error deleting board:', error)
      toast.error('Failed to delete board')
    }
  }

  const handleDuplicateBoard = async (id: string) => {
    const board = boards.find(b => b.id === id)
    if (!board) return

    try {
      await handleCreateBoard(`${board.title} (Copy)`, board.description || undefined)
    } catch (error) {
      console.error('Error duplicating board:', error)
      toast.error('Failed to duplicate board')
    }
  }

  return (
    <div className="min-h-screen bg-[#1d1d1d]">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#2c2c2c] flex items-center justify-center border border-[#3d3d3d]">
            <span className="text-white/90 font-medium text-sm">C</span>
          </div>
          <span className="text-white/80 text-sm font-medium">Canvas</span>
        </div>
        <CreateBoardDialog onCreateBoard={handleCreateBoard} />
      </header>

      {/* Main Content */}
      <main className="pt-20 px-4 pb-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-6 w-6 animate-spin text-white/40" />
          </div>
        ) : boards.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="text-white/40 text-sm mb-6">No boards yet</div>
            <CreateBoardDialog onCreateBoard={handleCreateBoard} />
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-4">
              {boards.length} {boards.length === 1 ? 'Board' : 'Boards'}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {boards.map((board) => (
                <div
                  key={board.id}
                  className="group relative"
                >
                  <Link
                    href={`/board/${board.id}`}
                    className={cn(
                      "block aspect-[4/3] rounded-lg overflow-hidden",
                      "bg-[#2c2c2c] border border-[#3d3d3d]",
                      "hover:border-[#4d4d4d] hover:bg-[#333333]",
                      "transition-colors duration-150"
                    )}
                  >
                    {/* Board preview placeholder */}
                    <div className="h-full w-full flex items-center justify-center p-3">
                      <span className="text-white/20 text-xs text-center line-clamp-3">
                        {board.description || 'Empty canvas'}
                      </span>
                    </div>
                  </Link>

                  {/* Title and menu row */}
                  <div className="flex items-center justify-between mt-2 gap-1">
                    <Link
                      href={`/board/${board.id}`}
                      className="flex-1 min-w-0"
                    >
                      <div className="text-white/80 text-sm truncate hover:text-white transition-colors">
                        {board.title}
                      </div>
                      <div className="text-white/30 text-xs">
                        {formatDistanceToNow(board.updated_at)}
                      </div>
                    </Link>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-white/50 hover:text-white hover:bg-white/10"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#2c2c2c] border-[#3d3d3d]">
                        <DropdownMenuItem
                          onClick={() => handleDuplicateBoard(board.id)}
                          className="text-white/70 focus:text-white focus:bg-white/10"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteBoard(board.id)}
                          className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
