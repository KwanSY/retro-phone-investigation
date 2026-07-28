export function getInitialWhaleChat() {
    return [
        { id: 'w_1', type: 'other', sender: '摆渡人', time: '3月13日 21:00', text: '报目标。照片，班级，姓名。' },
        { id: 'w_2', type: 'me', sender: '石头', time: '3月13日 21:10', text: '【附件：IMG_001】\n三班。周念。' },
        { id: 'w_3', type: 'other', sender: '摆渡人', time: '3月13日 21:15', text: '嗯。第1关通过。等指令。' },
        { id: 'w_4', type: 'me', sender: '石头', time: '3月13日 22:00', text: '1号已入网。' }
    ];
}

export function getInitialAppsList() {
    return [
        { id: 'sms_menu', name: '短信息', icon: '✉️', color: '#ffbd2d' },
        { id: 'gallery_list', name: '相册', icon: '🖼️', color: '#3498db' },
        { id: 'notes', name: '备忘录', icon: '📝', color: '#e67e22' },
        { id: 'contacts', name: '通讯录', icon: '👥', color: '#9b59b6' },
        { id: 'qq_menu', name: '手机QQ', icon: '🐧', color: '#2ecc71' },
        { id: 'whale_app', name: '失眠的鲸', icon: '🐳', color: '#16a085' }
    ];
}
