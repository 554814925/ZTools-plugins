<script setup>
import { onMounted, ref } from 'vue';
import showToast from '../../utils/toast';
import packageJson from '../../../package';

const emit = defineEmits(['loadData']);

const currentMenu = ref('setting');

const defaultPath = window.utools.getPath('downloads');

const downloadPath = ref('');

const onChange = () => {
  console.log(downloadPath.value);
  window.utools.dbStorage.setItem('downloadPath', downloadPath.value);
};

const selectFolder = () => {
  const path = window.utools.showOpenDialog({
    title: '选择下载路径',
    defaultPath: downloadPath.value,
    properties: ['openDirectory'],
  });
  if (path) {
    downloadPath.value = path[0];
    onChange();
    showToast('已选择新的下载路径');
  }
};

const history = ref([]);

const deleteHistory = (index) => {
  console.log(history.value);

  history.value.splice(index, 1);
  window.utools.dbStorage.setItem(
    'history',
    JSON.parse(JSON.stringify(history.value))
  );
};

const clearHistory = () => {
  window.utools.dbStorage.setItem('history', []);
  history.value = [];
  showToast('已清空解析记录');
};

const showConfirmPopover = ref(false);

const version = ref(packageJson.version);

onMounted(() => {
  downloadPath.value =
    window.utools.dbStorage.getItem('downloadPath') || defaultPath;
  history.value = window.utools.dbStorage.getItem('history') || [];
});
</script>
<template>
  <div class="preference-content">
    <div class="menu">
      <div
        class="menu-item"
        :class="{ active: currentMenu === 'setting' }"
        @click="currentMenu = 'setting'"
      >
        偏好设置
      </div>
      <div
        class="menu-item"
        :class="{ active: currentMenu === 'about' }"
        @click="currentMenu = 'about'"
      >
        关于应用
      </div>
      <div
        class="menu-item"
        :class="{ active: currentMenu === 'history' }"
        @click="currentMenu = 'history'"
      >
        解析记录
      </div>
    </div>
    <div class="menu-content">
      <!-- 设置 -->
      <div v-if="currentMenu === 'setting'" class="setting">
        <div class="setting-item">
          <label for="downloadPath">下载路径</label>
          <input
            type="text"
            id="downloadPath"
            placeholder="选择下载路径"
            v-model="downloadPath"
            @change="onChange"
          />
          <div class="folder-icon" @click="selectFolder" title="选择文件夹">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0f172a"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"
              />
            </svg>
          </div>
        </div>
      </div>
      <!-- 关于 -->
      <div v-if="currentMenu === 'about'" class="about">
        <h3>轻溪去水印</h3>
        <p>版本: {{ version }}</p>
        <p>本工具仅用于学习交流，请勿用于商业用途。</p>
        <p>注意：频繁解析可能导致平台限制，建议合理使用哦。</p>
        <div class="popover-container">
          <span class="popover-title">
            <svg
              t="1765890115390"
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="4655"
              width="14"
              height="14"
            >
              <path
                d="M626.176 279.552c74.24 0 134.656 55.808 134.656 124.928 0 21.504-6.144 42.496-17.408 61.44-16.896 27.648-44.032 48.128-76.8 57.856-8.704 2.56-15.36 3.584-21.504 3.584-14.336 0-25.6-11.264-25.6-25.6s11.264-25.6 25.6-25.6c1.024 0 3.072 0 5.632-1.024 22.016-6.144 39.424-18.944 49.152-35.84 6.656-10.752 9.728-22.528 9.728-34.816 0-40.448-37.376-73.728-82.944-73.728-15.872 0-31.232 4.096-45.056 11.776-24.064 13.824-38.4 36.864-38.4 61.952v214.528c0 43.52-24.064 83.456-64 105.984-21.504 12.288-45.568 18.432-70.144 18.432-74.24 0-134.656-55.808-134.656-124.928 0-21.504 6.144-42.496 17.408-61.44 16.896-27.648 44.032-48.128 76.8-57.856 9.216-2.56 15.36-3.584 21.504-3.584 14.336 0 25.6 11.264 25.6 25.6s-11.264 25.6-25.6 25.6c-1.024 0-3.072 0-5.632 1.024-22.016 6.656-39.424 19.456-49.152 35.84-6.656 10.752-9.728 22.528-9.728 34.816 0 40.448 37.376 73.728 83.456 73.728 15.872 0 31.232-4.096 45.056-11.776 24.064-13.824 38.4-36.864 38.4-61.952V404.48c0-43.52 24.064-83.456 64-105.984 20.992-12.8 45.056-18.944 69.632-18.944z m-520.704 230.4c0 226.304 183.296 409.6 409.6 409.6s409.6-183.296 409.6-409.6-183.296-409.6-409.6-409.6-409.6 183.296-409.6 409.6z m-51.2 0c0-254.464 206.336-460.8 460.8-460.8s460.8 206.336 460.8 460.8-206.336 460.8-460.8 460.8-460.8-206.336-460.8-460.8z m0 0"
                fill="currentColor"
                p-id="4656"
              ></path>
            </svg>
            小程序
          </span>
          <div class="popover-content">
            <img class="img" src="/miniprogram.png" alt="小程序" />
          </div>
        </div>
      </div>
      <div v-if="currentMenu === 'history'" class="history">
        <!-- 清空 -->
        <div class="no-data" v-if="history.length === 0">暂无解析记录</div>
        <div class="history-item" v-for="(item, index) in history" :key="index">
          <div class="item-top">
            <div class="item-title" :title="item.content">
              {{ item.content }}
            </div>
            <div class="btn" @click="emit('loadData', item)">查看</div>
          </div>
          <div class="item-bottom">
            <div class="item-time">{{ item.time }}</div>
            <div
              class="delete-btn"
              title="删除当前记录"
              @click="deleteHistory(index)"
            >
              ×
            </div>
          </div>
        </div>
      </div>
      <div class="history-toolbar">
        <div
          class="confirm-popover"
          v-if="currentMenu === 'history' && history.length > 0"
        >
          <div
            class="clear-btn"
            @click="showConfirmPopover = true"
            title="一键清空"
          >
            清空
          </div>
          <div
            class="confirm-popover-content"
            :class="showConfirmPopover ? 'confirm-popover-show' : ''"
          >
            <div class="confirm-title">💬 确认清空解析记录？</div>
            <div class="confirm-btn-group">
              <div class="cancel-btn" @click="showConfirmPopover = false">
                取消
              </div>
              <div class="confirm-btn" @click="clearHistory">确认</div>
            </div>
          </div>
        </div>
        <span v-if="currentMenu === 'history'" class="history-tip"
          >只显示最近50条记录</span
        >
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.preference-content {
  display: flex;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
}

.menu {
  width: 120px;
  // background-color: #f8f9fa;
  padding: 20px 0;
  border-right: 1px solid #e9ecef;
  padding-top: 0;
}

.menu-item {
  padding: 12px 20px;
  cursor: pointer;
  font-size: 14px;
  color: #495057;
  transition: background-color 0.3s, color 0.3s;
  border-radius: 4px;
  margin: 5px 10px;
}

.menu-item:hover {
  background-color: #e9ecef;
  color: #212529;
}

.menu-item.active {
  background-color: #0f172a;
  color: white;
}

.menu-content {
  flex: 1;
  padding: 20px;
  padding-top: 0;
  background-color: #ffffff;
  position: relative;
}

.setting-item {
  margin-bottom: 20px;
  position: relative;

  .folder-icon {
    position: absolute;
    right: 8px;
    bottom: 8px;
    cursor: pointer;
  }
}

.setting-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
  font-size: 14px;
}

.setting-item input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s, box-shadow 0.3s;
  box-sizing: border-box;
  padding-right: 30px;
}

.setting-item input:focus {
  border-color: #1e293b;
  outline: none;
  border: 1px solid #1e293b;
  // 黑色阴影
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 1);
}

.about {
  h3 {
    margin-bottom: 15px;
    color: #495057;
    margin-top: 0;
  }
  p {
    margin-bottom: 10px;
    color: #6c757d;
    line-height: 1.5;
  }
}

.active {
  background-color: #0f172a;
  color: #fff;
}

.popover-container {
  position: relative;
  display: inline-block;
  color: #6c757d;

  .popover-title {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;

    .icon {
      margin-top: 2px;
    }
  }

  .popover-content {
    // display: none;
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #fff;
    border-radius: 4px;
    z-index: 1;
    transition: opacity 0.3s;
    // opacity: 0;
  }

  &:hover .popover-content {
    opacity: 1;
    padding: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border: 1px solid #e9ecef;

    .img {
      width: 120px;
      height: 120px;
    }
  }

  .img {
    width: 0;
    height: 0;
    object-fit: cover;
    transition: width 0.3s, height 0.3s;
  }
}

.history-toolbar {
  position: absolute;
  top: 0;
  display: flex;
  align-items: center;
  gap: 5px;

  .history-tip {
    color: #6c757d;
    font-size: 12px;
  }
}

.clear-btn {
  text-align: left;
  background-color: #dc3545;
  padding: 5px 10px;
  color: white;
  cursor: pointer;
  border-radius: 3px;
  font-size: 10px;
}

.history {
  height: 280px;
  overflow-y: auto;
  margin-top: 30px;

  .no-data {
    text-align: center;
    color: #6c757d;
    font-size: 14px;
    margin-bottom: 10px;
  }

  .history-item {
    border: 1px solid #e9ecef;
    border-radius: 4px;
    padding: 10px;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .item-title {
      width: 100px;
      font-weight: 500;
      color: #495057;
      // 溢出省略
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .item-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .btn {
        background-color: #0f172a;
        color: #fff;
        padding: 6px 12px;
        border-radius: 3px;
        cursor: pointer;
        font-size: 10px;
        transition: background-color 0.3s, transform 0.1s;

        &:hover {
          background-color: #1e293b;
        }

        &:active {
          transform: scale(0.98);
        }
      }
    }

    .item-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      margin-top: 6px;
      .delete-btn {
        cursor: pointer;
        display: flex;
        padding: 2px;
        transition: color 0.3s;
        font-size: 14px;
      }

      .delete-btn:hover {
        color: red;
      }

      .item-time {
        color: #6c757d;
        font-size: 12px;
      }
    }
  }
}

.history::-webkit-scrollbar {
  display: none;
}

.confirm-popover-content {
  width: 150px;
  position: absolute;
  left: -50%;
  top: 30px;
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: scale(0);
  padding: 10px;
  transition: transform 0.3s;
  .confirm-title {
    font-size: 14px;
    color: #606266;
    transition: display 0.3s;
  }

  .confirm-btn-group {
    display: flex;
    gap: 10px;
    margin-top: 10px;
    justify-content: flex-end;
    transition: display 0.3s;

    .confirm-btn {
      background-color: #0f172a;
      color: #fff;
    }

    .confirm-btn,
    .cancel-btn {
      padding: 5px 10px;
      border-radius: 3px;
      cursor: pointer;
      transition: background-color 0.3s;
      font-size: 12px;
      &:hover {
        background-color: #e9ecef;
      }
    }

    .confirm-btn:hover {
      background-color: #1e293b;
      color: #fff;
    }
  }
}

.confirm-popover-show {
  transform: scale(1);
}
</style>
