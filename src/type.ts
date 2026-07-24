export interface DefectType{
id: string
name: string
category: string 
}

export type Severity = 'low' | 'high' | 'critical'

export type Status = 'new' | 'in_repair' | 'resolved' | 'rejected'
 
export interface ChecklistItem {
    key: string
    label: string
    result: 'pass' | 'fail' | 'na' | ''
    comment: string
}

export interface Defect{
    id: string
    vin: string
    zone: string
    x: number
    y: number
    typeId: string
    severity: Severity
    status: Status
    comment?: string
    createdAt?: string
}