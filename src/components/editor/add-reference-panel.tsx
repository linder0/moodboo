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
}

export function AddReferencePanel({ boardId, onCardCreated }: AddReferencePanelProps) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [isTextDialogOpen, setIsTextDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [textContent, setTextContent] = useState('')
  const [textTitle, setTextTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsLoading(true)
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`)
          continue
        }

        // Upload file
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

        // Create card
        const cardRes = await fetch('/api/cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            board_id: boardId,
            type: 'image',
            source: 'upload',
            title: file.name.replace(/\.[^/.]+$/, ''),
            thumbnail_url: url,
            file_path: path,
          }),
        })

        if (!cardRes.ok) {
          throw new Error('Failed to create card')
        }

        const card = await cardRes.json()
        onCardCreated(card)
      }
      toast.success('Images uploaded!')
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error('Failed to upload images')
    } finally {
      setIsLoading(false)
      if (imageInputRef.current) {
        imageInputRef.current.value = ''
      }
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsLoading(true)
    try {
      for (const file of Array.from(files)) {
        // Upload file
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

        // Create card
        const cardRes = await fetch('/api/cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            board_id: boardId,
            type: 'file',
            source: 'upload',
            title: file.name,
            thumbnail_url: file.type === 'application/pdf' ? null : url,
            file_path: path,
            url: url,
          }),
        })

        if (!cardRes.ok) {
          throw new Error('Failed to create card')
        }

        const card = await cardRes.json()
        onCardCreated(card)
      }
      toast.success('Files uploaded!')
    } catch (error) {
      console.error('Error uploading files:', error)
      toast.error('Failed to upload files')
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
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
          user_note: textContent.trim(),
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
        onChange={handleImageUpload}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        multiple
        onChange={handleFileUpload}
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
