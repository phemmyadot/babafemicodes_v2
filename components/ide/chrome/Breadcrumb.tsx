import { SITE_DOMAIN } from "@/lib/site"
interface BreadcrumbProps {
  fileName: string
}

export function Breadcrumb({ fileName }: BreadcrumbProps) {
  return (
    <div className="breadcrumb">
      <span className="breadcrumb-item">{SITE_DOMAIN}</span>
      <span className="breadcrumb-sep">›</span>
      <span className="breadcrumb-item current">{fileName}</span>
    </div>
  )
}
