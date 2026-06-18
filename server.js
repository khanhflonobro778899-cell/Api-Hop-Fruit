const express = require('express');
const app = express();
const PORT = process.env.PORT || 3008; 

app.use(express.json());

let totalExecute = 0;
let fruitServers = new Map(); 

// NHẬN DIỆN CẢ 3 SEA ĐỂ TRACK FRUIT
const validSeas = {
    "2753915549": "Sea 1",
    "4442274612": "Sea 2",
    "7449423635": "Sea 3"
};

function getSeaName(placeId) {
    return validSeas[String(placeId)] || `Unknown (Place: ${placeId})`;
}

app.post('/update-fruit', (req, res) => {
    const { jobid, players, placeId, fruitName } = req.body; // Bạn có thể truyền thêm Tên Trái Ác Quỷ từ Roblox lên
    if (!jobid) return res.status(400).send("Thiếu JobId");

    // 🔒 LỌC: CHỈ NHẬN NẾU THUỘC 1 TRONG 3 SEA
    if (!validSeas[String(placeId)]) {
        return res.status(403).send("Chỉ nhận dữ liệu từ Sea 1, 2 hoặc 3");
    }

    totalExecute++; 
    fruitServers.set(jobid, {
        "placeId": Number(placeId) || 0,
        "jobId": jobid,
        "players": Number(players) || 1,
        "sea": getSeaName(placeId),
        "fruitName": fruitName || "Unknown Fruit", // Lưu cả tên Fruit nếu có
        "updatedAt": Date.now()
    });

    console.log(`✅ [Web] Đã lưu Server có Fruit! JobId: ${jobid} | ${getSeaName(placeId)}`);
    res.status(200).send("Cập nhật thành công Server!");
});

app.get('/api', (req, res) => res.json(Array.from(fruitServers.values())));

setInterval(() => {
    const now = Date.now();
    for (let [jobid, data] of fruitServers.entries()) {
        if (now - data.updatedAt > 15 * 60 * 1000) fruitServers.delete(jobid);
    }
}, 60000); 

app.get('/', (req, res) => {
    const dataArray = Array.from(fruitServers.values());
    const finalData = {
        "Total Execute": totalExecute, "by": "tranduykhanh", "sea_filter": "All Seas (1, 2, 3)",
        "total_fruit_servers": dataArray.length, "fruit_data": dataArray
    };
    res.send(`<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>Fruit Tracker</title><style>body { background-color: #121212; color: #e0e0e0; font-family: monospace; padding: 15px; margin: 0; } .controls { margin-bottom: 10px; font-size: 14px; user-select: none; } pre { background-color: #181818; padding: 10px; border-radius: 4px; white-space: pre-wrap; word-wrap: break-word; font-size: 13px; margin: 0; }</style></head><body><div class="controls"><label><input type="checkbox" id="prettyPrint" checked onchange="renderJSON()"> Tạo bản in đẹp</label></div><pre id="jsonContent"></pre><script>const rawData = ${JSON.stringify(finalData)}; function renderJSON() { const isPretty = document.getElementById('prettyPrint').checked; const container = document.getElementById('jsonContent'); if (isPretty) { container.textContent = JSON.stringify(rawData, null, 2); } else { container.textContent = JSON.stringify(rawData); } } renderJSON(); setTimeout(() => { location.reload(); }, 8000);</script></body></html>`);
});

app.listen(PORT, () => console.log(`🚀 Web Fruit đang chạy tại port ${PORT} (Hỗ trợ Sea 1, 2, 3)`));
