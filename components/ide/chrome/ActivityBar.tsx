import { ExplorerIcon, SearchIcon, SourceControlIcon, SettingsIcon } from '../icons/Icons'

export function ActivityBar() {
  return (
    <div className="activitybar">
      <div className="activity-icon active tooltip" data-tip="Explorer">
        <ExplorerIcon />
      </div>
      <div className="activity-icon tooltip" data-tip="Search">
        <SearchIcon />
      </div>
      <div className="activity-icon tooltip" data-tip="Source Control">
        <SourceControlIcon />
      </div>
      <div className="activity-spacer"/>
      <div className="activity-icon tooltip" data-tip="Settings">
        <SettingsIcon />
      </div>
    </div>
  )
}
