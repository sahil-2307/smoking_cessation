'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { BookOpen, Plus, Calendar, Edit } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function JournalPage() {
  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewEntry, setShowNewEntry] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingEntry, setEditingEntry] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: ''
  })
  const [editEntry, setEditEntry] = useState({
    title: '',
    content: '',
    mood: ''
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.user) {
          setLoading(false)
          return
        }

        setUser(session.user)

        // Load journal entries
        const { data: journalData, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', session.user.id as any)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error loading journal entries:', error)
        } else {
          setEntries(journalData || [])
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newEntry.title.trim() || !newEntry.content.trim()) return

    setIsSubmitting(true)
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          title: newEntry.title,
          content: newEntry.content,
          mood: newEntry.mood || null,
          created_at: new Date().toISOString()
        } as any)
        .select()

      if (error) throw error

      alert('Journal entry saved! 📝')
      setNewEntry({ title: '', content: '', mood: '' })
      setShowNewEntry(false)

      // Reload entries
      const { data: updatedEntries } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setEntries(updatedEntries || [])

    } catch (error: any) {
      console.error('Error saving journal entry:', error)
      alert('Error saving entry: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditEntry = (entry: any) => {
    setEditingEntry(entry)
    setEditEntry({
      title: entry.title,
      content: entry.content,
      mood: entry.mood || ''
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !editingEntry || !editEntry.title.trim() || !editEntry.content.trim()) return

    setIsSubmitting(true)
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('journal_entries')
        .update({
          title: editEntry.title,
          content: editEntry.content,
          mood: editEntry.mood || null,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', editingEntry.id as any)

      if (error) throw error

      alert('Journal entry updated! ✏️')
      setIsEditDialogOpen(false)
      setEditingEntry(null)

      // Reload entries
      const { data: updatedEntries } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setEntries(updatedEntries || [])

    } catch (error: any) {
      console.error('Error updating journal entry:', error)
      alert('Error updating entry: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Please log in</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BookOpen className="mr-3 h-8 w-8" />
            Journal
          </h1>
          <p className="text-gray-600 mt-1">Document your quit smoking journey</p>
        </div>
        <Button onClick={() => setShowNewEntry(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Entry
        </Button>
      </div>

      {/* New Entry Form */}
      {showNewEntry && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>New Journal Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Give your entry a title..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newEntry.content}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write about your thoughts, feelings, challenges, or victories..."
                  rows={6}
                  required
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Save Entry</Button>
                <Button type="button" variant="outline" onClick={() => setShowNewEntry(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Journal Entries */}
      <div className="space-y-6">
        {entries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No journal entries yet</h3>
              <p className="text-gray-600 mb-4">Start documenting your quit smoking journey!</p>
              <Button onClick={() => setShowNewEntry(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Write Your First Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{entry.title}</CardTitle>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {new Date(entry.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleEditEntry(entry)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
                {entry.mood && (
                  <div className="mt-4 text-sm text-gray-600">
                    <span className={`px-2 py-1 rounded ${
                      entry.mood === 'excellent' ? 'bg-green-100 text-green-800' :
                      entry.mood === 'good' ? 'bg-blue-100 text-blue-800' :
                      entry.mood === 'okay' ? 'bg-yellow-100 text-yellow-800' :
                      entry.mood === 'difficult' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Entry Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Journal Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateEntry} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editEntry.title}
                onChange={(e) => setEditEntry(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Give your entry a title..."
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={editEntry.content}
                onChange={(e) => setEditEntry(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write about your thoughts, feelings, challenges, or victories..."
                rows={6}
                required
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Entry'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tips */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Journaling Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Write regularly, even if just a few sentences</li>
            <li>• Be honest about your struggles and victories</li>
            <li>• Note what triggers cravings and what helps overcome them</li>
            <li>• Celebrate small wins and progress milestones</li>
            <li>• Use your journal to identify patterns and learn about yourself</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}