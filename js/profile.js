// 个人档案功能模块
class ProfileManager {
    constructor() {
        this.profile = this.loadProfile();
        this.init();
    }

    // 初始化功能
    init() {
        this.bindEvents();
        this.updateDisplay();
        this.setupBirthdateMax();
    }

    // 绑定事件
    bindEvents() {
        // 编辑身高按钮点击事件
        document.getElementById('edit-height-btn').addEventListener('click', () => {
            this.showEditHeightModal();
        });

        // 关闭身高编辑弹窗事件
        document.getElementById('close-edit-height-modal').addEventListener('click', () => {
            this.hideEditHeightModal();
        });

        document.getElementById('cancel-edit-height').addEventListener('click', () => {
            this.hideEditHeightModal();
        });

        // 确认编辑身高事件
        document.getElementById('confirm-edit-height').addEventListener('click', () => {
            this.updateHeight();
        });

        // 点击身高编辑弹窗外部关闭
        document.getElementById('edit-height-modal').addEventListener('click', (e) => {
            if (e.target.id === 'edit-height-modal') {
                this.hideEditHeightModal();
            }
        });

        // 关闭初始化弹窗事件
        document.getElementById('close-profile-init-modal').addEventListener('click', () => {
            // 初始化弹窗不允许关闭，必须填写信息
            alert('请完善个人基本信息！');
        });

        // 确认初始化信息事件
        document.getElementById('confirm-profile-init').addEventListener('click', () => {
            this.saveInitialInfo();
        });

        // 点击初始化弹窗外部不关闭
        document.getElementById('profile-init-modal').addEventListener('click', (e) => {
            if (e.target.id === 'profile-init-modal') {
                e.stopPropagation();
            }
        });

        // 监听身材数据更新
        window.addEventListener('bodyRecordUpdated', () => {
            this.updateBodyData();
        });
    }

    // 设置出生年月最大日期为今天
    setupBirthdateMax() {
        const today = new Date();
        const maxDate = today.toISOString().split('T')[0];
        document.getElementById('birthdate').max = maxDate;
    }

    // 显示个人档案页面
    showProfilePage() {
        // 检查是否需要显示初始化弹窗
        if (!this.profile.gender || !this.profile.birthdate) {
            this.showInitModal();
        }
        this.updateDisplay();
    }

    // 显示初始化弹窗
    showInitModal() {
        document.getElementById('profile-init-modal').classList.remove('hidden');
    }

    // 隐藏初始化弹窗
    hideInitModal() {
        document.getElementById('profile-init-modal').classList.add('hidden');
    }

    // 保存初始化信息
    saveInitialInfo() {
        const gender = document.querySelector('input[name="gender"]:checked')?.value;
        const birthdate = document.getElementById('birthdate').value;

        if (!gender) {
            alert('请选择性别！');
            return;
        }

        if (!birthdate) {
            alert('请选择出生年月！');
            return;
        }

        // 设置默认身高
        let defaultHeight = gender === '男' ? 170 : 160;

        this.profile = {
            gender: gender,
            birthdate: birthdate,
            height: this.profile.height || defaultHeight
        };

        this.saveProfile();
        this.hideInitModal();
        this.updateDisplay();
    }

    // 显示身高编辑弹窗
    showEditHeightModal() {
        document.getElementById('edit-height-input').value = this.profile.height || '';
        document.getElementById('edit-height-modal').classList.remove('hidden');
    }

    // 隐藏身高编辑弹窗
    hideEditHeightModal() {
        document.getElementById('edit-height-modal').classList.add('hidden');
    }

    // 更新身高
    updateHeight() {
        const height = document.getElementById('edit-height-input').value;

        if (!height) {
            alert('请输入身高！');
            return;
        }

        const heightValue = parseFloat(height);
        if (isNaN(heightValue) || heightValue < 100 || heightValue > 250) {
            alert('请输入有效的身高（100-250cm）！');
            return;
        }

        this.profile.height = heightValue;
        this.saveProfile();
        this.hideEditHeightModal();
        this.updateDisplay();
        alert('身高更新成功！');
    }

    // 计算年龄
    calculateAge() {
        if (!this.profile.birthdate) return '--';

        const birthDate = new Date(this.profile.birthdate);
        const today = new Date();
        
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    // 更新显示
    updateDisplay() {
        // 更新基本信息
        document.getElementById('profile-gender').textContent = this.profile.gender || '未设置';
        document.getElementById('profile-age').textContent = this.profile.birthdate ? `${this.calculateAge()}岁` : '--';
        
        // 更新身高
        document.getElementById('profile-height').textContent = this.profile.height ? `${this.profile.height} cm` : '--';
        
        // 更新身材数据
        this.updateBodyData();
    }

    // 更新身材数据
    updateBodyData() {
        // 尝试从bodyRecordManager获取最新数据
        if (window.bodyRecordManager) {
            const latestRecord = window.bodyRecordManager.getLatestRecord();
            if (latestRecord && latestRecord.data) {
                const data = latestRecord.data;
                document.getElementById('profile-weight').textContent = data.weight ? `${data.weight} kg` : '--';
                document.getElementById('profile-chest').textContent = data.chest ? `${data.chest} cm` : '--';
                document.getElementById('profile-waist').textContent = data.waist ? `${data.waist} cm` : '--';
                document.getElementById('profile-hip').textContent = data.hip ? `${data.hip} cm` : '--';
                
                // 触发健康指数更新
                this.updateHealthIndex();
            }
        }
    }

    // 更新健康指数
    updateHealthIndex() {
        this.calculateAll();
    }

    // 计算BMI
    calculateBMI(weight, height) {
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        return Math.round(bmi * 100) / 100; // 保留两位小数
    }

    // 计算BMR
    calculateBMR(gender, weight, height, age) {
        let bmr;
        if (gender === '男') {
            // 男性公式：BMR = 10×体重(kg) + 6.25×身高(cm) - 5×年龄 + 5
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            // 女性公式：BMR = 10×体重(kg) + 6.25×身高(cm) - 5×年龄 - 161
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }
        return Math.round(bmr); // 保留整数
    }

    // 判定BMI状态
    getBMIStatus(bmi) {
        if (bmi < 18.5) {
            return {
                status: '偏低',
                class: 'bmi-underweight',
                color: '#007bff'
            };
        } else if (bmi >= 18.5 && bmi <= 23.9) {
            return {
                status: '正常',
                class: 'bmi-normal',
                color: '#28a745'
            };
        } else if (bmi >= 24.0 && bmi <= 27.9) {
            return {
                status: '超重',
                class: 'bmi-overweight',
                color: '#ffc107'
            };
        } else {
            return {
                status: '肥胖',
                class: 'bmi-obese',
                color: '#dc3545'
            };
        }
    }

    // 判定BMR状态
    getBMRStatus(gender, age, bmr) {
        // 简化的BMR标准判定（实际应该有更复杂的标准表）
        let avgBMR;
        
        if (gender === '男') {
            // 男性平均BMR参考值
            if (age < 30) avgBMR = 1800;
            else if (age < 50) avgBMR = 1600;
            else avgBMR = 1400;
        } else {
            // 女性平均BMR参考值
            if (age < 30) avgBMR = 1500;
            else if (age < 50) avgBMR = 1300;
            else avgBMR = 1200;
        }

        if (bmr < avgBMR * 0.9) {
            return {
                status: '偏低',
                class: 'bmr-low',
                color: '#007bff'
            };
        } else {
            return {
                status: '正常',
                class: 'bmr-normal',
                color: '#28a745'
            };
        }
    }

    // 更新BMI显示
    updateBMIDisplay(bmi, status) {
        const bmiCard = document.getElementById('bmi-card');
        const bmiValue = document.getElementById('bmi-value');
        const bmiStatus = document.getElementById('bmi-status');

        // 更新数值
        bmiValue.textContent = bmi;
        bmiValue.style.color = status.color;

        // 更新状态
        bmiStatus.textContent = `BMI：${status.status}`;
        bmiStatus.style.background = status.color;
        bmiStatus.style.color = 'white';

        // 更新卡片样式
        bmiCard.className = `calculation-card ${status.class}`;
    }

    // 更新BMR显示
    updateBMRDisplay(bmr, status) {
        const bmrCard = document.getElementById('bmr-card');
        const bmrValue = document.getElementById('bmr-value');
        const bmrStatus = document.getElementById('bmr-status');

        // 更新数值
        bmrValue.textContent = bmr;
        bmrValue.style.color = status.color;

        // 更新状态
        bmrStatus.textContent = `BMR：${status.status}`;
        bmrStatus.style.background = status.color;
        bmrStatus.style.color = 'white';

        // 更新卡片样式
        bmrCard.className = `calculation-card ${status.class}`;
    }

    // 重置显示
    resetDisplay() {
        // 重置BMI显示
        document.getElementById('bmi-value').textContent = '--';
        document.getElementById('bmi-value').style.color = '#2c3e50';
        document.getElementById('bmi-status').textContent = '请输入基础数据';
        document.getElementById('bmi-status').style.background = '#e9ecef';
        document.getElementById('bmi-status').style.color = '#495057';
        document.getElementById('bmi-card').className = 'calculation-card';

        // 重置BMR显示
        document.getElementById('bmr-value').textContent = '--';
        document.getElementById('bmr-value').style.color = '#2c3e50';
        document.getElementById('bmr-status').textContent = '请输入基础数据';
        document.getElementById('bmr-status').style.background = '#e9ecef';
        document.getElementById('bmr-status').style.color = '#495057';
        document.getElementById('bmr-card').className = 'calculation-card';
    }

    // 执行所有计算
    calculateAll() {
        // 获取用户数据
        const gender = this.profile.gender;
        const age = this.calculateAge();
        const height = this.profile.height;
        
        // 获取体重数据
        let weight = null;
        if (window.bodyRecordManager) {
            const latestRecord = window.bodyRecordManager.getLatestRecord();
            if (latestRecord && latestRecord.data.weight) {
                weight = parseFloat(latestRecord.data.weight);
            }
        }

        // 验证数据完整性
        if (!gender || !age || !height || !weight || age < 1 || age > 120 || height < 100 || height > 250 || weight < 30 || weight > 200) {
            this.resetDisplay();
            return;
        }

        // 计算BMI
        const bmi = this.calculateBMI(weight, height);
        const bmiStatus = this.getBMIStatus(bmi);
        this.updateBMIDisplay(bmi, bmiStatus);

        // 计算BMR
        const bmr = this.calculateBMR(gender, weight, height, age);
        const bmrStatus = this.getBMRStatus(gender, age, bmr);
        this.updateBMRDisplay(bmr, bmrStatus);
    }

    // 格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    }

    // 加载个人档案
    loadProfile() {
        const stored = localStorage.getItem('userProfile');
        if (stored) {
            return JSON.parse(stored);
        }
        return {
            gender: null,
            birthdate: null,
            height: null
        };
    }

    // 保存个人档案
    saveProfile() {
        localStorage.setItem('userProfile', JSON.stringify(this.profile));
        // 触发个人档案更新事件
        window.dispatchEvent(new CustomEvent('profileUpdated'));
    }

    // 获取身高（供其他模块使用）
    getHeight() {
        return this.profile.height;
    }

    // 获取性别（供其他模块使用）
    getGender() {
        return this.profile.gender;
    }
}

// 页面加载完成后初始化个人档案功能
document.addEventListener('DOMContentLoaded', () => {
    // 初始化个人档案管理器
    window.profileManager = new ProfileManager();

    // 监听导航切换，当切换到个人档案页面时更新显示
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.dataset.page === 'profile') {
                setTimeout(() => {
                    window.profileManager.showProfilePage();
                }, 100);
            }
        });
    });
});
