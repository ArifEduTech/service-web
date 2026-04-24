// =====================================
// APP.JS (FULL ONLINE + WHATSAPP NOTIFICATION)
// SISTEM SERVICE LAPTOP PRO
// =====================================

// NOTE:
// Pastikan firebase.js sudah dipanggil sebelum file ini
// <script src="js/firebase.js"></script>
// <script src="js/app.js"></script>

let items = [];
let data = {};

// =============================
// TAMBAH ITEM
// =============================
function addItem() {
  items.push({ qty: 1, desc: '', harga: 0 });
  renderItems();
}

function renderItems() {
  const container = document.getElementById('items');
  let html = '';

  items.forEach((item, i) => {
    html += `
      <div class="item-row">
        <input type="number" value="${item.qty}" onchange="items[${i}].qty=this.value" />
        <input type="text" placeholder="Deskripsi" value="${item.desc}" onchange="items[${i}].desc=this.value" />
        <input type="number" placeholder="Harga" value="${item.harga}" onchange="items[${i}].harga=this.value" />
      </div>
    `;
  });

  container.innerHTML = html;
}

// =============================
// WHATSAPP NOTIFICATION
// =============================
function sendWhatsApp(phone, message) {
  if (!phone) return;

  let clean = phone.replace(/[^0-9]/g, '');

  // convert 08 -> 62
  if (clean.startsWith('0')) {
    clean = '62' + clean.substring(1);
  }

  const url = `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

// =============================
// SIMPAN KE FIREBASE
// =============================
function saveData() {
  const nama = document.getElementById('nama').value;
  const hp = document.getElementById('hp').value;
  const kerusakan = document.getElementById('kerusakan').value;
  const tglMasuk = document.getElementById('tglMasuk').value;
  const diskon = document.getElementById('diskon').value || 0;
  const dp = document.getElementById('dp').value || 0;

  if (!nama || !hp || !kerusakan) {
    alert('Data belum lengkap');
    return;
  }

  const id = Date.now();

  const newData = {
    id,
    nama,
    hp,
    kerusakan,
    tglMasuk,
    items,
    status: 'Masuk',
    tglKeluar: '',
    diskon: parseInt(diskon),
    dp: parseInt(dp)
  };

  db.ref("service/" + id).set(newData);

  items = [];
  renderItems();

  alert('Data berhasil disimpan ke cloud');
}

// =============================
// UPDATE STATUS + WHATSAPP
// =============================
function updateStatus(id) {
  db.ref("service/" + id).once("value", (snap) => {
    let d = snap.val();

    if (!d) return;

    let oldStatus = d.status;

    if (d.status === 'Masuk') d.status = 'Proses';
    else if (d.status === 'Proses') {
      d.status = 'Selesai';
      d.tglKeluar = new Date().toLocaleDateString();

      // =============================
      // WHATSAPP NOTIFIKASI (SELESAI)
      // =============================
      const msg = `Halo ${d.nama},\n\nLaptop Anda sudah selesai diperbaiki.\nStatus: Selesai\nTerima kasih sudah menggunakan jasa kami.`;

      sendWhatsApp(d.hp, msg);
    }

    db.ref("service/" + id).update({
      status: d.status,
      tglKeluar: d.tglKeluar
    });

    // notif saat masuk ke proses
    if (oldStatus === 'Masuk' && d.status === 'Proses') {
      sendWhatsApp(d.hp, `Halo ${d.nama}, laptop Anda sedang diproses.`);
    }
  });
}

// =============================
// LINK CUSTOMER
// =============================
function openCustomer(id) {
  const url = window.location.origin + '/customer.html?id=' + id;
  prompt("Link Customer:", url);
}

// =============================
// REALTIME FIREBASE
// =============================
db.ref("service").on("value", (snapshot) => {
  data = snapshot.val() || {};
  renderList();
});

// =============================
// RENDER LIST
// =============================
function renderList() {
  const container = document.getElementById('list');
  let html = '';

  Object.values(data).forEach(d => {
    let total = (d.items || []).reduce((s, i) => s + (i.qty * i.harga), 0);

    html += `
      <div class="list-item">
        <b>${d.nama}</b> (${d.hp})<br>
        ${d.kerusakan}<br>
        <span class="badge ${d.status === 'Masuk' ? 'masuk' : d.status === 'Proses' ? 'proses' : 'selesai'}">
          ${d.status}
        </span><br>
        Masuk: ${d.tglMasuk} | Keluar: ${d.tglKeluar || '-'}<br>
        Total: Rp ${total}<br>

        <button onclick="updateStatus(${d.id})">Update Status</button>
        <button onclick="openCustomer(${d.id})">Link Customer</button>
      </div>
    `;
  });

  container.innerHTML = html;
}

// =============================
// INIT
// =============================
renderItems();
