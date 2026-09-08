import { createApp } from 'vue';
import ConfirmDialog from '@/composables/ConfirmDialog.vue';

//---------引用-------
// ✅ 检查邮箱是否已验证
// const isVerified = localStorage.getItem('isVerified') === 'true';
// if (!isVerified) {
//     const confirmed = await confirm({
//         title: '邮箱未验证',
//         message: '需要验证邮箱后才能**********，是否前往验证？',
//         icon: '📧',
//         confirmText: '前往验证',
//         cancelText: '取消',
//     });
//     if (confirmed) {
//         const email = localStorage.getItem('userEmail') || '';
//         router.push({ path: '/verify-email', query: { email } });
//     }
//     return;
// }
//------------------------------

let appInstance: any = null;
let divInstance: HTMLDivElement | null = null;

export function confirm(options: {
    title?: string;
    message?: string;
    icon?: string;
    confirmText?: string;
    cancelText?: string;
    onlyOne?: boolean;
}): Promise<boolean> {
    return new Promise((resolve) => {
        // 清理之前可能残留的实例
        if (appInstance) {
            appInstance.unmount();
            if (divInstance) {
                document.body.removeChild(divInstance);
                divInstance = null;
            }
            appInstance = null;
        }

        // 创建挂载点
        const div = document.createElement('div');
        document.body.appendChild(div);
        divInstance = div;

        // 创建 Vue 应用
        appInstance = createApp(ConfirmDialog, {
            title: options.title || '提示',
            message: options.message || '确定执行此操作吗？',
            icon: options.icon || '⚠️',
            confirmText: options.confirmText || '确定',
            cancelText: options.cancelText || '取消',
            onlyOne: options.onlyOne || false,
            onConfirm: () => {
                resolve(true);
                cleanup();
            },
            onCancel: () => {
                resolve(false);
                cleanup();
            },
        });

        const instance = appInstance.mount(div) as any;

        // 调用 show 方法显示弹窗
        if (instance && typeof instance.show === 'function') {
            instance.show();
        }

        // 清理函数
        function cleanup() {
            if (appInstance) {
                appInstance.unmount();
                appInstance = null;
            }
            if (divInstance && divInstance.parentNode) {
                divInstance.parentNode.removeChild(divInstance);
                divInstance = null;
            }
        }
    });
}