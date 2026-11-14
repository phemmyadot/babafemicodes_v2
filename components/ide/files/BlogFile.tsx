import type { BlogPost } from '@/components/ide/types'
import { formatBlogDate } from '../config'

interface BlogFileProps {
  blogPosts: BlogPost[]
  hashnodeUrl: string
  isActive: boolean
}

export function BlogFile({ blogPosts, hashnodeUrl, isActive }: BlogFileProps) {
  return (
    <div className={`file-section ${isActive ? 'active' : ''}`} id="file-blog">
      <div className="code-block">

        <div className="code-line"><span className="cm"># Writing &amp; Thoughts</span></div>
        <div className="code-line"><span className="cm"># Articles on mobile engineering, full-stack development,</span></div>
        <div className="code-line"><span className="cm"># and lessons from the field.</span></div>
        <div className="code-line blank"/>
        <div className="code-line"><span className="op">---</span></div>
        <div className="code-line blank"/>
        <div className="code-line"><span className="lk">posts</span><span className="op">:</span></div>

        {blogPosts.length > 0 ? blogPosts.map((post, i) => (
          <div key={i}>
            <div className="code-line indent-1">
              <span className="op">- </span><span className="lk">title</span><span className="op">: </span>
              <span className="st">&quot;{post.title}&quot;</span>
            </div>
            <div className="code-line indent-2">
              <span className="lk">date</span><span className="op">: </span>
              <span className="st">&quot;{formatBlogDate(post.publishedAt)}&quot;</span>
            </div>
            <div className="code-line indent-2">
              <span className="lk">read_time</span><span className="op">: </span>
              <span className="nu">{post.readTimeInMinutes}</span>
            </div>
            <div className="code-line indent-2">
              <span className="lk">url</span><span className="op">: </span>
              <a href={post.url} target="_blank" rel="noopener noreferrer">
                <span className="st">&quot;{post.url}&quot;</span>
              </a>
            </div>
            <div className="code-line indent-2">
              <span className="lk">brief</span><span className="op">: &gt;</span>
            </div>
            <div className="code-line indent-3">
              <span className="st">{post.brief}</span>
            </div>
            {i < blogPosts.length - 1 && <div className="code-line blank"/>}
          </div>
        )) : (
          <>
            <div className="code-line indent-1">
              <span className="op">- </span><span className="lk">title</span><span className="op">: </span>
              <span className="st">&quot;No posts yet. Check back soon.&quot;</span>
            </div>
          </>
        )}

        {hashnodeUrl && (
          <>
            <div className="code-line blank"/>
            <div className="code-line"><span className="op">---</span></div>
            <div className="code-line blank"/>
            <div className="code-line">
              <span className="lk">all_posts</span><span className="op">: </span>
              <a href={hashnodeUrl} target="_blank" rel="noopener noreferrer">
                <span className="st">&quot;{hashnodeUrl}&quot;</span>
              </a>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
