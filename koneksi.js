const mongoose = require('mongoose');

// URL MongoDB
const mongoUrl = 'mongodb://127.0.0.1:27017/wa_api'; // Ganti dbname dengan nama database Anda

// Koneksi ke MongoDB
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    // Jalankan fungsi untuk menyimpan data
    const tokenData = {
      token: 'contoh_token_di_sini', // Ganti dengan token WhatsApp Anda
      expirationDate: new Date('2023-12-31') // Ganti dengan tanggal kadaluwarsa token Anda
    };
    saveTokenToMongoDB(tokenData);
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Definisikan skema (schema) untuk koleksi data token
const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  expirationDate: {
    type: Date,
    required: true
  }
});

// Buat model berdasarkan skema
const TokenData = mongoose.model('wa_api_token', tokenSchema);

// Fungsi untuk menyimpan data token ke MongoDB
function saveTokenToMongoDB(tokenData) {
  const newToken = new TokenData(tokenData);

  newToken.save()
    .then((savedToken) => {
      console.log('Token data saved to MongoDB:', savedToken);
      // Tutup koneksi setelah berhasil menyimpan data (opsional)
      mongoose.connection.close();
    })
    .catch((err) => {
      console.error('Error saving token data to MongoDB:', err);
      // Tutup koneksi setelah terjadi kesalahan (opsional)
      mongoose.connection.close();
    });
}
