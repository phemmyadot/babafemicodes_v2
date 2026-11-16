import type { Profile } from '@/components/ide/types'

type ContactStatus = 'idle' | 'sending' | 'sent' | 'mail' | 'error'

interface ContactFileProps {
  profile: Profile | null
  status: ContactStatus
  isActive: boolean
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void
}

const BUTTON_LABEL: Record<ContactStatus, string> = {
  idle:    'send_message(payload)',
  sending: 'sending...',
  sent:    '✓ message sent',
  mail:    '✓ opened in your mail app',
  error:   '✗ error — try again',
}

export function ContactFile({ profile, status, isActive, onSubmit }: ContactFileProps) {
  const email    = profile?.email    ?? 'babafemiadojutelegan@gmail.com'
  const linkedin = profile?.linkedin ?? 'https://www.linkedin.com/in/badojutelegan/'
  const github   = profile?.github   ?? 'https://github.com/phemmyadot'

  return (
    <div className={`file-section ${isActive ? 'active' : ''}`} id="file-contact">
      <div className="code-block">

        <div className="code-line">
          <span className="kw">from </span><span className="ty">dataclasses</span>
          <span className="kw"> import </span><span className="lk">dataclass</span><span className="op">, </span><span className="lk">field</span>
        </div>
        <div className="code-line">
          <span className="kw">from </span><span className="ty">typing</span>
          <span className="kw"> import </span><span className="ty">List</span>
        </div>
        <div className="code-line blank"/>
        <div className="code-line">
          <span className="cm"># If you&apos;re building something worth building — let&apos;s talk.</span>
        </div>
        <div className="code-line blank"/>
        <div className="code-line"><span className="pu">@dataclass</span></div>
        <div className="code-line">
          <span className="kw">class </span><span className="ty">ContactConfig</span><span className="op">:</span>
        </div>
        <div className="code-line indent-1">
          <span className="lk">email</span><span className="op">: </span><span className="ty">str</span>
          <span className="op"> = </span><span className="st">&quot;{email}&quot;</span>
        </div>
        <div className="code-line indent-1">
          <span className="lk">linkedin</span><span className="op">: </span><span className="ty">str</span>
          <span className="op"> = </span><span className="st">&quot;{linkedin.replace('https://', '')}&quot;</span>
        </div>
        <div className="code-line indent-1">
          <span className="lk">github</span><span className="op">: </span><span className="ty">str</span>
          <span className="op"> = </span><span className="st">&quot;{github.replace('https://', '')}&quot;</span>
        </div>
        <div className="code-line indent-1">
          <span className="lk">open_to</span><span className="op">: </span>
          <span className="ty">List</span><span className="op">[</span><span className="ty">str</span><span className="op">] = </span>
          <span className="lk">field</span><span className="op">(</span>
          <span className="lk">default_factory</span><span className="op">=</span><span className="kw">lambda</span><span className="op">: [</span>
        </div>
        <div className="code-line indent-2"><span className="st">&quot;Senior engineering roles&quot;</span><span className="op">,</span></div>
        <div className="code-line indent-2"><span className="st">&quot;Contract work&quot;</span><span className="op">,</span></div>
        <div className="code-line indent-2"><span className="st">&quot;Interesting side projects&quot;</span><span className="op">,</span></div>
        <div className="code-line indent-1"><span className="op">])</span></div>
        <div className="code-line blank"/>
        <div className="code-line">
          <span className="lk">contact</span><span className="op"> = </span><span className="ty">ContactConfig</span><span className="op">()</span>
        </div>
        <div className="code-line blank"/>
        <div className="code-line"><span className="cm"># sendMessage() below or email directly.</span></div>
        <div className="code-line blank"/>
        <div className="code-line">
          <span className="kw">async def </span><span className="fn">send_message</span>
          <span className="op">(</span><span className="lk">payload</span><span className="op">: </span>
          <span className="ty">dict</span><span className="op">) -&gt; </span><span className="ty">None</span><span className="op">:</span>
        </div>
        <div className="code-line indent-1"><span className="cm"># Fill the form below ↓</span></div>
        <div className="code-line indent-1"><span className="kw">pass</span></div>

      </div>

      <form className="contact-form" style={{ marginTop: 16, marginBottom: 16 }} onSubmit={onSubmit}>
        <div className="form-field">
          <label className="form-label">{'# name'}</label>
          <input className="form-input" type="text" name="cname" placeholder="str" required/>
        </div>
        <div className="form-field">
          <label className="form-label">{'# email'}</label>
          <input className="form-input" type="email" name="cemail" placeholder="str" required/>
        </div>
        <div className="form-field">
          <label className="form-label">{'# message'}</label>
          <textarea className="form-textarea" name="cmessage" placeholder="str" required/>
        </div>
        <button className="form-btn" type="submit" disabled={status === 'sending'}>
          {BUTTON_LABEL[status]}
        </button>
      </form>

      <div className="code-block">
        <div className="code-line"><span className="cm"># Direct channels</span></div>
        <div className="code-line">
          <span className="lk">links</span><span className="op"> = </span><span className="ty">dict</span><span className="op">(</span>
        </div>
        <div className="code-line indent-1">
          <span className="lk">email</span><span className="op">=</span>
          <span className="st">&quot;<a href={`mailto:${email}`} style={{ color: 'inherit' }}>{email}</a>&quot;</span><span className="op">,</span>
        </div>
        <div className="code-line indent-1">
          <span className="lk">linkedin</span><span className="op">=</span>
          <span className="st">&quot;<a href={linkedin} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>{linkedin.replace('https://', '')}</a>&quot;</span><span className="op">,</span>
        </div>
        <div className="code-line"><span className="op">)</span></div>
      </div>

    </div>
  )
}
