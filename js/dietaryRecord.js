// 饮食记录功能模块
class DietaryRecordManager {
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
        document.getElementById('record-dietary-btn').addEventListener('click', () => {
            this.showAddModal();
        });

        // 添加弹窗事件
        document.getElementById('close-dietary-modal').addEventListener('click', () => {
            this.hideAddModal();
        });

        document.getElementById('cancel-dietary-record').addEventListener('click', () => {
            this.hideAddModal();
        });

        document.getElementById('confirm-dietary-record').addEventListener('click', () => {
            this.saveRecord();
        });

        // 编辑弹窗事件
        document.getElementById('close-dietary-edit-modal').addEventListener('click', () => {
            this.hideEditModal();
        });

        document.getElementById('cancel-dietary-edit').addEventListener('click', () => {
            this.hideEditModal();
        });

        document.getElementById('confirm-dietary-edit').addEventListener('click', () => {
            this.updateRecord();
        });

        // 点击弹窗外部关闭
        document.getElementById('dietary-record-modal').addEventListener('click', (e) => {
            if (e.target.id === 'dietary-record-modal') {
                this.hideAddModal();
            }
        });

        document.getElementById('dietary-edit-modal').addEventListener('click', (e) => {
            if (e.target.id === 'dietary-edit-modal') {
                this.hideEditModal();
            }
        });

        // ESC键关闭弹窗
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAddModal();
                this.hideEditModal();
            }
        });
    }

    // 显示添加弹窗
    showAddModal() {
        document.getElementById('dietary-record-modal').classList.remove('hidden');
        this.clearAddInputs();
    }

    // 隐藏添加弹窗
    hideAddModal() {
        document.getElementById('dietary-record-modal').classList.add('hidden');
    }

    // 显示编辑弹窗
    showEditModal(recordId) {
        const record = this.records.find(r => r.id === recordId);
        if (!record) return;

        this.currentEditId = recordId;
        
        // 填充表单数据
        document.querySelectorAll('input[name="edit-meal-time"]').forEach(radio => {
            radio.checked = radio.value === record.mealTime;
        });
        
        document.getElementById('edit-food-description').value = record.description || '';
        document.getElementById('edit-calories').value = record.calories || '';

        document.getElementById('dietary-edit-modal').classList.remove('hidden');
    }

    // 隐藏编辑弹窗
    hideEditModal() {
        document.getElementById('dietary-edit-modal').classList.add('hidden');
        this.currentEditId = null;
    }

    // 清空添加表单
    clearAddInputs() {
        document.querySelectorAll('input[name="meal-time"]').forEach(radio => {
            radio.checked = false;
        });
        document.getElementById('food-description').value = '';
        document.getElementById('calories').value = '';
    }

    // 保存新记录
    saveRecord() {
        // 获取时段选择
        const mealTimeRadio = document.querySelector('input[name="meal-time"]:checked');
        if (!mealTimeRadio) {
            alert('请选择饮食时段！');
            return;
        }

        const mealTime = mealTimeRadio.value;
        const description = document.getElementById('food-description').value.trim();
        const calories = document.getElementById('calories').value ? 
            parseInt(document.getElementById('calories').value) : null;

        // 创建记录对象
        const record = {
            id: Date.now().toString(),
            timestamp: new Date(),
            mealTime: mealTime,
            description: description || null,
            calories: calories
        };

        // 添加到记录列表
        this.records.push(record);

        // 保存到localStorage
        this.saveRecords();

        // 重新渲染记录
        this.renderRecords();

        // 隐藏弹窗
        this.hideAddModal();

        // 显示成功提示
        alert('饮食记录保存成功！');
    }

    // 更新记录
    updateRecord() {
        if (!this.currentEditId) return;

        // 获取时段选择
        const mealTimeRadio = document.querySelector('input[name="edit-meal-time"]:checked');
        if (!mealTimeRadio) {
            alert('请选择饮食时段！');
            return;
        }

        const mealTime = mealTimeRadio.value;
        const description = document.getElementById('edit-food-description').value.trim();
        const calories = document.getElementById('edit-calories').value ? 
            parseInt(document.getElementById('edit-calories').value) : null;

        // 查找并更新记录
        const recordIndex = this.records.findIndex(r => r.id === this.currentEditId);
        if (recordIndex !== -1) {
            this.records[recordIndex] = {
                ...this.records[recordIndex],
                mealTime: mealTime,
                description: description || null,
                calories: calories
            };

            // 保存到localStorage
            this.saveRecords();

            // 重新渲染记录
            this.renderRecords();

            // 隐藏弹窗
            this.hideEditModal();

            // 显示成功提示
            alert('饮食记录更新成功！');
        }
    }

    // 加载记录
    loadRecords() {
        const stored = localStorage.getItem('dietaryRecords');
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
        localStorage.setItem('dietaryRecords', JSON.stringify(this.records));
    }

    // 渲染记录列表
    renderRecords() {
        const container = document.getElementById('dietary-records-list');
        
        // 按时间倒序排序
        this.records.sort((a, b) => b.timestamp - a.timestamp);

        if (this.records.length === 0) {
            container.innerHTML = '<p class="no-data">暂无饮食记录</p>';
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
        document.querySelectorAll('.edit-dietary-btn').forEach(btn => {
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
        const descriptionHtml = record.description ? 
            `<div class="food-description">${this.escapeHtml(record.description)}</div>` : '';
        const caloriesHtml = record.calories !== null ? 
            `<div class="calories-info">
                <span class="calories-icon">🔥</span>
                <span class="calories-value">${record.calories} kcal</span>
            </div>` : '';

        return `
            <div class="dietary-record-item">
                <div class="dietary-record-header">
                    <div class="dietary-record-time">
                        <span class="time-text">${timeStr}</span>
                    </div>
                    <div class="meal-time-badge ${this.getMealTimeClass(record.mealTime)}">${record.mealTime}</div>
                    <button class="edit-btn edit-dietary-btn" data-record-id="${record.id}" title="编辑记录">
                        ✏️
                    </button>
                </div>
                <div class="dietary-record-content">
                    ${descriptionHtml}
                    ${caloriesHtml}
                </div>
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

    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 根据时段获取CSS类名
    getMealTimeClass(mealTime) {
        switch(mealTime) {
            case '早餐':
                return 'breakfast';
            case '午餐':
                return 'lunch';
            case '晚餐':
                return 'dinner';
            case '加餐':
                return 'snack';
            default:
                return 'lunch';
        }
    }

    // 获取今日记录（用于其他功能调用）
    getTodayRecords() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return this.records.filter(record => {
            const recordDate = new Date(record.timestamp);
            return recordDate >= today && recordDate < tomorrow;
        });
    }

    // 获取今日总热量
    getTodayTotalCalories() {
        const todayRecords = this.getTodayRecords();
        return todayRecords.reduce((total, record) => {
            return total + (record.calories || 0);
        }, 0);
    }

    // 获取所有记录（用于数据导出等功能）
    getAllRecords() {
        return this.records;
    }
}

// 页面加载完成后初始化饮食记录功能
document.addEventListener('DOMContentLoaded', () => {
    // 初始化饮食记录管理器
    window.dietaryRecordManager = new DietaryRecordManager();
});