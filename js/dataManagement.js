// 数据管理功能模块
class DataManager {
    constructor() {
        this.init();
    }

    // 初始化功能
    init() {
        this.bindEvents();
    }

    // 绑定事件
    bindEvents() {
        // 导入数据按钮
        document.getElementById('import-all-data').addEventListener('click', () => {
            document.getElementById('file-input').click();
        });

        // 文件选择事件
        document.getElementById('file-input').addEventListener('change', (e) => {
            this.importData(e);
        });

        // 导出所有数据按钮
        document.getElementById('export-all-data').addEventListener('click', () => {
            this.exportAllData();
        });

        // 清空所有数据按钮
        document.getElementById('clear-all-data').addEventListener('click', () => {
            this.clearAllData();
        });

        // 分类导出按钮
        document.querySelectorAll('.data-grid-btn[data-type]').forEach(btn => {
            if (!btn.classList.contains('danger')) {
                btn.addEventListener('click', () => {
                    const type = btn.getAttribute('data-type');
                    this.exportDataByType(type);
                });
            }
        });

        // 分类清空按钮
        document.querySelectorAll('.data-grid-btn.danger[data-type]').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.getAttribute('data-type');
                this.clearDataByType(type);
            });
        });
    }

    // 导入数据
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 验证文件类型
        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
            alert('请选择JSON格式的文件！');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // 验证数据格式
                if (!this.validateImportedData(importedData)) {
                    alert('导入失败：数据格式不正确');
                    return;
                }

                // 合并数据（而不是覆盖）
                this.mergeData(importedData);
                
                alert('数据导入成功！');
            } catch (error) {
                alert('导入失败：文件格式错误或文件已损坏');
                console.error('Import error:', error);
            }
        };
        
        reader.readAsText(file);
        // 重置文件输入，允许重新选择同一文件
        event.target.value = '';
    }

    // 验证导入的数据格式
    validateImportedData(data) {
        if (typeof data !== 'object' || data === null) {
            return false;
        }
        
        // 检查数据类型是否合法
        const validKeys = ['fitnessPlans', 'currentPlan', 'trainingHistory', 'bodyRecords', 'dietaryRecords', 'userProfile'];
        
        // 检查是否包含有效的数据键
        const hasValidData = Object.keys(data).some(key => validKeys.includes(key));
        
        return hasValidData;
    }

    // 合并数据
    mergeData(importedData) {
        // 合并训练计划
        if (importedData.fitnessPlans && Array.isArray(importedData.fitnessPlans)) {
            const existingPlans = JSON.parse(localStorage.getItem('fitnessPlans') || '[]');
            const mergedPlans = [...existingPlans];
            
            importedData.fitnessPlans.forEach(importedPlan => {
                // 检查是否已存在同名计划
                const existingIndex = mergedPlans.findIndex(plan => plan.name === importedPlan.name);
                if (existingIndex >= 0) {
                    // 更新现有计划
                    mergedPlans[existingIndex] = importedPlan;
                } else {
                    // 添加新计划
                    mergedPlans.push(importedPlan);
                }
            });
            
            localStorage.setItem('fitnessPlans', JSON.stringify(mergedPlans));
        }

        // 合并训练历史
        if (importedData.trainingHistory && Array.isArray(importedData.trainingHistory)) {
            const existingHistory = JSON.parse(localStorage.getItem('trainingHistory') || '[]');
            const mergedHistory = [...existingHistory];
            
            importedData.trainingHistory.forEach(importedEntry => {
                // 检查是否已存在同一天的记录
                const existingIndex = mergedHistory.findIndex(entry => entry.date === importedEntry.date);
                if (existingIndex >= 0) {
                    // 更新现有记录
                    mergedHistory[existingIndex] = importedEntry;
                } else {
                    // 添加新记录
                    mergedHistory.push(importedEntry);
                }
            });
            
            localStorage.setItem('trainingHistory', JSON.stringify(mergedHistory));
        }

        // 合并身材记录
        if (importedData.bodyRecords && Array.isArray(importedData.bodyRecords)) {
            const existingRecords = JSON.parse(localStorage.getItem('bodyRecords') || '[]');
            const mergedRecords = [...existingRecords, ...importedData.bodyRecords];
            
            // 按时间排序
            mergedRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            localStorage.setItem('bodyRecords', JSON.stringify(mergedRecords));
        }

        // 合并饮食记录
        if (importedData.dietaryRecords && Array.isArray(importedData.dietaryRecords)) {
            const existingRecords = JSON.parse(localStorage.getItem('dietaryRecords') || '[]');
            const mergedRecords = [...existingRecords, ...importedData.dietaryRecords];
            
            // 按时间排序
            mergedRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            localStorage.setItem('dietaryRecords', JSON.stringify(mergedRecords));
        }

        // 更新当前计划（如果有）
        if (importedData.currentPlan) {
            localStorage.setItem('currentPlan', importedData.currentPlan);
        }

        // 更新用户档案（如果有）
        if (importedData.userProfile) {
            localStorage.setItem('userProfile', JSON.stringify(importedData.userProfile));
        }

        // 合并每日训练记录
        Object.keys(importedData).forEach(key => {
            if (key.startsWith('training_')) {
                const existingData = localStorage.getItem(key);
                if (!existingData) {
                    // 如果本地没有该日期的记录，则直接添加
                    localStorage.setItem(key, JSON.stringify(importedData[key]));
                }
            }
        });
    }

    // 导出所有数据
    exportAllData() {
        try {
            const exportData = {};
            
            // 收集所有数据
            exportData.fitnessPlans = JSON.parse(localStorage.getItem('fitnessPlans') || '[]');
            exportData.currentPlan = localStorage.getItem('currentPlan') || '';
            exportData.trainingHistory = JSON.parse(localStorage.getItem('trainingHistory') || '[]');
            exportData.bodyRecords = JSON.parse(localStorage.getItem('bodyRecords') || '[]');
            exportData.dietaryRecords = JSON.parse(localStorage.getItem('dietaryRecords') || '[]');
            exportData.userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
            
            // 收集每日训练记录
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('training_')) {
                    try {
                        exportData[key] = JSON.parse(localStorage.getItem(key));
                    } catch (e) {
                        console.warn(`Failed to parse ${key}:`, e);
                    }
                }
            }
            
            // 检查是否有数据可导出
            const hasData = Object.values(exportData).some(data => 
                (Array.isArray(data) && data.length > 0) || 
                (typeof data === 'object' && data !== null && Object.keys(data).length > 0) ||
                (typeof data === 'string' && data.length > 0)
            );
            
            if (!hasData) {
                alert('没有数据可导出！');
                return;
            }
            
            // 创建JSON文件并下载
            this.downloadJSON(exportData, `fitness-all-data-${new Date().toISOString().split('T')[0]}.json`);
            
            alert('数据导出成功！');
        } catch (error) {
            alert('导出失败：' + error.message);
            console.error('Export error:', error);
        }
    }

    // 按类型导出数据
    exportDataByType(type) {
        try {
            let exportData = {};
            let fileName = '';
            
            switch (type) {
                case 'training':
                    // 导出训练记录（历史记录和每日记录）
                    exportData.trainingHistory = JSON.parse(localStorage.getItem('trainingHistory') || '[]');
                    
                    // 收集每日训练记录
                    const dailyRecords = {};
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key.startsWith('training_')) {
                            dailyRecords[key] = JSON.parse(localStorage.getItem(key));
                        }
                    }
                    exportData.dailyRecords = dailyRecords;
                    
                    fileName = `fitness-training-data-${new Date().toISOString().split('T')[0]}.json`;
                    break;
                    
                case 'plans':
                    // 导出训练计划
                    exportData.fitnessPlans = JSON.parse(localStorage.getItem('fitnessPlans') || '[]');
                    exportData.currentPlan = localStorage.getItem('currentPlan') || '';
                    fileName = `fitness-plans-${new Date().toISOString().split('T')[0]}.json`;
                    break;
                    
                case 'body':
                    // 导出身材记录
                    exportData.bodyRecords = JSON.parse(localStorage.getItem('bodyRecords') || '[]');
                    fileName = `fitness-body-records-${new Date().toISOString().split('T')[0]}.json`;
                    break;
                    
                case 'dietary':
                    // 导出饮食记录
                    exportData.dietaryRecords = JSON.parse(localStorage.getItem('dietaryRecords') || '[]');
                    fileName = `fitness-dietary-records-${new Date().toISOString().split('T')[0]}.json`;
                    break;
                    
                default:
                    alert('未知的数据类型！');
                    return;
            }
            
            // 检查是否有数据可导出
            const hasData = Object.values(exportData).some(data => 
                (Array.isArray(data) && data.length > 0) || 
                (typeof data === 'object' && data !== null && Object.keys(data).length > 0) ||
                (typeof data === 'string' && data.length > 0)
            );
            
            if (!hasData) {
                alert(`没有${this.getTypeDisplayName(type)}可导出！`);
                return;
            }
            
            // 创建JSON文件并下载
            this.downloadJSON(exportData, fileName);
            
            alert(`${this.getTypeDisplayName(type)}导出成功！`);
        } catch (error) {
            alert('导出失败：' + error.message);
            console.error('Export error:', error);
        }
    }

    // 清空所有数据
    clearAllData() {
        if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
            try {
                // 获取所有需要清空的键
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (this.isFitnessDataKey(key)) {
                        keysToRemove.push(key);
                    }
                }
                
                // 清空数据
                keysToRemove.forEach(key => {
                    localStorage.removeItem(key);
                });
                
                alert('所有数据已清空！');
            } catch (error) {
                alert('清空数据失败：' + error.message);
                console.error('Clear error:', error);
            }
        }
    }

    // 按类型清空数据
    clearDataByType(type) {
        const typeName = this.getTypeDisplayName(type);
        
        if (confirm(`确定要清空所有${typeName}吗？此操作不可恢复！`)) {
            try {
                switch (type) {
                    case 'training':
                        // 清空训练记录
                        localStorage.removeItem('trainingHistory');
                        
                        // 清空每日训练记录
                        for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i);
                            if (key.startsWith('training_')) {
                                localStorage.removeItem(key);
                            }
                        }
                        break;
                        
                    case 'plans':
                        // 清空训练计划
                        localStorage.removeItem('fitnessPlans');
                        localStorage.removeItem('currentPlan');
                        break;
                        
                    case 'body':
                        // 清空身材记录
                        localStorage.removeItem('bodyRecords');
                        break;
                        
                    case 'dietary':
                        // 清空饮食记录
                        localStorage.removeItem('dietaryRecords');
                        break;
                        
                    default:
                        alert('未知的数据类型！');
                        return;
                }
                
                alert(`${typeName}已清空！`);
            } catch (error) {
                alert('清空数据失败：' + error.message);
                console.error('Clear error:', error);
            }
        }
    }

    // 判断是否为健身相关的数据键
    isFitnessDataKey(key) {
        const fitnessKeys = [
            'fitnessPlans',
            'currentPlan',
            'trainingHistory',
            'bodyRecords',
            'dietaryRecords',
            'userProfile'
        ];
        
        return fitnessKeys.includes(key) || key.startsWith('training_');
    }

    // 获取数据类型的显示名称
    getTypeDisplayName(type) {
        const typeNames = {
            'training': '训练记录',
            'plans': '训练计划',
            'body': '身材记录',
            'dietary': '饮食记录'
        };
        
        return typeNames[type] || type;
    }

    // 下载JSON文件
    downloadJSON(data, fileName) {
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    }
}

// 页面加载完成后初始化数据管理功能
document.addEventListener('DOMContentLoaded', () => {
    window.dataManager = new DataManager();
});
