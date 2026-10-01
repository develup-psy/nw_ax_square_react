import { ServerStatusItem } from './serverStatusTypes'

const USERS = [
  ['박성용', 'NW AX추진팀'],
  ['김유플', 'NW운영팀'],
  ['이전담', 'NW품질팀'],
  ['최운영', 'NW플랫폼팀'],
  ['정로봇', 'NW AX추진팀'],
]

let id = 1
let serverNum = 31

function createRms(
  emsType: 'EMS' | 'RDP',
  rmsNum: number,
  slotCount: number
): ServerStatusItem[] {
  const result: ServerStatusItem[] = []

  for (
    let slotIndex = 1;
    slotIndex <= slotCount;
    slotIndex += 1
  ) {
    const isUsing =
      (rmsNum + slotIndex) % 5 === 0 ||
      (rmsNum * slotIndex) % 13 === 0

    const user =
      USERS[
        (rmsNum + slotIndex) %
          USERS.length
      ]

    result.push({
      id: id++,
      serverNum: serverNum++,
      isUsing,
      department:
        isUsing ? user[1] : '',
      userName:
        isUsing ? user[0] : '',
      emsType,
      rmsNum,
      slotIndex,
    })
  }

  return result
}

export const MOCK_SERVER_STATUS: ServerStatusItem[] = [
  ...Array.from(
    { length: 20 },
    (_, index) =>
      createRms(
        'EMS',
        index + 1,
        10
      )
  ).flat(),

  ...Array.from(
    { length: 7 },
    (_, index) =>
      createRms(
        'RDP',
        index + 1,
        25
      )
  ).flat(),
]
