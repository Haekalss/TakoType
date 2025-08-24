# TakoType

TakoType adalah aplikasi web kecil untuk latihan mengetik (typing test) berbasis HTML, CSS, dan JavaScript murni. Aplikasi ini dirancang untuk memberikan pengalaman mengetik yang responsif dan rapi di browser tanpa membutuhkan backend.

## Ringkasan
TakoType menampilkan deretan kata acak atau teks kustom yang harus diketik pengguna. Aplikasi ini menyediakan mode timer dan non-timer, statistik real-time (WPM, akurasi, kesalahan), grafik hasil per detik, dan beberapa opsi konfigurasi yang disimpan di localStorage.

## Fitur utama
- Mode timer (uji selama X detik) dan mode non-timer (ketik sebanyak yang diinginkan).
- Statistik real-time: WPM, akurasi, total kesalahan, jumlah kata selesai.
- Grafik hasil (WPM dan kesalahan per detik) yang ditampilkan setelah selesai.
- Auto-focus ke input tersembunyi sehingga kursor siap mengetik tanpa mengubah tata letak.
- Opsi kustom (durasi, jumlah kata, tingkat kesulitan, teks kustom) yang tersimpan di localStorage.
- Animasi transisi halus dan tata letak yang terjaga saat panel kontrol disembunyikan.

## Struktur berkas penting
- `takotype.html` — file HTML utama, berisi struktur UI dan referensi ke style/script.
- `style.css` — seluruh aturan gaya dan transisi UI.
- `script.js` — logika aplikasi: penyusunan kata, penanganan input, statistik, dan renderer grafik.
- `tako.png` — icon / brand image yang digunakan di header dan favicon.
- (Aset lain seperti ikon dan gambar pendukung berada di folder proyek.)


## Lisensi dan kredit
Proyek ini adalah contoh kecil dan dapat digunakan/diadaptasi untuk tujuan pribadi atau pembelajaran. Jika ingin menggunakan ulang atau mendistribusikan ulang, sertakan atribusi atau kontak penulis sesuai kebutuhan.

