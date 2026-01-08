// 身材记录功能模块
class BodyRecordManager {
    constructor() {
        this.records = this.loadRecords();
        this.currentEditId = null;
        this.init();
    }

    // 初始化功能
    init() {
        this.bindEvents();
        this.renderRecords();
    }

    // 绑定事件
    bindEvents() {
        // 记录按钮点击事件
        document.getElementById('record-body-btn').addEventListener('click', () => {
            this.showModal();
        });

        // 关闭弹窗事件
        document.getElementById('close-body-modal').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('cancel-body-record').addEventListener('click', () => {
            this.hideModal();
        });

        // 确认记录事件
        document.getElementById('confirm-body-record').addEventListener('click', () => {
            this.saveRecord();
        });

        // 点击弹窗外部关闭
        document.getElementById('body-record-modal').addEventListener('click', (e) => {
            if (e.target.id === 'body-record-modal') {
                this.hideModal();
            }
        });

        // ESC键关闭弹窗
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
                this.hideEditModal();
            }
        });

        // 编辑弹窗事件
        document.getElementById('close-body-edit-modal').addEventListener('click', () => {
            this.hideEditModal();
        });

        document.getElementById('cancel-body-edit').addEventListener('click', () => {
            this.hideEditModal();
        });

        document.getElementById('confirm-body-edit').addEventListener('click', () => {
            this.updateRecord();
        });

        document.getElementById('body-edit-modal').addEventListener('click', (e) => {
            if (e.target.id === 'body-edit-modal') {
                this.hideEditModal();
            }
        });

    }

    // 显示弹窗
    showModal() {
        const modal = document.getElementById('body-record-modal');
        modal.classList.remove('hidden');
        
        // 清空输入框
        this.clearInputs();
    }

    // 隐藏弹窗
    hideModal() {
        document.getElementById('body-record-modal').classList.add('hidden');
    }

    // 清空输入框
    clearInputs() {
        document.getElementById('weight').value = '';
        document.getElementById('chest').value = '';
        document.getElementById('waist').value = '';
        document.getElementById('hip').value = '';
        document.getElementById('upper-chest').value = '';
        document.getElementById('lower-chest').value = '';
    }

    // 保存记录
    saveRecord() {
        const weight = document.getElementById('weight').value;
        const chest = document.getElementById('chest').value;
        const waist = document.getElementById('waist').value;
        const hip = document.getElementById('hip').value;
        const upperChest = document.getElementById('upper-chest').value;
        const lowerChest = document.getElementById('lower-chest').value;

        // 验证至少填写一项
        if (!weight && !chest && !upperChest && !lowerChest && !waist && !hip) {
            alert('请至少填写一项身材数据！');
            return;
        }

        // 创建记录对象
        const record = {
            id: Date.now().toString(),
            timestamp: new Date(),
            data: {
                weight: weight ? parseFloat(weight) : null,
                chest: chest ? parseFloat(chest) : null,
                upperChest: upperChest ? parseFloat(upperChest) : null,
                lowerChest: lowerChest ? parseFloat(lowerChest) : null,
                waist: waist ? parseFloat(waist) : null,
                hip: hip ? parseFloat(hip) : null
            }
        };

        // 添加到记录列表
        this.records.push(record);

        // 保存到localStorage
        this.saveRecords();

        // 重新渲染记录
        this.renderRecords();

        // 隐藏弹窗
        this.hideModal();

        // 显示成功提示
        alert('身材数据记录成功！');
        
        // 触发身材数据更新事件
        window.dispatchEvent(new Event('bodyRecordUpdated'));
    }

    // 加载记录
    loadRecords() {
        const stored = localStorage.getItem('bodyRecords');
        if (stored) {
            const records = JSON.parse(stored);
            // 转换时间戳字符串为Date对象
            return records.map(record => ({
                ...record,
                timestamp: new Date(record.timestamp)
            }));
        }
        return [];
    }

    // 保存记录到localStorage
    saveRecords() {
        localStorage.setItem('bodyRecords', JSON.stringify(this.records));
    }

    // 渲染记录列表
    renderRecords() {
        const container = document.getElementById('body-records-list');
        
        // 按时间倒序排序
        this.records.sort((a, b) => b.timestamp - a.timestamp);

        if (this.records.length === 0) {
            container.innerHTML = '<p class="no-data">暂无身材记录</p>';
            return;
        }

        // 生成记录HTML
        const html = this.records.map(record => this.generateRecordHTML(record)).join('');
        container.innerHTML = html;

        // 绑定编辑按钮事件
        this.bindEditEvents();
    }

    // 绑定编辑按钮事件
    bindEditEvents() {
        document.querySelectorAll('.edit-body-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const recordId = btn.getAttribute('data-record-id');
                this.showEditModal(recordId);
            });
        });
    }

    // 生成单条记录的HTML
    generateRecordHTML(record) {
        const timeStr = this.formatDateTime(record.timestamp);
        const dataFields = [];



        if (record.data.weight !== null) {
            dataFields.push(`
                <div class="body-record-field">
                    <span class="body-record-label">体重</span>
                    <span class="body-record-value">${record.data.weight} kg</span>
                </div>
            `);
        }

        if (record.data.chest !== null && record.data.chest !== undefined) {
            dataFields.push(`
                <div class="body-record-field">
                    <span class="body-record-label">胸围</span>
                    <span class="body-record-value">${record.data.chest} cm</span>
                </div>
            `);
        }

        if (record.data.upperChest !== null && record.data.upperChest !== undefined) {
            dataFields.push(`
                <div class="body-record-field">
                    <span class="body-record-label">上胸围</span>
                    <span class="body-record-value">${record.data.upperChest} cm</span>
                </div>
            `);
        }

        if (record.data.lowerChest !== null && record.data.lowerChest !== undefined) {
            dataFields.push(`
                <div class="body-record-field">
                    <span class="body-record-label">下胸围</span>
                    <span class="body-record-value">${record.data.lowerChest} cm</span>
                </div>
            `);
        }

        if (record.data.waist !== null) {
            dataFields.push(`
                <div class="body-record-field">
                    <span class="body-record-label">腰围</span>
                    <span class="body-record-value">${record.data.waist} cm</span>
                </div>
            `);
        }

        if (record.data.hip !== null) {
            dataFields.push(`
                <div class="body-record-field">
                    <span class="body-record-label">臀围</span>
                    <span class="body-record-value">${record.data.hip} cm</span>
                </div>
            `);
        }

        return `
            <div class="body-record-item">
                <div class="body-record-time">
                    <span class="time-text">${timeStr}</span>
                </div>
                <div class="body-record-data">
                    ${dataFields.join('')}
                </div>
                <button class="edit-btn edit-body-btn" data-record-id="${record.id}" title="编辑记录">
                    ✏️
                </button>
            </div>
        `;
    }

    // 格式化日期时间
    formatDateTime(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    // 获取最新的身材数据（用于其他功能调用）
    getLatestRecord() {
        if (this.records.length === 0) return null;
        return this.records[0];
    }

    // 获取所有记录（用于数据导出等功能）
    getAllRecords() {
        return this.records;
    }

    // 显示编辑弹窗
    showEditModal(recordId) {
        const record = this.records.find(r => r.id === recordId);
        if (!record) return;

        this.currentEditId = recordId;
        
        // 填充表单数据
        document.getElementById('edit-weight').value = record.data.weight || '';
        document.getElementById('edit-chest').value = record.data.chest || '';
        document.getElementById('edit-waist').value = record.data.waist || '';
        document.getElementById('edit-hip').value = record.data.hip || '';
        document.getElementById('edit-upper-chest').value = record.data.upperChest || '';
        document.getElementById('edit-lower-chest').value = record.data.lowerChest || '';

        document.getElementById('body-edit-modal').classList.remove('hidden');
    }

    // 隐藏编辑弹窗
    hideEditModal() {
        document.getElementById('body-edit-modal').classList.add('hidden');
        this.currentEditId = null;
    }

    // 更新记录
    updateRecord() {
        if (!this.currentEditId) return;

        const weight = document.getElementById('edit-weight').value;
        const chest = document.getElementById('edit-chest').value;
        const waist = document.getElementById('edit-waist').value;
        const hip = document.getElementById('edit-hip').value;
        const upperChest = document.getElementById('edit-upper-chest').value;
        const lowerChest = document.getElementById('edit-lower-chest').value;

        // 验证至少填写一项
        if (!weight && !chest && !upperChest && !lowerChest && !waist && !hip) {
            alert('请至少填写一项身材数据！');
            return;
        }

        // 查找并更新记录
        const recordIndex = this.records.findIndex(r => r.id === this.currentEditId);
        if (recordIndex !== -1) {
            this.records[recordIndex] = {
                ...this.records[recordIndex],
                data: {
                    weight: weight ? parseFloat(weight) : null,
                    chest: chest ? parseFloat(chest) : null,
                    upperChest: upperChest ? parseFloat(upperChest) : null,
                    lowerChest: lowerChest ? parseFloat(lowerChest) : null,
                    waist: waist ? parseFloat(waist) : null,
                    hip: hip ? parseFloat(hip) : null
                }
            };

            // 保存到localStorage
            this.saveRecords();

            // 重新渲染记录
            this.renderRecords();

            // 隐藏弹窗
            this.hideEditModal();

            // 显示成功提示
            alert('身材记录更新成功！');
            
            // 触发身材数据更新事件
            window.dispatchEvent(new Event('bodyRecordUpdated'));
        }
    }
}

// 页面加载完成后初始化身材记录功能
document.addEventListener('DOMContentLoaded', () => {
    // 初始化身材记录管理器
    window.bodyRecordManager = new BodyRecordManager();
});
