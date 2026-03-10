

export function getWeekStart(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = day === 0 ? -6 : 1 - day
    d.setDate(d.getDate() + diff)
    d.setHours(0,0,0,0)
    return d
}   

export function getWeekDays(weekStart: Date): Date[] {
    return Array.from({length : 7}, (_,i) => {
        const d = new Date(weekStart)
        d.setDate(d.getDate() + i)
        d.setHours(0, 0, 0, 0)
        return d
    })
}


export function toDateString(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
}

export function timeToMinutes(isoTime: string): number {
    const d = new Date(isoTime)
    return d.getUTCHours() * 60 + d.getUTCMinutes()
}

export function minutesToLabel(minutes: number): string{
    const h = Math.floor(minutes/60).toString().padStart(2, "0")
    const m = (minutes % 60).toString().padStart(2, "0")
    return `${h}:${m}`
}
