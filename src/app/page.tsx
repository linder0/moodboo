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
    <div className="min-h-screen bg-[#e8e0d4] relative">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-[#e8e0d4]/80 backdrop-blur-sm border-b border-[#d0c8ba]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1a1816] flex items-center justify-center">
            <span className="text-[#faf8f5] font-medium text-sm">M</span>
          </div>
          <span className="text-[#1a1816] text-sm font-medium">Moodboard</span>
        </div>
        <CreateBoardDialog onCreateBoard={handleCreateBoard} />
      </header>

      {/* Main Content */}
      <main className="pt-20 px-4 pb-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-6 w-6 animate-spin text-[#6b635a]" />
          </div>
        ) : boards.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="text-[#6b635a] text-sm mb-6">No boards yet</div>
            <CreateBoardDialog onCreateBoard={handleCreateBoard} />
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <div className="text-[#6b635a] text-xs uppercase tracking-wider mb-4">
              {boards.length} {boards.length === 1 ? 'Board' : 'Boards'}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {boards.map((board) => (
                <div
                  key={board.id}
                  className="group relative"
                >
                  <Link
                    href={`/board/${board.id}`}
                    className={cn(
                      "block aspect-[4/3] rounded-xl overflow-hidden",
                      "bg-[#f5f2ed] border border-[#d0c8ba]",
                      "hover:border-[#c0b8aa] hover:shadow-md",
                      "transition-all duration-150"
                    )}
                  >
                    {/* Board preview placeholder */}
                    <div className="h-full w-full flex items-center justify-center p-3">
                      <span className="text-[#a09890] text-xs text-center line-clamp-3">
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
                      <div className="text-[#1a1816] text-sm truncate hover:text-[#6b635a] transition-colors font-medium">
                        {board.title}
                      </div>
                      <div className="text-[#a09890] text-xs">
                        {formatDistanceToNow(board.updated_at)}
                      </div>
                    </Link>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-[#6b635a] hover:text-[#1a1816] hover:bg-[#ddd4c6]"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#f5f2ed] border-[#d0c8ba]">
                        <DropdownMenuItem
                          onClick={() => handleDuplicateBoard(board.id)}
                          className="text-[#1a1816] focus:bg-[#ddd4c6]"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteBoard(board.id)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
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
