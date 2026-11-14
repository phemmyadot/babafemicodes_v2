import type { Profile } from '@/components/ide/types';
import { InlineBadge } from "../atoms/InlineBadge";

interface ReadmeFileProps {
  profile: Profile | null;
  isActive: boolean;
}

export function ReadmeFile({ profile, isActive }: ReadmeFileProps) {
  const fullName = `${profile?.firstName ?? "Babafemi"} ${profile?.lastName ?? "Adojutelegan"}`;
  const title = profile?.titles?.[0] ?? "Senior Software Engineer";
  const email = profile?.email ?? "babafemiadojutelegan@gmail.com";

  return (
    <div
      className={`file-section ${isActive ? "active" : ""}`}
      id="file-readme"
    >
      <div className="code-block">
        {/* ── Header ── */}
        <div className="code-line">
          <span className="cm"># {fullName}</span>
        </div>
        <div className="code-line blank" />
        <div className="code-line">
          <span className="cm">## {title}</span>
          {profile?.openToWork && (
            <InlineBadge variant="green">Open to Work</InlineBadge>
          )}
        </div>
        <div className="code-line blank" />
        <div className="code-line">
          <span className="cm">---</span>
        </div>

        {/* ── Bio ── */}
        <div className="code-line blank" />
        <div className="code-line">
          <span className="cm">### 👋 About me</span>
        </div>
        <div className="code-line blank" />
        {(profile?.bio ?? ["I build things that matter."]).map((line, i) => (
          <div key={i} className="code-line">
            <span className="cm">{line}</span>
          </div>
        ))}

        {/* ── Specialization ── */}
        <div className="code-line blank" />
        <div className="code-line">
          <span className="cm">---</span>
        </div>
        <div className="code-line blank" />
        <div className="code-line">
          <span className="cm">### 🔧 Specialization</span>
        </div>
        <div className="code-line blank" />
        <div className="code-line">
          <span className="pl">
            - React Native · TypeScript · Cloud Infrastructure
          </span>
        </div>
        <div className="code-line">
          <span className="pl">
            - Bias toward shipping clean, maintainable software at scale
          </span>
        </div>
        <div className="code-line">
          <span className="pl">- Full ownership of mobile release cycles</span>
        </div>
        {profile?.certifications?.map((cert, i) => (
          <div key={i} className="code-line">
            <span className="pl">- {cert.label}</span>
          </div>
        ))}

        {/* ── Availability ── */}
        <div className="code-line blank" />
        <div className="code-line">
          <span className="cm">---</span>
        </div>
        <div className="code-line blank" />
        <div className="code-line">
          <span className="cm">### 📅 Availability</span>
        </div>
        <div className="code-line blank" />
        <div className="code-line">
          <span className="kw">const </span>
          <span className="lk">availability</span>
          <span className="op"> = </span>
          <span className="ty">{"{"}</span>
        </div>
        <div className="code-line indent-1">
          <span className="lk">status</span>
          <span className="op">: </span>
          <span className="st">&quot;Open to opportunities&quot;</span>
          <span className="op">,</span>
        </div>
        <div className="code-line indent-1">
          <span className="lk">roles</span>
          <span className="op">: [</span>
        </div>
        <div className="code-line indent-2">
          <span className="st">&quot;Senior Engineer&quot;</span>
          <span className="op">,</span>
        </div>
        <div className="code-line indent-2">
          <span className="st">&quot;Contract Work&quot;</span>
          <span className="op">,</span>
        </div>
        <div className="code-line indent-2">
          <span className="st">&quot;Interesting Side Projects&quot;</span>
        </div>
        <div className="code-line indent-1">
          <span className="op">],</span>
        </div>
        <div className="code-line indent-1">
          <span className="lk">preferredStack</span>
          <span className="op">: </span>
          <span className="st">
            &quot;React Native · TypeScript · AWS&quot;
          </span>
        </div>
        <div className="code-line">
          <span className="ty">{"}"}</span>
        </div>

        {/* ── Navigate ──
        <div className="code-line blank" />
        <div className="code-line">
          <span className="cm">---</span>
        </div>
        <div className="code-line blank" />
        <div className="code-line">
          <span className="cm">### 📁 Navigate this repo</span>
        </div>
        <div className="code-line blank" />
        <div className="code-line">
          <span className="cm">| File | Contents |</span>
        </div>
        <div className="code-line">
          <span className="cm">|------|----------|</span>
        </div>
        {[
          ["experience.json", "Work history & roles"],
          ["skills.ts", "Tech stack & tooling"],
          ["projects.tsx", "Things I've shipped"],
          ["blog.yml", "Writing & thoughts"],
          ["contact.py", "Get in touch"],
        ].map(([file, desc]) => (
          <div key={file} className="code-line">
            <span className="cm">
              | [{file}](#) | {desc} |
            </span>
          </div>
        ))} */}

        {/* ── Certifications ── */}
        {profile?.certifications?.length ? (
          <>
            <div className="code-line blank" />
            <div className="code-line">
              <span className="cm">---</span>
            </div>
            <div className="code-line blank" />
            <div className="code-line">
              <span className="cm">### 🏅 Certifications</span>
            </div>
            <div className="code-line blank" />
            {profile.certifications.map((cert, i) => (
              <div key={i} className="code-line">
                <span className="pl">- </span>
                <span className="cm">
                  {cert.url ? (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit" }}
                    >
                      {cert.label}
                    </a>
                  ) : (
                    cert.label
                  )}
                </span>
              </div>
            ))}
          </>
        ) : null}

        {/* ── Stats ── */}
        {profile?.stats?.length ? (
          <>
            <div className="code-line blank" />
            <div className="code-line">
              <span className="cm">---</span>
            </div>
            <div className="code-line blank" />
            <div className="code-line">
              <span className="cm">### 📊 Stats</span>
            </div>
            <div className="code-line blank" />
            {profile.stats.map((stat, i) => (
              <div key={i} className="code-line">
                <span className="pl">- </span>
                <span className="nu">{stat.value}</span>
                <span className="pl"> {stat.label}</span>
              </div>
            ))}
          </>
        ) : null}

        {/* ── Footer ── */}
        <div className="code-line blank" />
        <div className="code-line">
          <span className="cm">---</span>
        </div>
        <div className="code-line blank" />
        <div className="code-line">
          <span className="cm">
            *
            {profile?.tagline ?? "Engineering experiences. Shipping solutions."}
            *
          </span>
        </div>
        <div className="code-line blank" />
        <div className="code-line">
          <span className="pl">{email}</span>
          <span className="cursor" />
        </div>
      </div>
    </div>
  );
}
