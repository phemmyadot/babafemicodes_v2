export interface BlogPost {
  title:              string
  brief:              string
  slug:               string
  publishedAt:        string
  readTimeInMinutes:  number
  coverImage:         string | null
  url:                string
}

const HASHNODE_GQL = 'https://gql.hashnode.com'

const QUERY = `
  query GetPosts($host: String!) {
    publication(host: $host) {
      posts(first: 6) {
        edges {
          node {
            title
            brief
            slug
            publishedAt
            readTimeInMinutes
            coverImage { url }
          }
        }
      }
    }
  }
`

export async function getBlogPosts(hashnodeUrl: string): Promise<BlogPost[]> {
  try {
    const host = new URL(hashnodeUrl).hostname

    const res = await fetch(HASHNODE_GQL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ query: QUERY, variables: { host } }),
      next:    { revalidate: 3600 },
    })

    if (!res.ok) return []

    const { data } = await res.json()
    const edges: { node: { title: string; brief: string; slug: string; publishedAt: string; readTimeInMinutes: number; coverImage: { url: string } | null } }[] =
      data?.publication?.posts?.edges ?? []

    return edges.map(({ node }) => ({
      title:             node.title,
      brief:             node.brief,
      slug:              node.slug,
      publishedAt:       node.publishedAt,
      readTimeInMinutes: node.readTimeInMinutes,
      coverImage:        node.coverImage?.url ?? null,
      url:               `https://${host}/${node.slug}`,
    }))
  } catch {
    return []
  }
}
