"use client"

import * as React from "react"
import { Search, Inbox, Send, Archive, Trash2, Clock, Mail as MailIcon, User, Sparkles, Loader2, BellOff } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { formatDistanceToNow, addHours } from "date-fns"
import { signIn } from "next-auth/react"

export default function InboxPage() {
  const [mails, setMails] = React.useState<any[]>([])
  const [archivedMails, setArchivedMails] = React.useState<any[]>([])
  const [snoozedMails, setSnoozedMails] = React.useState<any[]>([])
  const [selectedMail, setSelectedMail] = React.useState<any | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [replyText, setReplyText] = React.useState("")
  const [isGeneratingDraft, setIsGeneratingDraft] = React.useState(false)
  const [isSending, setIsSending] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [toast, setToast] = React.useState<{msg: string, type: 'success'|'error'}|null>(null)

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  React.useEffect(() => {
    async function fetchEmails() {
      try {
        const res = await fetch("/api/gmail")
        const data = await res.json()
        if (res.ok) {
          setMails(data.messages || [])
          if (data.messages?.length > 0) setSelectedMail(data.messages[0])
        } else {
          setError(data.error || "Please connect your Google account to view your Inbox.")
        }
      } catch (err) {
        setError("Failed to fetch emails")
      } finally {
        setIsLoading(false)
      }
    }
    fetchEmails()
  }, [])

  const handleGenerateDraft = async () => {
    if (!selectedMail) return
    setIsGeneratingDraft(true)
    try {
      const res = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: selectedMail.subject, from: selectedMail.from, snippet: selectedMail.snippet })
      })
      const data = await res.json()
      if (res.ok && data.draft) {
        setReplyText(data.draft)
        if (data.notice) {
          showToast('⚠️ AI quota exceeded — using smart template. Resets daily.', 'error')
        } else {
          showToast('✨ AI draft generated!')
        }
      }
    } catch (e) {
      console.error('Draft generation failed', e)
      showToast('Failed to generate draft.', 'error')
    } finally {
      setIsGeneratingDraft(false)
    }
  }


  const handleArchive = () => {
    if (!selectedMail) return
    setArchivedMails(prev => [{ ...selectedMail, archivedAt: new Date() }, ...prev])
    setMails(prev => prev.filter(m => m.id !== selectedMail.id))
    setSelectedMail(null)
    showToast('Email archived. View it in the Archived tab.')
  }

  const handleDelete = () => {
    if (!selectedMail) return
    setMails(prev => prev.filter(m => m.id !== selectedMail.id))
    setSelectedMail(null)
    showToast('Email moved to trash.')
  }

  const handleSnooze = () => {
    if (!selectedMail) return
    const snoozeUntil = addHours(new Date(), 1)
    setSnoozedMails(prev => [{ ...selectedMail, snoozeUntil }, ...prev])
    setMails(prev => prev.filter(m => m.id !== selectedMail.id))
    setSelectedMail(null)
    showToast('Email snoozed for 1 hour. View it in the Snoozed tab.')
  }

  const handleUnsnooze = (mail: any) => {
    setSnoozedMails(prev => prev.filter(m => m.id !== mail.id))
    setMails(prev => [mail, ...prev])
    showToast('Email returned to inbox.')
  }

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMail) return
    setIsSending(true)
    try {
      const to = selectedMail.from.match(/<(.+)>/)?.[1] || selectedMail.from
      
      const res = await fetch('/api/gmail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject: selectedMail.subject.startsWith('Re:') ? selectedMail.subject : `Re: ${selectedMail.subject}`,
          message: replyText,
          threadId: selectedMail.threadId
        })
      })

      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)
      
      showToast(`Reply sent to ${to}`)
      setReplyText('')
    } catch (e: any) {
      showToast(e.message || 'Failed to send reply.', 'error')
    } finally {
      setIsSending(false)
    }
  }

  const filteredMails = mails.filter(m =>
    m.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.from?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.snippet?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderMailList = (mailList: any[], emptyIcon: React.ReactNode, emptyText: string, extra?: (mail: any) => React.ReactNode) => (
    <ScrollArea className="flex-1 overflow-y-auto">
      {mailList.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-full mt-8">
          {emptyIcon}
          <p className="text-sm mt-3">{emptyText}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-3">
          {mailList.map((mail) => (
            <div key={mail.id} className="relative group">
              <button
                className={`w-full flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-secondary/50 ${
                  selectedMail?.id === mail.id ? "bg-secondary/80 border-primary/50 ring-1 ring-primary/50" : "bg-card border-border/50"
                }`}
                onClick={() => setSelectedMail(mail)}
              >
                <div className="flex w-full flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-xs">{mail.from?.split('<')[0] || mail.from}</div>
                      {!mail.read && <span className="flex h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(mail.date), { addSuffix: true })}
                    </div>
                  </div>
                  <div className="text-xs font-medium text-foreground/90">{mail.subject}</div>
                </div>
                <div className="line-clamp-2 text-xs text-muted-foreground">{mail.snippet || "No preview available"}</div>
              </button>
              {extra && <div className="mt-1">{extra(mail)}</div>}
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  )

  const emailViewer = selectedMail ? (
    <>
      <div className="flex items-center p-4 border-b border-border/50 gap-3">
        <div className="flex items-center gap-3 text-sm flex-1 min-w-0">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
            {(selectedMail.from?.split('<')[0]?.[0] || 'U').toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{selectedMail.from?.split('<')[0] || selectedMail.from}</div>
            <div className="text-muted-foreground text-xs">{formatDistanceToNow(new Date(selectedMail.date), { addSuffix: true })}</div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={handleSnooze} title="Snooze for 1 hour" className="p-2 hover:bg-secondary rounded-md text-muted-foreground hover:text-yellow-400 transition-colors">
            <Clock className="h-4 w-4" />
          </button>
          <button onClick={handleArchive} title="Archive" className="p-2 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors">
            <Archive className="h-4 w-4" />
          </button>
          <button onClick={handleDelete} title="Delete" className="p-2 hover:bg-red-500/10 rounded-md text-muted-foreground hover:text-red-400 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="p-6 flex-1 overflow-auto bg-background/30">
        <h2 className="text-xl font-bold mb-4">{selectedMail.subject}</h2>
        <div className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/80">
          {selectedMail.snippet}
        </div>
      </div>
      <div className="p-4 border-t border-border/50 bg-secondary/10">
        <div className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1 space-y-3">
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors resize-none"
              placeholder={`Reply to ${selectedMail.from?.split('<')[0]}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <button
                onClick={handleGenerateDraft}
                disabled={isGeneratingDraft}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors disabled:opacity-50"
              >
                {isGeneratingDraft ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                {isGeneratingDraft ? 'Writing...' : '✨ AI Write'}
              </button>
              <button
                onClick={handleSendReply}
                disabled={isSending || !replyText.trim()}
                className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-all shadow-[0_0_10px_rgba(var(--primary),0.3)] disabled:opacity-50"
              >
                {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {isSending ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  ) : (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
      <MailIcon className="h-16 w-16 mb-4 opacity-20" />
      <p className="font-medium text-lg">Select an email to read</p>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-in slide-in-from-bottom-4 duration-300 glass ${toast.type === 'success' ? 'border border-green-500/30 text-green-400' : 'border border-red-500/30 text-red-400'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
          <p className="text-muted-foreground text-sm">Manage your emails and generate AI replies.</p>
        </div>
      </div>

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" /> Inbox
            {mails.length > 0 && <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 leading-none">{mails.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="snoozed" className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> Snoozed
            {snoozedMails.length > 0 && <span className="ml-1 bg-yellow-500 text-black text-xs rounded-full px-1.5 py-0.5 leading-none">{snoozedMails.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="archived" className="flex items-center gap-2">
            <Archive className="h-4 w-4" /> Archived
            {archivedMails.length > 0 && <span className="ml-1 bg-muted text-muted-foreground text-xs rounded-full px-1.5 py-0.5 leading-none">{archivedMails.length}</span>}
          </TabsTrigger>
        </TabsList>

        {/* INBOX TAB */}
        <TabsContent value="inbox" className="mt-4">
          <div className="grid h-[calc(100vh-13rem)] grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 overflow-hidden">
            <div className="flex flex-col rounded-xl border bg-card shadow overflow-hidden glass">
              <div className="p-3 border-b border-border/50">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search inbox..."
                    className="w-full bg-background/50 pl-8 h-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground flex flex-col items-center mt-8">
                  <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                  Loading your inbox...
                </div>
              ) : error ? (
                <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                  <MailIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-6 font-medium text-sm">{error}</p>
                  <button
                    onClick={() => signIn("google", { callbackUrl: "/dashboard/inbox" })}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-all"
                  >
                    Connect Google Account
                  </button>
                </div>
              ) : (
                renderMailList(filteredMails,
                  <Inbox className="h-10 w-10 opacity-20" />,
                  searchQuery ? 'No emails match your search.' : 'Your inbox is empty.'
                )
              )}
            </div>
            <div className="rounded-xl border bg-card shadow overflow-hidden flex flex-col glass">
              {emailViewer}
            </div>
          </div>
        </TabsContent>

        {/* SNOOZED TAB */}
        <TabsContent value="snoozed" className="mt-4">
          <div className="rounded-xl border bg-card shadow overflow-hidden glass">
            <div className="p-4 border-b border-border/50 flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-400" />
              <h3 className="font-semibold text-sm">Snoozed Emails</h3>
              <span className="text-xs text-muted-foreground">— These will return to your inbox after the snooze time</span>
            </div>
            <div className="h-[calc(100vh-18rem)] overflow-y-auto">
              {snoozedMails.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                  <BellOff className="h-12 w-12 opacity-20 mb-3" />
                  <p className="text-sm">No snoozed emails. Click the 🕐 clock icon on any email to snooze it for 1 hour.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {snoozedMails.map(mail => (
                    <div key={mail.id} className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors">
                      <div>
                        <div className="font-medium text-sm">{mail.from?.split('<')[0]}</div>
                        <div className="text-xs text-muted-foreground">{mail.subject}</div>
                        <div className="text-xs text-yellow-400 mt-1">
                          Snoozed until {formatDistanceToNow(mail.snoozeUntil, { addSuffix: true })}
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnsnooze(mail)}
                        className="text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                      >
                        Return to Inbox
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ARCHIVED TAB */}
        <TabsContent value="archived" className="mt-4">
          <div className="rounded-xl border bg-card shadow overflow-hidden glass">
            <div className="p-4 border-b border-border/50 flex items-center gap-2">
              <Archive className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Archived Emails</h3>
              <span className="text-xs text-muted-foreground">— Emails you've archived this session</span>
            </div>
            <div className="h-[calc(100vh-18rem)] overflow-y-auto">
              {archivedMails.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                  <Archive className="h-12 w-12 opacity-20 mb-3" />
                  <p className="text-sm">No archived emails. Click the 📦 archive icon on any email to move it here.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {archivedMails.map(mail => (
                    <div key={mail.id} className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                          {(mail.from?.[0] || 'U').toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{mail.from?.split('<')[0]}</div>
                          <div className="text-xs font-medium text-foreground/80">{mail.subject}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{mail.snippet}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(mail.date), { addSuffix: true })}</span>
                        <button
                          onClick={() => {
                            setArchivedMails(prev => prev.filter(m => m.id !== mail.id))
                            setMails(prev => [mail, ...prev])
                            showToast('Email returned to inbox.')
                          }}
                          className="text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                        >
                          Restore
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
