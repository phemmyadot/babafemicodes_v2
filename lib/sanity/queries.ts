/**
 * One round trip for the whole page, written against the profile / project / experience /
 * skills document shapes. Each projection selects only what the UI renders; "v2" fields
 * are optional and coalesced.
 */
export const PORTFOLIO_QUERY = /* groq */ `{
  "profile": *[_type == "profile"][0]{
    firstName, lastName, headline, tagline, titles, bio,
    email, phone, linkedin, github, hashnode,
    location, workStatus, openToWork,
    "avatarUrl": avatar.asset->url,
    "resumeUrl": resume.asset->url,
    "stats": stats[]{ "id": _key, value, label, unit, detail, signal },
    "certifications": certifications[]{ "id": _key, label, url },
    "education": education[]{ "id": _key, degree, institution, year }
  },
  "skills": *[_type == "skills"] | order(order asc){
    "id": _id, title, "skills": coalesce(skills, [])
  },
  "projects": *[_type == "project"] | order(featured desc, order asc, _createdAt desc){
    "id": _id, title, "slug": slug.current, client, role,
    "summary": description,
    "body": coalesce(body, []),
    "metrics": coalesce(metrics, []),
    "techStack": coalesce(tags, []),
    "domain": select(
      category == "mobile"    => "Mobile",
      category == "web"       => "Web",
      category == "fullstack" => "Full Stack",
      category == "backend"   => "Backend",
      category
    ),
    "featured": coalesce(featured, false),
    "links": coalesce(liveUrls[defined(link)]{ "title": coalesce(title, "Live"), "url": link }, []),
    "githubUrl": repository,
    "thumbnailUrl": thumbnail.asset->url
  },
  "experience": *[_type == "experience"] | order(order asc, startDate desc){
    "id": _id, company, role, location, startDate, endDate,
    "current": coalesce(current, false),
    "highlights": coalesce(bullets, []),
    "techStack": coalesce(tags, [])
  }
}`;

/** Cache tag invalidated by /api/revalidate when Sanity publishes. */
export const PORTFOLIO_TAG = "portfolio";
