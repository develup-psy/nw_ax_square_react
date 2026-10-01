import * as React from 'react'
import { useMemo, useState } from 'react'

import {
  EmsType,
  ServerStatusItem,
} from '../../data/serverStatusTypes'

import { MOCK_SERVER_STATUS } from '../../data/mockServerStatus'

import './serverStatus.css'

type EmsZone = {
  innovationNum: number
  rmsNums: number[]
}

const INNOVATION_ORDER = [1, 3, 2, 4, 5]
const RDP_ORDER = [1, 3, 5, 2, 4, 6, 7]

function buildSlots(
  items: ServerStatusItem[]
): Array<ServerStatusItem | null> {

  const maxSlotIndex =
    items.reduce(
      (max, item) =>
        Math.max(max, item.slotIndex),
      0
    )

  if (maxSlotIndex <= 0) {
    return []
  }

  const slots:
    Array<ServerStatusItem | null> =
      new Array(maxSlotIndex).fill(null)

  items.forEach((item) => {
    const index = item.slotIndex - 1

    if (
      index >= 0 &&
      index < slots.length
    ) {
      slots[index] = item
    }
  })

  return slots
}

function sortByPreferredOrder(
  values: number[],
  preferred: number[]
): number[] {
  const unique =
    Array.from(new Set(values))

  return unique.sort((a, b) => {
    const ai = preferred.indexOf(a)
    const bi = preferred.indexOf(b)

    if (ai === -1 && bi === -1) {
      return a - b
    }

    if (ai === -1) return 1
    if (bi === -1) return -1

    return ai - bi
  })
}

function getInnovationNum(
  rmsNum: number
): number {
  return Math.ceil(rmsNum / 4)
}

function ServerSlot({
  item,
}: {
  item: ServerStatusItem | null
}): React.ReactElement {

  if (!item) {
    return (
      <div
        className="server-status-slot server-status-slot--placeholder"
        aria-hidden="true"
      />
    )
  }

  return (
    <div
      className={
        item.isUsing
          ? 'server-status-slot server-status-slot--using'
          : 'server-status-slot server-status-slot--available'
      }
      title={
        item.isUsing
          ? `운영기 ${item.serverNum} · ${item.userName || '-'} · ${item.department || '-'}`
          : `운영기 ${item.serverNum} · 사용 가능`
      }
    >
      <div className="server-status-slot-head">
        <strong>
          {item.serverNum}
        </strong>

        <span
          className={
            item.isUsing
              ? 'server-status-state server-status-state--using'
              : 'server-status-state server-status-state--available'
          }
        >
          {item.isUsing
            ? '사용 중'
            : '사용 가능'}
        </span>
      </div>

      {item.isUsing && (
        <div className="server-status-user">
          <strong title={item.userName || '-'}>
            {item.userName || '-'}
          </strong>

          <span title={item.department || '-'}>
            {item.department || '-'}
          </span>
        </div>
      )}
    </div>
  )
}

function RmsBoard({
  rmsNum,
  type,
  items,
}: {
  rmsNum: number
  type: EmsType
  items: ServerStatusItem[]
}): React.ReactElement {
  const rmsItems =
    useMemo(
      () =>
        items
          .filter(
            (item) =>
              item.emsType === type &&
              item.rmsNum === rmsNum
          )
          .sort(
            (a, b) =>
              a.slotIndex - b.slotIndex
          ),
      [items, rmsNum, type]
    )

  const slots =
    useMemo(
      () => buildSlots(rmsItems),
      [rmsItems]
    )

  return (
    <section className="server-status-ems-zone">
      <article className="server-status-rms-board">
      <div className="server-status-rms-title">
        {type === 'RDP'
          ? `New-RMS-${String(rmsNum).padStart(2, '0')}`
          : `RMS-${rmsNum}`}
      </div>

      <div
        className={
          type === 'EMS'
            ? 'server-status-slot-grid server-status-slot-grid--ems'
            : 'server-status-slot-grid server-status-slot-grid--rdp'
        }
      >
        {slots.map((item, index) => (
          <ServerSlot
            key={
              item
                ? item.id
                : `${type}-${rmsNum}-${index}`
            }
            item={item}
          />
        ))}
      </div>
    </article>
    </section>
    
  )
}

export default function ServerStatus():
React.ReactElement {
  const items = MOCK_SERVER_STATUS

  const [activeType, setActiveType] =
    useState<EmsType>('EMS')

  const emsItems =
    items.filter(
      (item) => item.emsType === 'EMS'
    )

  const rdpItems =
    items.filter(
      (item) => item.emsType === 'RDP'
    )

  const emsRmsNums =
    Array.from(
      new Set(
        emsItems.map(
          (item) => item.rmsNum
        )
      )
    )

  const innovationNums =
    sortByPreferredOrder(
      emsRmsNums.map(getInnovationNum),
      INNOVATION_ORDER
    )

  const emsZones: EmsZone[] =
    innovationNums.map(
      (innovationNum) => ({
        innovationNum,
        rmsNums:
          emsRmsNums
            .filter(
              (rmsNum) =>
                getInnovationNum(rmsNum) ===
                innovationNum
            )
            .sort((a, b) => a - b),
      })
    )

  const rdpRmsNums =
    sortByPreferredOrder(
      rdpItems.map(
        (item) => item.rmsNum
      ),
      RDP_ORDER
    )

  return (
    <section className="server-status-section">
      <div className="page-container server-status-container">
        <div className="server-status-toolbar">
          <div
            className="server-status-view-switch"
            role="group"
            aria-label="운영기 유형 선택"
          >
            <button
              type="button"
              className={
                activeType === 'EMS'
                  ? 'server-status-view-button server-status-view-button--active'
                  : 'server-status-view-button'
              }
              onClick={() => setActiveType('EMS')}
              aria-pressed={activeType === 'EMS'}
            >
              로봇 EMS
            </button>

            <button
              type="button"
              className={
                activeType === 'RDP'
                  ? 'server-status-view-button server-status-view-button--active'
                  : 'server-status-view-button'
              }
              onClick={() => setActiveType('RDP')}
              aria-pressed={activeType === 'RDP'}
            >
              로봇 EMS (RDP)
            </button>
          </div>
        </div>

        {activeType === 'EMS' ? (
          <section className="server-status-group">
            <div className="server-status-group-heading">
              <span>EMS</span>
              <h2>로봇 EMS</h2>
            </div>

            <div className="server-status-ems-zone-grid">
              {emsZones.map((zone) => (
                <section
                  className="server-status-ems-zone"
                  key={zone.innovationNum}
                >
                  <h3>
                    NW Innovation-{zone.innovationNum}
                  </h3>

                  <div className="server-status-ems-rms-grid">
                    {zone.rmsNums.map(
                      (rmsNum) => (
                        <RmsBoard
                          key={rmsNum}
                          rmsNum={rmsNum}
                          type="EMS"
                          items={items}
                        />
                      )
                    )}
                  </div>
                </section>
              ))}
            </div>
          </section>
        ) : (
          <section className="server-status-group">
            <div className="server-status-group-heading">
              <span>RDP</span>
              <h2>로봇 EMS (RDP)</h2>
            </div>

            <div className="server-status-rdp-grid">
              {rdpRmsNums.map(
                (rmsNum) => (
                  <RmsBoard
                    key={rmsNum}
                    rmsNum={rmsNum}
                    type="RDP"
                    items={items}
                  />
                )
              )}
            </div>
          </section>
        )}
      </div>
    </section>
  )
}
