'use client'

import { useState, useRef } from 'react'
import { ReferenceCard } from '@/lib/types'
import { detectSourceFromUrl } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Plus,
  Image,
  Link2,
  FileText,
  Type,
  Loader2,
  Upload
} from 'lucide-react'
import { toast } from 'sonner'

interface AddReferencePanelProps {
  boardId: string
  onCardCreated: (card: ReferenceCard) => void
  onCardAnalyzed?: (cardId: string, analysis: ReferenceCard['analysis']) => void
}

// Trigger AI vision analysis for a card (fire-and-forget, runs in background)
async function triggerCardAnalysis(
  cardId: string,
  onAnalyzed?: (cardId: string, analysis: ReferenceCard['analysis']) => void
) {
  try {
    const response = await fetch(`/api/cards/${cardId}/analyze`, {
      method: 'POST',
    })

    if (response.ok) {
      const { analysis } = await response.json()
      onAnalyzed?.(cardId, analysis)
    }
  } catch (error) {
    // Silent failure - analysis is non-blocking
    console.error('Background analysis failed:', error)
  }
}

export function AddReferencePanel({ boardId, onCardCreated, onCardAnalyzed }: AddReferencePanelProps) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [isTextDialogOpen, setIsTextDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [textContent, setTextContent] = useState('')
  const [textTitle, setTextTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Unified upload handler for both images and files
  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    uploadType: 'image' | 'file'
  ) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const inputRef = uploadType === 'image' ? imageInputRef : fileInputRef
    const typeLabel = uploadType === 'image' ? 'Images' : 'Files'

    setIsLoading(true)
    try {
      for (const file of Array.from(files)) {
        // Validate image type for image uploads
        if (uploadType === 'image' && !file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`)
          continue
        }

        // Upload file to storage
        const formData = new FormData()
        formData.append('file', file)
        formData.append('board_id', boardId)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) {
          throw new Error('Upload failed')
        }

        const { path, url } = await uploadRes.json()

        // Build card data based on upload type
        const cardData = uploadType === 'image'
          ? {
              board_id: boardId,
              type: 'image',
              source: 'upload',
              title: file.name.replace(/\.[^/.]+$/, ''),
              thumbnail_url: url,
              file_path: path,
            }
          : {
              board_id: boardId,
              type: 'file',
              source: 'upload',
              title: file.name,
              thumbnail_url: file.type === 'application/pdf' ? null : url,
              file_path: path,
              source_url: url,
            }

        // Create card
        const cardRes = await fetch('/api/cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cardData),
        })

        if (!cardRes.ok) {
          throw new Error('Failed to create card')
        }

        const card = await cardRes.json()
        onCardCreated(card)

        // TODO: Re-enable AI analysis when ready
        // if (uploadType === 'image') {
        //   triggerCardAnalysis(card.id, onCardAnalyzed)
        // }
      }
      toast.success(`${typeLabel} uploaded!`)
    } catch (error) {
      console.error(`Error uploading ${typeLabel.toLowerCase()}:`, error)
      toast.error(`Failed to upload ${typeLabel.toLowerCase()}`)
    } finally {
      setIsLoading(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const handleLinkSubmit = async () => {
    if (!linkUrl.trim()) return

    setIsLoading(true)
    try {
      // Fetch link preview
      const previewRes = await fetch('/api/link-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: linkUrl.trim() }),
      })

      const preview = await previewRes.json()
      const source = detectSourceFromUrl(linkUrl.trim())

      // Create card
      const cardRes = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board_id: boardId,
          type: 'link',
          source,
          title: preview.title || linkUrl.trim(),
          thumbnail_url: preview.image,
          url: linkUrl.trim(),
        }),
      })

      if (!cardRes.ok) {
        throw new Error('Failed to create card')
      }

      const card = await cardRes.json()
      onCardCreated(card)

      // TODO: Re-enable AI analysis when ready
      // if (card.thumbnail_url) {
      //   triggerCardAnalysis(card.id, onCardAnalyzed)
      // }

      setLinkUrl('')
      setIsLinkDialogOpen(false)
      toast.success('Link added!')
    } catch (error) {
      console.error('Error adding link:', error)
      toast.error('Failed to add link')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTextSubmit = async () => {
    if (!textContent.trim()) return

    setIsLoading(true)
    try {
      const cardRes = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board_id: boardId,
          type: 'text',
          source: 'upload',
          title: textTitle.trim() || 'Text note',
          notes: textContent.trim(),
        }),
      })

      if (!cardRes.ok) {
        throw new Error('Failed to create card')
      }

      const card = await cardRes.json()
      onCardCreated(card)
      setTextContent('')
      setTextTitle('')
      setIsTextDialogOpen(false)
      toast.success('Note added!')
    } catch (error) {
      console.error('Error adding text:', error)
      toast.error('Failed to add note')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add Reference
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => imageInputRef.current?.click()}>
              <Image className="h-4 w-4 mr-2" />
              Upload Images
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsLinkDialogOpen(true)}>
              <Link2 className="h-4 w-4 mr-2" />
              Paste Link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsTextDialogOpen(true)}>
              <Type className="h-4 w-4 mr-2" />
              Add Text Note
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <p className="text-sm text-muted-foreground">
          Drop images, paste links, or add notes
        </p>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleUpload(e, 'image')}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        multiple
        onChange={(e) => handleUpload(e, 'file')}
        className="hidden"
      />

      {/* Link Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Add Link</DialogTitle>
            <DialogDescription>
              Paste a URL from Instagram, Pinterest, TikTok, YouTube, or any website.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLinkSubmit()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLinkSubmit} disabled={!linkUrl.trim() || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Link'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Text Dialog */}
      <Dialog open={isTextDialogOpen} onOpenChange={setIsTextDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Add Text Note</DialogTitle>
            <DialogDescription>
              Add a text snippet or creative direction note.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="text-title">Title (optional)</Label>
              <Input
                id="text-title"
                placeholder="e.g., Color direction"
                value={textTitle}
                onChange={(e) => setTextTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="text-content">Content</Label>
              <Textarea
                id="text-content"
                placeholder="Your creative notes..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={4}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsTextDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTextSubmit} disabled={!textContent.trim() || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Note'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
