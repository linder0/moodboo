'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Board, ReferenceCard, SynthesisOutput } from '@/lib/types'
import { PDFDocument } from '@/components/export/pdf-document'
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface BoardWithCards extends Board {
  cards: ReferenceCard[]
}

export default function ExportPage() {
  const params = useParams()
  const router = useRouter()
  const boardId = params.id as string

  const [board, setBoard] = useState<BoardWithCards | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const fetchBoard = useCallback(async () => {
    try {
      const response = await fetch(`/api/boards/${boardId}`)
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/')
          return
        }
        throw new Error('Failed to fetch board')
      }
      const data = await response.json()

      if (!data.synthesis_output) {
        toast.error('No brief to export. Run synthesis first.')
        router.push(`/board/${boardId}`)
        return
      }

      setBoard(data)
    } catch (error) {
      console.error('Error fetching board:', error)
      toast.error('Failed to load board')
    } finally {
      setIsLoading(false)
    }
  }, [boardId, router])

  useEffect(() => {
    fetchBoard()
  }, [fetchBoard])

  if (isLoading || !isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!board || !board.synthesis_output) {
    return null
  }

  const pdfDocument = (
    <PDFDocument
      board={{
        title: board.title,
        synthesis_output: board.synthesis_output as SynthesisOutput
      }}
      cards={board.cards}
    />
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/board/${boardId}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-serif text-xl font-medium text-foreground">
                Export Brief
              </h1>
              <p className="text-sm text-muted-foreground">{board.title}</p>
            </div>
          </div>

          <PDFDownloadLink
            document={pdfDocument}
            fileName={`${board.title.toLowerCase().replace(/\s+/g, '-')}-brief.pdf`}
          >
            {({ loading }) => (
              <Button disabled={loading} className="gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download PDF
                  </>
                )}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      </header>

      {/* PDF Preview */}
      <div className="flex-1 bg-muted/30 p-8">
        <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] bg-background rounded-lg overflow-hidden shadow-2xl">
          <PDFViewer width="100%" height="100%" showToolbar={false}>
            {pdfDocument}
          </PDFViewer>
        </div>
      </div>
    </div>
  )
}

