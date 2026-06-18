const express = require('express');
const app = express();
const PORT = process.env.PORT || 3008; 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let totalExecute = 0;
let fruitServers = new Map(); 

function handleFruitUpdate(req, res) {
    const { jobid, players, placeId, fruit, fruitName } = req.body; 
    const finalFruitName = fruit || fruitName || "Unknown Fruit";

    if (!jobid) {
        console.log("❌ [Web] Nhận request lỗi: Thiếu JobId");
        return res.status(400).send("Thiếu JobId");
    }

    // ĐÃ XÓA HOÀN TOÀN ĐOẠN LỌC SEA (validSeas) Ở ĐÂY
    // Giờ cứ có request gửi lên là 100% Web sẽ nhận và ghi vào data.

    totalExecute++; 
    fruitServers.set(jobid, {
        "placeId": Number(placeId) || 0,
        "jobId": jobid,
        "players": Number(players) || 1,
        "fruitName": finalFruitName, 
        "updatedAt": Date.now()
    });

    console.log(`✅ [Web] Đã lưu Server! JobId: ${jobid} | PlaceId: ${placeId} | Trái: ${finalFruitName}`);
    return res.status(200).send("Cập nhật thành công Server!");
}

// Chấp nhận mọi luồng gửi lên
app.post('/', handleFruitUpdate);
app.post('/update-fruit', handleFruitUpdate);

app.get('/api', (req, res) => res.json(Array.from(fruitServers.values())));

// Quét dọn rác mỗi 30s
setInterval(() => {
    const now = Date.now();
    for (let [jobid, data] of fruitServers.entries()) {
        if (now - data.updatedAt > 15 * 60 * 1000) {
            fruitServers.delete(jobid);
        }
    }
}, 30000); 

app.get('/', (req, res) => {
    const dataArray = Array.from(fruitServers.values());
    const finalData = {
        "Total Execute": totalExecute, 
        "by": "tranduykhanh", 
        "sea_filter": "Đã tắt lọc Sea (Nhận mọi map)",
        "total_fruit_servers": dataArray.length, 
        "fruit_data": dataArray
    };
    res.send(`<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>Fruit Tracker</title><style>body { background-color: #121212; color: #e0e0e0; font-family: monospace; padding: 15px; margin: 0; } .controls { margin-bottom: 10px; font-size: 14px; user-select: none; } pre { background-color: #181818; padding: 10px; border-radius: 4px; white-space: pre-wrap; word-wrap: break-word; font-size: 13px; margin: 0; }</style></head><body><div class="controls"><label><input type="checkbox" id="prettyPrint" checked onchange="renderJSON()"> Tạo bản in đẹp</label></div><pre id="jsonContent"></pre><script>const rawData = ${JSON.stringify(finalData)}; function renderJSON() { const isPretty = document.getElementById('prettyPrint').checked; const container = document.getElementById('jsonContent'); if (isPretty) { container.textContent = JSON.stringify(rawData, null, 2); } else { container.textContent = JSON.stringify(rawData); } } renderJSON(); setTimeout(() => { location.reload(); }, 8000);</script></body></html>`);
});

app.listen(PORT, () => console.log(`🚀 Web Fruit đang chạy tại port ${PORT} (Đã tắt lọc Sea, nhận 100% data)`));
