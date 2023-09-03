// Inisialisasi variabel vcfData sebagai array kosong
let vcfData = [];

// Fungsi untuk menambahkan vCard ke dalam vcfData
function addVCardToData(vCard) {
  vcfData.push(vCard);
}

// Fungsi untuk mencari vCard dalam vcfData berdasarkan firstName dan lastName
function findVCard(firstName, lastName) {
  return vcfData.find((vCard) => vCard.firstName === firstName && vCard.lastName === lastName);
}

// Fungsi untuk menambahkan nomor telepon ke vCard yang sudah ada dalam vcfData
function addPhoneNumberToVCard(firstName, lastName, phoneNumber) {
  const vCard = findVCard(firstName, lastName);
  if (vCard) {
    vCard.phoneNumber.add(phoneNumber); // Menggunakan Set untuk memastikan nomor unik
  }
}

// Contoh penggunaan:
const vCard = {
  firstName: 'Umi',
  lastName: 'Fikri',
  phoneNumber: new Set(), // Menggunakan Set untuk menyimpan nomor telepon unik
  nama_akun: 'Moza Achmad Dani',
  __v: 0,
};

addVCardToData(vCard);

// Proses parsing data vCard dan menambahkan nomor telepon
const data = `BEGIN:VCARD
VERSION:2.1
N:Fikri;Umi;;;
FN:Umi Fikri
TEL;CELL:081282138664
TEL;CELL:081964654563
TEL;CELL:081964654562
END:VCARD`;

const lines = data.split('\n');

for (const line of lines) {
  if (line.startsWith('TEL')) {
    const phoneNumber = line.substring(9);
    addPhoneNumberToVCard(vCard.firstName, vCard.lastName, phoneNumber);
  }
}

// Cetak hasil dengan format yang diinginkan
for (const vCard of vcfData) {
  const phoneNumberArray = Array.from(vCard.phoneNumber); // Mengubah Set menjadi array
  console.log({
    _id: "ObjectId(" + new ObjectId().toString() + ")",
    firstName: vCard.firstName,
    lastName: vCard.lastName,
    phoneNumber: phoneNumberArray,
    nama_akun: vCard.nama_akun,
    __v: 0
  });
}
