/**
 * The formatting the Blade views did inline: number_format, Carbon's format()
 * and Str::plural().
 */

/** `₱ 1,234.56`, matching number_format($value, 2). */
export function peso(value: number | null | undefined): string {
    return `₱ ${amount(value)}`
}

/** `1,234.56` — the figure alone, for cells that print their own symbol. */
export function amount(value: number | null | undefined): string {
    return Number(value ?? 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

/** A plain thousands-separated integer. */
export function count(value: number | null | undefined): string {
    return Number(value ?? 0).toLocaleString('en-US')
}

/** `September 10, 2026` — Carbon's 'F d, Y'. */
export function longDate(value: string | null | undefined): string {
    const date = parse(value)

    if (!date) {
        return '-'
    }

    return date.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })
}

/** `September 10, 2026 02:15 PM` — Carbon's 'F d, Y h:i A'. */
export function longDateTime(value: string | null | undefined): string {
    const date = parse(value)

    if (!date) {
        return '-'
    }

    return `${longDate(value)} ${date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    })}`
}

/** `September 2026` — the projected-timeline columns are month precision. */
export function monthYear(value: string | null | undefined): string {
    if (!value) {
        return '-'
    }

    const date = parse(value.length === 7 ? `${value}-01` : value)

    if (!date) {
        return '-'
    }

    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

/** `YYYY-MM-DD`, for prefilling a date input. */
export function inputDate(value: string | null | undefined): string {
    const date = parse(value)

    return date ? date.toISOString().slice(0, 10) : ''
}

/** Today as `YYYY-MM-DD`. */
export function today(): string {
    const now = new Date()

    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())

    return now.toISOString().slice(0, 10)
}

/** Str::plural — good enough for the words these pages pluralise. */
export function plural(word: string, quantity: number): string {
    return quantity === 1 ? word : `${word}s`
}

/** Carbon's diffForHumans, in the short form the lots table prints. */
export function forHumans(value: string | null | undefined): string {
    const date = parse(value)

    if (!date) {
        return ''
    }

    const seconds = Math.round((Date.now() - date.getTime()) / 1000)
    const units: [number, string][] = [
        [60, 'second'],
        [3600, 'minute'],
        [86400, 'hour'],
        [2592000, 'day'],
        [31536000, 'month'],
    ]

    let previous = 1

    for (const [limit, unit] of units) {
        if (seconds < limit) {
            const size = Math.max(1, Math.floor(seconds / previous))

            return `${size} ${plural(unit, size)} ago`
        }

        previous = limit
    }

    const years = Math.max(1, Math.floor(seconds / 31536000))

    return `${years} ${plural('year', years)} ago`
}

function parse(value: string | null | undefined): Date | null {
    if (!value) {
        return null
    }

    // The demo data stores `YYYY-MM-DD HH:MM:SS`, which Safari will not parse
    // without the separator.
    const date = new Date(value.replace(' ', 'T'))

    return Number.isNaN(date.getTime()) ? null : date
}
