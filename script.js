/* Firebase Config 多重初期化を防止した完全版 */
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, remove } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyAT5QpuyWSVcLekfn1xzyGxQ1LP_9yt6Go",
    authDomain: "trpgdiceroll-5a41d.firebaseapp.com",
    databaseURL: "https://trpgdiceroll-5a41d-default-rtdb.firebaseio.com",
    projectId: "trpgdiceroll-5a41d",
    storageBucket: "trpgdiceroll-5a41d.firebasestorage.app",
    messagingSenderId: "1096525112224",
    appId: "1:1096525112224:web:c4b5a9af058258705a3ac5"
};

// Firebase 初期化（多重初期化を防止）
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getDatabase(app);

// Firebase 匿名認証
const auth = getAuth(app);
signInAnonymously(auth)
    .then(() => console.log("✅ 匿名認証成功"))
    .catch((error) => console.error("❌ 匿名認証エラー:", error));


// 既存のユーザー名入力処理、ロール処理、履歴リセット処理をそのまま維持
let currentUser = localStorage.getItem("username");
if (!currentUser) {
  $("#nameModal").show();
  $("#nameSubmit").click(() => {
    let name = $("#usernameInput").val().trim();
    if (name) {
      localStorage.setItem("username", name);
      currentUser = name;
      $("#nameModal").fadeOut(() => window.location.reload());
    } else {
      alert("名前を入力してください");
    }
  });
} else {
  $("#nameModal").hide();
  $("#changeName").text(`${currentUser}（変更）`);
}

// URL パラメータ ?reset で履歴削除
if (window.location.search.includes("reset")) {
  remove(ref(db, "rollResults"))
    .then(() => {
      alert("履歴がリセットされました");
      window.location.href = window.location.origin + window.location.pathname;
    })
    .catch((error) => console.error("履歴の削除失敗:", error));
}

// ダイスロール処理
$("#rollButton").click(() => $("#modalOverlay").fadeIn());
$("#modalClose").click(() => $("#modalOverlay").fadeOut());
$("#rollDice").click(() => {
  let count = parseInt($("#diceCount").val());
  let sides = parseInt($("#diceType").val());
  let total = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1).reduce((a, b) => a + b, 0);
  push(ref(db, "rollResults"), {
    username: currentUser,
    rollType: `${count}D${sides}`,
    total,
  });
  $("#modalOverlay").fadeOut();
});

// ロール結果をリアルタイム表示
onChildAdded(ref(db, "rollResults"), snapshot => {
  let data = snapshot.val();
  let newResult = $(`
    <div class='result' style='opacity: 0;'>
      <div class='username'>${data.username}</div>
      <div class='rollType'>${data.rollType}</div>
      <div class='total'>${data.total}</div>
    </div>
  `);
  $("#rollResults").prepend(newResult);
  newResult.delay(500).animate({ opacity: 1 }, 500);
});

// 名前変更処理
$("#changeName").click(() => {
  localStorage.removeItem("username");
  window.location.reload();
});
