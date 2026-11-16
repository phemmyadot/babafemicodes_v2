'use client'

import { useState, useRef, useEffect } from 'react'
import type { Profile, ExperienceItem, SkillGroup } from '@/components/ide/types'
import type { Project } from '@/components/ide/types'
import type { BlogPost } from '@/components/ide/types'

import { FILE_CONFIG, FILE_IDS, type FileId } from './config'

import { TitleBar }    from './chrome/TitleBar'
import { ActivityBar } from './chrome/ActivityBar'
import { Sidebar }     from './chrome/Sidebar'
import { TabBar }      from './chrome/TabBar'
import { Breadcrumb }  from './chrome/Breadcrumb'
import { StatusBar }   from './chrome/StatusBar'
import { MobileNav }   from './chrome/MobileNav'
import { MobileDrawer } from './chrome/MobileDrawer'

import { LineNumbers } from './atoms/LineNumbers'
import { Minimap }     from './atoms/Minimap'

import { ReadmeFile }     from './files/ReadmeFile'
import { ExperienceFile } from './files/ExperienceFile'
import { SkillsFile }     from './files/SkillsFile'
import { ProjectsFile }   from './files/ProjectsFile'
import { BlogFile }       from './files/BlogFile'
import { ContactFile }    from './files/ContactFile'
import { sendContact }    from '@/lib/sendContact'

interface Props {
  profile:     Profile | null
  experience:  ExperienceItem[]
  skillGroups: SkillGroup[]
  projects:    Project[]
  blogPosts:   BlogPost[]
}

export function IdePortfolio({ profile, experience, skillGroups, projects, blogPosts }: Props) {
  const [openTabs,  setOpenTabs]  = useState<FileId[]>(['readme'])
  const [activeFile, setActiveFile] = useState<FileId>('readme')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [portfolioExpanded, setPortfolioExpanded] = useState(true)
  const [assetsExpanded,    setAssetsExpanded]    = useState(true)
  const [lineCount,  setLineCount]  = useState(30)
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent' | 'mail' | 'error'>('idle')

  const codePanelRef = useRef<HTMLDivElement>(null)

  // ── Handlers ────────────────────────────────────────────────────
  const openFile = (id: FileId) => {
    setOpenTabs(prev => prev.includes(id) ? prev : [...prev, id])
    setActiveFile(id)
    setDrawerOpen(false)
  }

  const closeTab = (e: React.MouseEvent, id: FileId) => {
    e.stopPropagation()
    const next = openTabs.filter(t => t !== id)
    const safe: FileId[] = next.length ? next : ['readme']
    setOpenTabs(safe)
    if (activeFile === id) setActiveFile(safe[safe.length - 1])
  }

  // Sends through /api/contact (Resend); if that fails, the visitor's mail app gets the message instead.
  const handleContact = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form    = e.currentTarget
    const name    = (form.elements.namedItem('cname')    as HTMLInputElement).value.trim()
    const email   = (form.elements.namedItem('cemail')   as HTMLInputElement).value.trim()
    const message = (form.elements.namedItem('cmessage') as HTMLTextAreaElement).value.trim()
    if (!name || !email || !message) return
    setContactStatus('sending')
    const subject = `Hello from ${name}`
    if (await sendContact({ name, email, subject, message })) return setContactStatus('sent')
    const to = profile?.email ?? ''
    const body = `${message}\n\n— ${name} (${email})`
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setContactStatus('mail')
  }

  // ── Effects ──────────────────────────────────────────────────────
  useEffect(() => {
    const section = document.getElementById('file-' + activeFile)
    if (section) setLineCount(section.querySelectorAll('.code-line').length || 30)
    codePanelRef.current?.scrollTo(0, 0)
  }, [activeFile])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        const idx = (FILE_IDS.indexOf(activeFile) + 1) % FILE_IDS.length
        openFile(FILE_IDS[idx])
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [activeFile])

  // ── Derived ──────────────────────────────────────────────────────
  const f = FILE_CONFIG[activeFile]

  return (
    <div className="ide">
      <TitleBar onHamburger={() => setDrawerOpen(o => !o)}/>

      <ActivityBar/>

      <Sidebar
        activeFile={activeFile}
        resumeUrl={profile?.resumeUrl ?? ''}
        portfolioExpanded={portfolioExpanded}
        assetsExpanded={assetsExpanded}
        onFileOpen={openFile}
        onTogglePortfolio={() => setPortfolioExpanded(e => !e)}
        onToggleAssets={() => setAssetsExpanded(e => !e)}
      />

      <div className="editor-area">
        <TabBar
          openTabs={openTabs}
          activeFile={activeFile}
          onFileOpen={openFile}
          onCloseTab={closeTab}
        />
        <Breadcrumb fileName={f.name}/>

        <div className="editor-content">
          <LineNumbers count={lineCount}/>

          <div className="code-panel" ref={codePanelRef}>
            <ReadmeFile     profile={profile}         isActive={activeFile === 'readme'}/>
            <ExperienceFile experience={experience}   isActive={activeFile === 'experience'}/>
            <SkillsFile     skillGroups={skillGroups} isActive={activeFile === 'skills'}/>
            <ProjectsFile   projects={projects}       isActive={activeFile === 'projects'}/>
            <BlogFile
              blogPosts={blogPosts}
              hashnodeUrl={profile?.hashnode ?? ''}
              isActive={activeFile === 'blog'}
            />
            <ContactFile
              profile={profile}
              status={contactStatus}
              isActive={activeFile === 'contact'}
              onSubmit={handleContact}
            />
          </div>

          <Minimap/>
        </div>
      </div>

      <StatusBar fileName={f.name} lang={f.lang}/>

      <MobileDrawer
        open={drawerOpen}
        activeFile={activeFile}
        resumeUrl={profile?.resumeUrl ?? ''}
        onFileOpen={openFile}
        onClose={() => setDrawerOpen(false)}
      />

      <MobileNav activeFile={activeFile} onFileOpen={openFile}/>
    </div>
  )
}
