
<template>
  <div class="bookmark-panel">
    <div class="bookmark-list" v-if="bookmarks.length > 0">
      <div v-for="(bookmark, index) in bookmarks" :key="index" class="bookmark-item" @click="jumpToBookmark(index)">
        <img :src="bookmark.thumbnail" alt="ブックマークサムネイル" class="bookmark-thumbnail" />
      </div>
    </div>
    <div class="bookmark-buttons">
      <button class="bookmark-button" @click="addBookmark" :disabled="isAnimating">📸</button>
      <button class="bookmark-button" @click="playBookmarks" :disabled="isAnimating">▶️</button>
      <button class="bookmark-button" @click="deleteBookmarks" :disabled="isAnimating">🗑️</button>
    </div>

  </div>
</template>

<script>
import * as THREE from "three";
import { camera, cameraControls, renderer, scene } from "../App.vue";

export default {
  name: "BookmarkPanel",
  data() {
    return {
      bookmarks: [],
      isAnimating: false,
      animationDuration: 1000, // アニメーション時間 (ミリ秒)
    };
  },
  methods: {
    addBookmark() {
      const thumbnail = renderer.domElement.toDataURL();
      const position = camera.position.clone();
      const target = cameraControls.getTarget(new THREE.Vector3()).clone();
      const zoom = camera.zoom;

      this.bookmarks.push({ thumbnail, position, target, zoom });
    },
    jumpToBookmark(index) {
      const bookmark = this.bookmarks[index];
      camera.position.copy(bookmark.position);
      cameraControls.setTarget(bookmark.target.x, bookmark.target.y, bookmark.target.z); // cameraControls.target を直接操作せず setTarget を使用
      camera.zoom = bookmark.zoom;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    },
    playBookmarks() {
      if (this.bookmarks.length < 2 || this.isAnimating) return;

      this.isAnimating = true;
      let bookmarkIndex = 1;
      const animateCamera = () => {
        if (bookmarkIndex < this.bookmarks.length) {
          this.animateToBookmark(bookmarkIndex, () => {
            bookmarkIndex++;
            animateCamera();
          });
        } else {
          this.isAnimating = false;
        }
      };
      animateCamera();
    },
    animateToBookmark(index, onComplete) {
      const startBookmark = this.bookmarks[index - 1];
      const endBookmark = this.bookmarks[index];
      const startTime = performance.now();

      const animate = () => {
        const currentTime = performance.now();
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / this.animationDuration, 1);

        camera.position.lerpVectors(startBookmark.position, endBookmark.position, progress);
        cameraControls.setTarget( // cameraControls.target を直接操作せず setTarget を使用
          startBookmark.target.x + (endBookmark.target.x - startBookmark.target.x) * progress,
          startBookmark.target.y + (endBookmark.target.y - startBookmark.target.y) * progress,
          startBookmark.target.z + (endBookmark.target.z - startBookmark.target.z) * progress
        );
        camera.zoom = startBookmark.zoom + (endBookmark.zoom - startBookmark.zoom) * progress;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);


        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          onComplete();
        }
      };

      animate();
    },
    deleteBookmarks() {
      this.bookmarks = [];
    },
  },
  mounted() {},
};
</script>

<style scoped>
.bookmark-panel {
  position: absolute;
  bottom: 60px;
  right: 12px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: flex-end; /* ボタンを右寄せ */
}

.bookmark-buttons {
  display: flex;
  margin-bottom: 8px; /* ボタンとブックマークリストの間隔 */
}

.bookmark-button {
  background-color: white;
  border: none;
  border-radius: 22px;
  width: 44px;
  height: 44px;
  margin-left: 8px;
  cursor: pointer;
  padding: 0px;
  font-size: 1.6em;
  text-align: center;
}

.bookmark-button:disabled {
  opacity: 0.5;
  cursor: default;
}


.bookmark-button img {
  width: 24px;
  height: 24px;
  vertical-align: middle;
}

.bookmark-list {
  display: flex;
  flex-direction: row;
  overflow-x: auto; /* 水平スクロール */
  width: 220px; /* ブックマークリストの幅を調整 */
  padding: 4px 0; /* 上下のパディングを追加 */
}

.bookmark-item {
  width: 60px;
  height: 40px;
  margin-left: 4px;
  margin-right: 4px;
  border: 1px solid #ccc;
  cursor: pointer;
  overflow: hidden; /* サムネイルがはみ出ないように */
}

.bookmark-thumbnail {
  width: 100%;
  height: 100%;
  display: block; /* インライン要素の余白問題を解消 */
  object-fit: cover; /* サムネイルをコンテナに合わせてトリミング */
}
</style>