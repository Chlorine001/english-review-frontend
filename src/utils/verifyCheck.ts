
export function checkVerified(): boolean {
    const isVerified = localStorage.getItem('isVerified') === 'true';
    if (!isVerified) {
        alert('⚠️ 请先验证邮箱后再操作！');
        return false;
    }
    return true;
}

export function checkVerifiedWithRedirect(router: any): boolean {
    const isVerified = localStorage.getItem('isVerified') === 'true';
    if (!isVerified) {
        const confirm = window.confirm('⚠️ 邮箱未验证，是否前往验证页面？');
        if (confirm) {
            const email = localStorage.getItem('userEmail') || '';
            router.push({ path: '/verify-email', query: { email } });
        }
        return false;
    }
    return true;
}
