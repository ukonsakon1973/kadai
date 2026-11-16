// 1. 仕様書の全14地点データ
const checkpoints = [
    { id: 1, name: "日本橋（起点）", pref: "東京都中央区", distance: 0, desc: "すべての旅の始まり。お江戸の風景。", img: "images/01_nihonbashi.png" },
    { id: 2, name: "川崎宿", pref: "神奈川県川崎市", distance: 14.1, desc: "多摩川を渡り、最初の宿場町へ。", img: "images/02_kawasaki.png" },
    { id: 3, name: "戸塚宿", pref: "神奈川県横浜市", distance: 33.4, desc: "権太坂などのアップダウンを越える難所。", img: "images/03_totsuka.png" },
    { id: 4, name: "小田原宿", pref: "神奈川県小田原市", distance: 75.1, desc: "城下町。ここから本格的な箱根の山へ。", img: "images/04_odawara.png" },
    { id: 5, name: "三島宿", pref: "静岡県三島市", distance: 106.9, desc: "難所・箱根峠（石畳）を越えて伊豆国へ。", img: "images/05_mishima.png" },
    { id: 6, name: "静岡（府中宿）", pref: "静岡県静岡市", distance: 168.1, desc: "駿府城下。長丁場の中間地点。", img: "images/06_shizuoka.png" },
    { id: 7, name: "浜松宿", pref: "静岡県浜松市", distance: 236.7, desc: "遠州の長い平野と松林が続く区間。", img: "images/07_hamamatsu.png" },
    { id: 8, name: "宮宿（熱田）", pref: "愛知県名古屋市", distance: 298.6, desc: "東海道の要所。ここから桑名まで「七里の渡し（海路）」へ。", img: "images/08_miya.png" },
    { id: 9, name: "桑名宿", pref: "三重県桑名市", distance: 323.1, desc: "海路（海上7里）を含む区間。アプリでは架け橋として演出。", img: "images/09_kuwana.png" },
    { id: 10, name: "亀山宿", pref: "三重県亀山市", distance: 347.3, desc: "鈴鹿の山々を望む城下町。", img: "images/10_kameyama.png" },
    { id: 11, name: "土山宿", pref: "滋賀県甲賀市", distance: 375.8, desc: "鈴鹿峠を越え、近江国に入る山間部。", img: "images/11_tsuchiyama.png" },
    { id: 12, name: "草津宿", pref: "滋賀県草津市", distance: 402.4, desc: "中山道との合流地点。宿場として大いに賑わった場所。", img: "images/12_kusatsu.png" },
    { id: 13, name: "大津宿", pref: "滋賀県大津市", distance: 414.4, desc: "琵琶湖のほとり。京都まであと一息。", img: "images/13_otsu.png" },
    { id: 14, name: "三条大橋（終点）", pref: "京都府京都市", distance: 425.6, desc: "ゴール！鴨川にかかる東海道の終着点。", img: "images/14_sanjo.png" }
];

// LocalStorageの保存キー
const STORAGE_KEY = "tokaido_jogging_logs";

// ページ読み込み時の初期処理
document.addEventListener("DOMContentLoaded", () => {
    // 今日の日付をフォームにセット
    document.getElementById("runDate").valueAsDate = new Date();
    
    // 画面を最新の状態に更新
    updateScreen();
});

// LocalStorageから履歴データを取得する関数
function getLogs() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// LocalStorageに履歴データを保存する関数
function saveLogs(logs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

// 新しいジョギング記録を追加する関数
function addRecord() {
    const dateInput = document.getElementById("runDate").value;
    const distInput = parseFloat(document.getElementById("runDistance").value);

    if (!dateInput) {
        alert("日付を入力してください！");
        return;
    }
    if (isNaN(distInput) || distInput <= 0) {
        alert("0より大きい走行距離を入力してください！");
        return;
    }

    const logs = getLogs();
    // 新しい記録を追加（idには現在時刻のタイムスタンプを使用）
    logs.push({
        id: Date.now(),
        date: dateInput,
        distance: distInput
    });

    // 日付の新しい順に並び替え（同じ日付ならidが新しいものを優先）
    logs.sort((a, b) => {
        const dateDiff = new Date(b.date) - new Date(a.date);
        if (dateDiff !== 0) return dateDiff;
        return b.id - a.id;
    });

    saveLogs(logs);
    document.getElementById("runDistance").value = ""; // 入力欄をクリア
    updateScreen(); // 画面を再描画
}

// 記録を削除する関数
function deleteRecord(id) {
    if (!confirm("この記録を削除しますか？")) return;
    let logs = getLogs();
    logs = logs.filter(log => log.id !== id);
    saveLogs(logs);
    updateScreen();
}

// すべての記録を削除して初期状態に戻す関数（外側の正しい位置に配置）
function resetAllData() {
    if (!confirm("これまでの走行記録をすべて消去して、最初からやり直しますか？")) return;
    localStorage.removeItem(STORAGE_KEY);
    updateScreen();
}

// 画面全体を最新データで描き直す関数
function updateScreen() {
    const logs = getLogs();

    // 1. 総走行距離の計算（小数点第1位まで）
    const totalKm = logs.reduce((sum, log) => sum + log.distance, 0);
    const roundedTotal = Math.round(totalKm * 10) / 10;
    document.getElementById("totalKm").textContent = roundedTotal.toFixed(1);

    // 2. 現在の到達地点と次の宿場を判定
    let currentIndex = 0;
    for (let i = 0; i < checkpoints.length; i++) {
        if (roundedTotal >= checkpoints[i].distance) {
            currentIndex = i;
        } else {
            break;
        }
    }

    const currentCp = checkpoints[currentIndex];
    const nextCp = checkpoints[currentIndex + 1];

    // 現在地カードの更新
    document.getElementById("currentName").textContent = `${currentCp.id}. ${currentCp.name}`;
    document.getElementById("currentPref").textContent = currentCp.pref;
    document.getElementById("currentDesc").textContent = currentCp.desc;
    document.getElementById("placeholderName").textContent = currentCp.name;

    // 浮世絵画像のセット
    const imgEl = document.getElementById("ukiyoeImg");
    const placeholderEl = document.getElementById("ukiyoePlaceholder");
    if (imgEl && placeholderEl) {
        imgEl.style.display = "block";
        placeholderEl.style.display = "none";
        imgEl.src = currentCp.img;
    }

    // 次の宿場と進捗バーの更新
    const nextTargetBox = document.getElementById("nextTargetBox");
    if (nextTargetBox) {
        if (nextCp) {
            const remain = Math.max(0, Math.round((nextCp.distance - roundedTotal) * 10) / 10);
            const sectionTotal = nextCp.distance - currentCp.distance;
            const sectionDone = roundedTotal - currentCp.distance;
            const percent = Math.min(100, Math.max(0, (sectionDone / sectionTotal) * 100));

            nextTargetBox.innerHTML = `
                次の <span>${nextCp.name}</span> まで <span>あと ${remain.toFixed(1)} km</span>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${percent}%;"></div>
                </div>
            `;
        } else {
            // 三条大橋（ゴール）到達時
            nextTargetBox.innerHTML = `
                🎉 <span>祝・東海道五十三次 制覇達成！</span> 🎉
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: 100%;"></div>
                </div>
            `;
        }
    }

    // 3. 宿場町ロードマップ一覧の生成
    const cpListEl = document.getElementById("checkpointList");
    if (cpListEl) {
        cpListEl.innerHTML = "";

        checkpoints.forEach((cp, index) => {
            const li = document.createElement("li");
            let statusClass = "locked";
            let icon = "🔒";
            let badge = "";

            if (index < currentIndex) {
                statusClass = "completed";
                icon = "✅";
            } else if (index === currentIndex) {
                statusClass = "current";
                icon = "🚩";
                badge = " ◀ イマココ";
            } else if (index === checkpoints.length - 1) {
                icon = "🏁";
            }

            li.className = `checkpoint-item ${statusClass}`;
            li.innerHTML = `
                <div class="cp-header">
                    <span>${icon} ${cp.id}. ${cp.name}${badge}</span>
                    <span>${cp.distance.toFixed(1)} km</span>
                </div>
                <div class="cp-desc">${cp.desc}</div>
            `;
            cpListEl.appendChild(li);
        });
    }

    // 4. 過去の走行履歴一覧の生成
    const historyListEl = document.getElementById("historyList");
    if (historyListEl) {
        historyListEl.innerHTML = "";

        if (logs.length === 0) {
            historyListEl.innerHTML = `<li style="color: #94a3b8; font-size: 0.85rem;">まだ記録がありません。上のフォームから最初の距離を入力してみましょう！</li>`;
        } else {
            logs.forEach(log => {
                const li = document.createElement("li");
                li.className = "history-item";
                li.innerHTML = `
                    <span>📅 ${log.date} ： <strong>${log.distance.toFixed(1)} km</strong></span>
                    <button class="btn-delete" onclick="deleteRecord(${log.id})">削除</button>
                `;
                historyListEl.appendChild(li);
            });
        }
    }
}