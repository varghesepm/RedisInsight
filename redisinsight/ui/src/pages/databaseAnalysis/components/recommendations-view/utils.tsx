import React from 'react'
import {
  EuiTextColor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiImage,
} from '@elastic/eui'
import { ReactComponent as CodeIcon } from 'uiSrc/assets/img/code-changes.svg'
import { ReactComponent as ConfigurationIcon } from 'uiSrc/assets/img/configuration-changes.svg'
import { ReactComponent as UpgradeIcon } from 'uiSrc/assets/img/upgrade.svg'

import styles from './styles.module.scss'

const badgesContent = [
  { id: 'code_changes', icon: <CodeIcon className={styles.badgeIcon} />, name: 'Code Changes' },
  { id: 'configuration_changes', icon: <ConfigurationIcon className={styles.badgeIcon} />, name: 'Configuration Changes' },
  { id: 'upgrade', icon: <UpgradeIcon className={styles.badgeIcon} />, name: 'Upgrade' },
]

export const renderBadges = (badges: string[]) => (
  <EuiFlexGroup className={styles.badgesContainer} responsive={false} justifyContent="spaceBetween">
    {badgesContent.map(({ id, icon, name }) => (badges.indexOf(id) === -1
      ? <EuiFlexItem key={id} className={styles.badge} grow={false} />
      : (
        <EuiFlexItem key={id} className={styles.badge} grow={false}>
          <div className={styles.badgeWrapper}>
            {icon}
            {name}
          </div>
        </EuiFlexItem>
      )))}
  </EuiFlexGroup>
)

export const parseContent = ({ type, value }: { type: string, value: any }) => {
  switch (type) {
    case 'paragraph':
      return <EuiTextColor color="subdued">{value}</EuiTextColor>
    case 'span':
      return <EuiTextColor color="subdued" className={styles.span}>{value}</EuiTextColor>
    case 'link':
      return <EuiLink external={false} target="_blank" href={value.href}>{value.name}</EuiLink>
    case 'image':
      return <EuiImage size="l" alt="" src={value} />
    default:
      return value
  }
}
