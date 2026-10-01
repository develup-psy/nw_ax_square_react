export type EmsType = 'EMS' | 'RDP'

export interface ServerStatusItem {
  id: number
  serverNum: number
  isUsing: boolean
  department: string
  userName: string
  emsType: EmsType
  rmsNum: number
  slotIndex: number
}
