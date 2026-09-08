//-------使用示例--------
// import { formatBeijingTime, formatDateShort, timeAgo } from '@/utils/time';

// // 完整时间
// formatBeijingTime('2026-09-08 07:30:00');
// // → '2026-09-08 15:30'

// // 短时间
// formatDateShort('2026-09-08 07:30:00');
// // → '09-08 15:30'

// // 相对时间
// timeAgo('2026-09-08 15:25:00');
// // → '5分钟前'

// // 纯日期
// formatDateOnly('2026-09-08 07:30:00');
// → '2026-09-08'


// import { formatBeijingTimeFull } from '@/utils/time';

// // 积分记录显示完整时间
// formatBeijingTimeFull(item.created_at)
// // → '2026-09-08 15:30:45'

//----------------------
/**
 * 格式化日期时间为完整格式（含年月日时分秒）
 * @param date - ISO 时间字符串或 Date 对象
 * @returns 格式：2026-09-08 15:30:45
 */
export function formatBeijingTimeFull(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '无效时间';

    const parts = d.toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    return parts.replace(/\//g, '-');
}

/**
 * 格式化日期时间为完整格式（含年月日时分）
 * @param date - ISO 时间字符串或 Date 对象
 * @returns 格式：2026-09-08 15:30
 */
export function formatBeijingTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '无效时间';

    const parts = d.toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    return parts.replace(/\//g, '-');
}

/**
 * 格式化日期时间为短格式（含月日时分）
 * @param date - ISO 时间字符串或 Date 对象
 * @returns 格式：09-08 15:30
 */
export function formatDateShort(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '无效时间';

    const parts = d.toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    return parts.replace(/\//g, '-');
}

/**
 * 格式化日期为相对时间（如：3分钟前、2小时前、3天前）
 * @param date - ISO 时间字符串或 Date 对象
 * @returns 相对时间字符串
 */
export function timeAgo(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '无效时间';

    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    if (days < 30) return `${Math.floor(days / 7)}周前`;
    if (days < 365) return `${Math.floor(days / 30)}个月前`;
    return `${Math.floor(days / 365)}年前`;
}

/**
 * 格式化日期为纯日期（不含时间）
 * @param date - ISO 时间字符串或 Date 对象
 * @returns 格式：2026-09-08
 */
export function formatDateOnly(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '无效时间';

    const parts = d.toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour12: false
    });
    return parts.replace(/\//g, '-');
}