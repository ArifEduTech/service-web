// =========================
// JS SISTEM SERVICE LAPTOP PRO
// =========================

let items = [];
let data = JSON.parse(localStorage.getItem('service_laptop')) || [];

// =========================
// TAMBAH ITEM SERVICE
// =========================
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

// =========================
// SIMPAN DATA SERVICE
// =========================
function saveData() {
  const nama = document.getElementById('nama').value;
  const hp = document.getElementById('hp').value;
  const kerusakan = document.getElementById('kerusakan').value;
  const tglMasuk = document.getElementById('tglMasuk').value;
  const diskon = document.getElementById('diskon').value || 0;
  const dp = document.getElementById('dp').value || 0;

  if (!nama || !hp || !kerusakan) {
    alert('Data belum lengkap!');
    return;
  }

  const newData = {
    id: Date.now(),
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

  data.unshift(newData);
  localStorage.setItem('service_laptop', JSON.stringify(data));

  // reset form
  items = [];
  renderItems();
  renderList();

  alert('Data berhasil disimpan');
}

// =========================
// UPDATE STATUS
// =========================
function updateStatus(id) {
  data = data.map(d => {
    if (d.id === id) {
      if (d.status === 'Masuk') d.status = 'Proses';
      else if (d.status === 'Proses') {
        d.status = 'Selesai';
        d.tglKeluar = new Date().toLocaleDateString();
      }
    }
    return d;
  });

  localStorage.setItem('service_laptop', JSON.stringify(data));
  renderList();
}

// =========================
// LINK CUSTOMER
// =========================
function openCustomer(id) {
  const url = window.location.origin + '/customer.html?id=' + id;
  prompt('Link Customer:', url);
}

// =========================
// RENDER LIST DATA
// =========================
function renderList() {
  const container = document.getElementById('list');
  let html = '';

  data.forEach(d => {
    let total = d.items.reduce((s, i) => s + (i.qty * i.harga), 0);

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

// =========================
// INIT
// =========================
renderItems();
renderList();
