const express = require('express');
const ejs = require('ejs');
const { Client , NoAuth } = require('whatsapp-web.js');
const client = new Client();
const app = express();
const port = 3000;
const QRCode = require('qrcode-terminal'); // Import pustaka qrcode
const multer = require('multer');
const fs = require('fs');
const readline = require('readline');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const { userInfo } = require('os');
const methodOverride = require('method-override'); 
const qr = require('qrcode');
const { error } = require('console');


app.use(bodyParser.urlencoded({ extended: true }));

// Atur view engine dan direktori views
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Fungsi untuk menginisialisasi WhatsApp Web API
app.use(express.static('public'));

// midlewire session 
app.use(session({
  secret: 'rahasia-saya',
  resave: false,
  saveUninitialized: true,
}));

const uri = "mongodb+srv://MOZAACHMADDANI:02188881019@cluster0.q9565ii.mongodb.net/wa_api";

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect(uri, options)

//tempat untuk scemha -----------------------------------------------------

// untuk komentar
// Create a schema for storing VCF data
const S_komentar = new mongoose.Schema({
  nama_akun: String,
  komentar: String,
  tanggal:String
});

const kirim_komentar = mongoose.model('komentar', S_komentar);

// Create a schema for konfirmasi kehadiran
const konfirmasi = new mongoose.Schema({
  konfirmasi:String,
  nama:String
});

const konfirmasi_kehadiran = mongoose.model('konfirmasi_kehadiran', konfirmasi);

// Create a schema for storing VCF data
const vcfSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  phoneNumber: String,
  sebagai: String,
  nama_akun: String,
  status: String
});

const VCF = mongoose.model('VCF', vcfSchema);
// skema untuk akun 
const akun = new mongoose.Schema({
  Username:String,
  Password:String,
  Nama:String,

});

const akun_data = mongoose.model('akun', akun);
// bats skema --------------------------------------------------------




// untuk function ----------------------------------------------------

//untuk tanpa angka di string
function hilangkan_huruf_di_string(str) {
  // Gunakan regular expression untuk memfilter angka-angka saja
  const numbersOnly = str.replace(/[^0-9]/g, '');
  return numbersOnly;
}
// batas untuk function ----------------------------------------------------

const upload = multer({ dest: 'uploads/' });

// Middleware untuk parsing data dari body permintaan POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(methodOverride('_method'));




// Render the index.ejs file
app.get('/upload', async (req, res) => {
  if(req.session.status=="login"){
    const db_data = await akun_data.findOne({Nama:req.session.nama,Username:req.session.username,Password:req.session.password},"Nama Username Password").exec();
    
    if(db_data){
      res.render("upload",{
        nama : req.session.nama,
        username:req.session.username,
        password:req.session.password,
        status_login:req.session.status                    
        });
    }
    else{
      res.redirect("/login");
    }
  }
  else{
    res.redirect("/login")
  }
});

// Handle the VCF file upload
app.post('/upload', upload.single('vcfFile'), (req, res) => {
  const vcfFilePath = req.file.path;
  const vcfData = [];

  // Read the VCF file line by line
  const rl = readline.createInterface({
    input: fs.createReadStream(vcfFilePath)
  });

  rl.on('line', (line) => {
    if (line.startsWith('BEGIN:VCARD')) {
      vcfData.push({});
    } else if (line.startsWith('N:')) {
      const [lastName, firstName] = line.substring(2).split(';');
      vcfData[vcfData.length - 1].lastName = lastName;
      vcfData[vcfData.length - 1].firstName = firstName;
    }else if (line.startsWith('TEL')) {
      const phoneNumber = line.substring(9);
      const cleanedNumber = phoneNumber.replace(/\D/g, ''); // Menghapus semua karakter non-digit
    
      let nomer_substring;
    
      // Menghilangkan angka '2' jika nomor dimulai dengan '0' atau '+62'
      if (cleanedNumber.startsWith('0') || cleanedNumber.startsWith('62')) {
        nomer_substring = cleanedNumber.replace(/^0+|^62+/, ''); // Menghapus awalan '0' atau '62'
        nomer_substring = nomer_substring.replace(/^2+/, ''); // Menghapus angka '2' pertama (jika ada)
      } else {
        nomer_substring = cleanedNumber; // Menggunakan nomor asli jika tidak ada awalan yang sesuai
      }
    
      console.log(nomer_substring);
      vcfData[vcfData.length - 1].phoneNumber = nomer_substring;
    }
    
    
    else{
      vcfData[vcfData.length - 1].sebagai = "Tamu Undangan";
      vcfData[vcfData.length - 1].nama_akun = req.session.nama;
      vcfData[vcfData.length - 1].status = "belum_siap_kirim";
    }
  });


  rl.on('close', async () => {
    // Save the VCF data to MongoDB
    try {
      await VCF.insertMany(vcfData);
      res.redirect('/berhasil_upload');
    } catch (err) {
      res.status(500).send('An error occurred while saving VCF data to the database.');
    } finally {
      // Remove the uploaded file
      fs.unlinkSync(vcfFilePath);
    }
  });
});


  app.get('/berhasil_upload', async(req,res)=>{
    if(req.session.status=="login"){
      const db_data = await akun_data.findOne({Nama:req.session.nama,Username:req.session.username,Password:req.session.password},"Nama Username Password").exec();
  
      
      if(db_data){
        res.render("berhasil_upload",{
          nama : req.session.nama,
          username:req.session.username,
          password:req.session.password,
          status_login:req.session.status                
          });
      }
      else{
        res.redirect("/login");
      }
    }
    else{
      res.redirect("/login")
    }
  });


// ...
// Inisialisasi koneksi WhatsApp
app.get('/qrcode', async (req, res) => {
  if (req.session.status == "login") {
    
    const db_data = await akun_data.findOne({ Nama: req.session.nama, Username: req.session.username, Password: req.session.password }, "Nama Username Password").exec();
    
    if (db_data) {
      const { EventEmitter } = require('events');
      EventEmitter.defaultMaxListeners = 1;

      const client = new Client({
        authStrategy: new NoAuth(),
        puppeteer :{
          args:[
            '--no-sandbox',
            '--disable-setuid-sandbox'
          ]
        }
      });
      let textToEncode;
  /*
      const waitForQrCode = new Promise(resolve => {
        client.on('qr', qr => {
          textToEncode = qr;
          resolve(textToEncode);
        });
      });
    
      waitForQrCode.then(enteredQrCode => {
        QRCode.generate(enteredQrCode, { small: true, width: 8000 }, (qrcode) => {
          res.render("qrcode", {
            qr: qrcode,
            text_qr: enteredQrCode
          });
        });
      });*/

      client.on('qr', qr => {
        QRCode.generate(qr, { small: true, width: 8000 }, (qrcode) => {
          res.render("qrcode", {
            qr: qrcode,
            text_qr: qr
          });
        });
      });

-
      client.initialize();

      // Di luar event listener ready, kode untuk mengirim pesan
      // Pastikan ini hanya dieksekusi sekali setelah client siap
      client.once('ready', async () => {
        console.log('Sending messages...');
        const db_data_kontak = await VCF.find({ nama_akun: req.session.nama ,status:"sudah_siap_kirim" }, "nama_akun firstName lastName phoneNumber sebagai").exec();
        var nomer_telephone = [];
        var nama_kontak = [];
        var id_kontak = [];

        
        for (const tamu of db_data_kontak) {
            nomer_telephone.push(tamu.phoneNumber); // Menambahkan nomor telepon ke array
            nama_kontak.push(tamu.firstName); // Menambahkan nomor telepon ke array
            id_kontak.push(tamu._id); // Menambahkan nomor telepon ke array

        }
        


        for (var nomor = 0; nomor < nomer_telephone.length; nomor++) {
var chatId = nomer_telephone[nomor] + "@c.us";
var link = `ini adalah link Undangan Untuk Bapak/Ibu *${nama_kontak[nomor]}*
https://undanganelektronik.xyz/fiorentina&fachri?v=${nama_kontak[nomor]}`;
var textId = `💌 Undangan Walimatul 'Ursy
Ykh. 
*${nama_kontak[nomor]}*
____________________

Bismillahirrahmanirrahim

Assalamu'alaikum warahmatullahi wabarakatuh

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i *${nama_kontak[nomor]}* untuk menghadiri acara Walimatul 'Ursy Sesi 2 (jam 09.00-11.00) Pernikahan kami
 
Fio Rentina Azzahra S.H
bin Suwarno
                 &
Muhammad Fachri Baharsyah S.T 
bin Kasino

Link Undangan
Untuk info lengkap acara, silakan kunjungi link berikut:

https://undanganelektronik.xyz/fiorentina&fachri?v=${nama_kontak[nomor]}

Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i *${nama_kontak[nomor]}* berkenan untuk hadir dan memberikan doa restu.

Mohon maaf perihal undangan hanya dibagikan melalui pesan ini.

Atas perhatiannya kami ucapkan Jazaakumullaah khairaa..

Wassalamu'alaikum warahmatullahi wabarakaatuh
${req.session.nama}`;
          
          // Sending message.
          client.sendMessage("62"+chatId, link);
          client.sendMessage("62"+chatId, textId);

        }
      });
    } else {
      res.redirect("/login");
    }
  } else {
    res.redirect("/login")
  }
});


app.get('/login', async (req,res)=>{

  if(req.session.status=="login"){
    res.redirect("/home")
  }
  else{
    const {status_login}=req.query;
    if(status_login){
    res.render('login',{statusnya:status_login});
    }
    else{
      res.render("login",{statusnya:false});
    }
  }
});

app.post('/login/proses_login', async (req, res) => {
  const { username, password } = req.body;

    const db_data = await akun_data.findOne({Username:username,Password:password},'Username Password Nama').exec();
if (db_data) {
  console.log('Data ditemukan:');
  console.log(db_data.Username);
  console.log(db_data.Password);
  console.log(db_data.Nama);
  req.session.username = db_data.Username;
  req.session.password = db_data.Password;
  req.session.nama = db_data.Nama;
  req.session.status= "login";
  res.redirect('/home');
} else {
  console.log('Data tidak ditemukan');
  res.redirect('/login?status_login=salah');
}

});
app.get('/home', async (req,res)=>{

if(req.session.status=="login"){
  const db_data = await akun_data.findOne({Nama:req.session.nama,Username:req.session.username,Password:req.session.password},"Nama Username Password").exec();
  
  if(db_data){
    res.render("home",{
      nama : req.session.nama,
      username:req.session.username,
      password:req.session.password,
      status_login:req.session.status                    
      });
  }
  else{
    res.redirect("/login");
  }
}
else{
  res.redirect("/login")
}
});


app.get('/logout',(req,res)=>{

  req.session.destroy();
  res.redirect("/login");

});

app.get('/', (req, res) => {
  res.render("index");
});

app.get('/pilih_upload', async (req, res) => {
  if (req.session.status == "login") {
    const db_data = await akun_data.findOne(
      { Nama: req.session.nama, Username: req.session.username, Password: req.session.password },
      "Nama Username Password"
    ).exec();

    const cari_belum_siap = { status: "belum_siap_kirim", nama_akun:req.session.nama};
    const cari_sudah_siap = { status: "sudah_siap_kirim", nama_akun:req.session.nama };

      const jumlah_data_belum_siap_kirim = await VCF.countDocuments(cari_belum_siap);
      const jumlah_data_sudah_siap_kirim = await VCF.countDocuments(cari_sudah_siap);



    if (db_data) {
      res.render("pilih_upload", {
        nama: req.session.nama,
        username: req.session.username,
        password: req.session.password,
        status_login: req.session.status,
        jumlah_belum_siap:jumlah_data_belum_siap_kirim,
        jumlah_sudah_siap:jumlah_data_sudah_siap_kirim
      });
    } else {
      res.redirect("/login");
    }
  } else {
    res.redirect("/login");
  }
});


app.get('/pandding_kirim/:id/edit_pandding', async(req,res)=>{
  if(req.session.status=="login"){
    const db_data = await akun_data.findOne({Nama:req.session.nama,Username:req.session.username,Password:req.session.password},"Nama Username Password").exec();
    const db_data_kontak = await VCF.find({nama_akun:req.session.nama,status:"belum_siap_kirim"},"nama_akun firstName lastName phoneNumber sebagai").exec();
    const itemsPerPage = 10;
    const initialData = db_data_kontak.slice(0, itemsPerPage);
    
    if(db_data){
      res.render("pandding_kirim",{
        nama : req.session.nama,
        username:req.session.username,
        password:req.session.password,
        status_login:req.session.status,
        db_data_kontak:initialData                  
        });
    }
    else{
      res.redirect("/login");
    }
  }
  else{
    res.redirect("/login")
  }
});


app.get('/siap_kirim', async(req,res)=>{
  if(req.session.status=="login"){
    const db_data = await akun_data.findOne({Nama:req.session.nama,Username:req.session.username,Password:req.session.password},"Nama Username Password").exec();
    const db_data_kontak = await VCF.find({nama_akun:req.session.nama,status:"sudah_siap_kirim"},"nama_akun firstName lastName phoneNumber sebagai").exec();
    const itemsPerPage = 10;
    const initialData = db_data_kontak.slice(0, itemsPerPage);
    
    if(db_data){
      res.render("siap_kirim",{
        nama : req.session.nama,
        username:req.session.username,
        password:req.session.password,
        status_login:req.session.status,
        db_data_kontak:initialData                  
        });
    }
    else{
      res.redirect("/login");
    }
  }
  else{
    res.redirect("/login")
  }
});
app.get("/testing",(req,res)=>{

  res.render("testing");
})

app.get('/undangan', async (req, res) => {
  const { v } = req.query;
  const id = v;
  
  try{
  if (id) {
    const db_data_kontak = await VCF.findOne({_id:id }, " nama_akun firstName lastName phoneNumber sebagai").exec();
    const db_data_komentar = await kirim_komentar.find({}, "nama_akun komentar tanggal").sort({ tanggal: -1, _id: -1 }).exec();
    if (db_data_kontak) {
      const id_to_string = db_data_kontak._id.toString();
      const data_id = id_to_string.match(/[a-fA-F0-9]{24}/)[0];
      const qrData = db_data_kontak.firstName;
      if (id == data_id) {
        qr.toDataURL(qrData, (err, url) => {
          if (err) throw err;
      
          res.render("undangan", {
            db_data_kontak: db_data_kontak,
            qr_undangan:url,
            db_data_komentar: db_data_komentar
          });
        });
      } else {
        res.render("tidak_di_undang");
      }
    } else {
      res.render("tidak_di_undang");
    }
  } else {
    res.render("tidak_di_undang");
  }
}
  catch(error){
    res.render("tidak_di_undang");
  }
});

app.get('/fiorentina&fachri', async (req, res) => {
  const { v } = req.query;
  const nama = v;
  const hadir = { konfirmasi: "hadir" };
  const tidak_hadir = { konfirmasi: "tidak_hadir" };

    const jumlah_hadir = await konfirmasi_kehadiran.countDocuments(hadir);
    const jumlah_tidak_hadir = await konfirmasi_kehadiran.countDocuments(tidak_hadir);

    const db_data_komentar = await kirim_komentar.find({}, "nama_akun komentar tanggal").sort({ tanggal: -1, _id: -1 }).exec();
      const qrData = nama;
        qr.toDataURL(qrData, (err, url) => {
      
          res.render("undangan2", {
            nama: nama,
            qr_undangan:url,
            db_data_komentar: db_data_komentar,
            db_data_jumlah_hadir:jumlah_hadir,
            db_data_jumlah_tidak_hadir:jumlah_tidak_hadir
          });
        });

    
      });

app.put('/edit_kirim/:id_edit', async (req, res) => {
  try {
    const { id_edit } = req.params;
    const { nama_akun, firstName, lastName, phoneNumber, sebagai } = req.body;
    console.log(req.body);

    
    const updatedVCF = await VCF.findByIdAndUpdate(
      id_edit,
      { nama_akun, firstName, lastName, phoneNumber, sebagai },
      { new: true } 
    );

    res.json(updatedVCF);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});



app.put('/pandding_kirim/:id_send_pandding', async (req, res) => {
  try {
    const { id_send_pandding } = req.params;
    const { status } = req.body;
    console.log(req.body);

    // Lakukan proses update data di MongoDB menggunakan Mongoose
    const updatedVCF = await VCF.findByIdAndUpdate(id_send_pandding,{ status },{ new: true } );

    res.json(updatedVCF);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});


app.put('/hapus_kontak/:id_hapus_kontak', async (req, res) => {
  try {
    const { id_hapus_kontak } = req.params;
    const { Hapus } = req.body;
    console.log(req.body);

    if(Hapus == true){
      const HapusVCF = await VCF.deleteOne({_id:id_hapus_kontak});
      res.json(HapusVCF);
    }
    else{
      console.log("datanya false");
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

app.put('/undangan/komentar', async (req, res) => {
    const { komentar,nama,waktu } = req.body;
    console.log(req.body);

    //untuk waktu------------
    //batasnya ------------

    const data_komentar = new kirim_komentar({
      nama_akun: nama,
      komentar: komentar,
      tanggal: waktu
    });
    data_komentar.save();
    const respon = {new:true}

    res.json(respon);

});

app.put('/tambahkan_data_kontak', async (req, res) => {
  const { firstName,lastName,phoneNumber,sebagai,status,nama_akun } = req.body;
  console.log(req.body);


  const tambah_kontak = new VCF({
    firstName: firstName,
    lastName: lastName,
    phoneNumber:phoneNumber,
    sebagai:sebagai,
    status:status,
    nama_akun:nama_akun

  });
  tambah_kontak.save()
  .then(tambah_kontak=>{
    const respon = {
    new:true ,
    id:tambah_kontak._id,
    nama:firstName,
    nomor:phoneNumber,
    role:sebagai
    };
    res.json(respon);
  }).catch(error=>{
    console.log(error);
  })

});
// Route for loading more data
app.get('/belum_siap_kirim_load', async (req, res) => {
  const itemsPerPage = 10;
  // Get the current page from the query parameter (default to page 1)
  const page = parseInt(req.query.page) || 1;

  // Calculate the starting and ending indices for the current page
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const db_data_kontak = await VCF.find({nama_akun:req.session.nama,status:"belum_siap_kirim"},"nama_akun firstName lastName phoneNumber sebagai").exec();

  // Get the data to load for the current page
  const currentData = db_data_kontak.slice(startIndex, endIndex);
  res.json(currentData);
});


app.get('/belum_siap_kirim_search', async (req, res) => {
  const keyword = req.query.keyword;

  // Lakukan pencarian berdasarkan keyword di database
  const searchResults = await VCF.find({
    $or: [
      { firstName: { $regex: keyword, $options: 'i' } }, // Pencarian nama yang cocok
      { lastName: { $regex: keyword, $options: 'i' } },  // Pencarian nama belakang yang cocok
    ],
    nama_akun: req.session.nama,
    status: "belum_siap_kirim"
  }).exec();

  // Kirim hasil pencarian sebagai respons dalam format JSON
  res.json(searchResults);
});


// Route for loading more data
app.get('/sudah_siap_kirim_load', async (req, res) => {
  const itemsPerPage = 10;
  // Get the current page from the query parameter (default to page 1)
  const page = parseInt(req.query.page) || 1;

  // Calculate the starting and ending indices for the current page
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const db_data_kontak = await VCF.find({nama_akun:req.session.nama,status:"sudah_siap_kirim"},"nama_akun firstName lastName phoneNumber sebagai").exec();

  // Get the data to load for the current page
  const currentData = db_data_kontak.slice(startIndex, endIndex);
  res.json(currentData);
});


app.get('/sudah_siap_kirim_search', async (req, res) => {
  const keyword = req.query.keyword;

  // Lakukan pencarian berdasarkan keyword di database
  const searchResults = await VCF.find({
    $or: [
      { firstName: { $regex: keyword, $options: 'i' } }, // Pencarian nama yang cocok
      { lastName: { $regex: keyword, $options: 'i' } },  // Pencarian nama belakang yang cocok
    ],
    nama_akun: req.session.nama,
    status: "sudah_siap_kirim"
  }).exec();

  // Kirim hasil pencarian sebagai respons dalam format JSON
  res.json(searchResults);
});



app.put('/konfirmasi_kehadiran', async (req, res) => {
  const { konfirmasi,nama} = req.body;
  console.log(req.body);

  const data_konfirmasi = new konfirmasi_kehadiran({
    konfirmasi:konfirmasi,
    nama:nama
  });
  data_konfirmasi.save();
  const respon = {new:true}

  res.json(respon);
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});