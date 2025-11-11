export type WeightedStageId = 'concern' | 'control' | 'curiosity' | 'confidence';

export type WeightedOption = { text: string; score: number };
export type WeightedQuestion = { q: string; options: WeightedOption[] };

export type IntroSlide = { key: string; title: string; paragraphs: string[] };

export const weightedStageOrder: WeightedStageId[] = ['concern', 'control', 'curiosity', 'confidence'];

export const weightedAssessment: Record<WeightedStageId, WeightedQuestion[]> = {
  concern: [
    {
      q: 'Mengapa kepedulian terhadap karier penting bagi siswa SMK?',
      options: [
        { text: 'Karena dengan kepedulian, siswa dapat memiliki gambaran umum tentang pekerjaan di masa depan.', score: 10 },
        { text: 'Karena kepedulian membantu siswa memahami arah karier yang sesuai dengan minat mereka.', score: 20 },
        { text: 'Karena kepedulian mendorong siswa untuk merancang langkah-langkah dalam mencapai tujuan profesional.', score: 30 },
        { text: 'Karena kepedulian membuat siswa mampu mengubah mimpi menjadi rencana nyata dan terarah menuju dunia kerja.', score: 40 },
      ],
    },
    {
      q: 'Salah satu bentuk nyata dari kepedulian terhadap karier adalah?',
      options: [
        { text: 'Memikirkan jenis pekerjaan yang diinginkan tanpa membuat rencana konkret.', score: 10 },
        { text: 'Mengikuti kegiatan sekolah yang berkaitan dengan bidang karier tertentu.', score: 20 },
        { text: 'Menyusun rencana pengembangan keterampilan sesuai minat dan kemampuan pribadi.', score: 30 },
        { text: 'Mencari informasi, pengalaman, dan peluang belajar untuk mendukung tujuan karier yang jelas.', score: 40 },
      ],
    },
    {
      q: 'Bagaimana kepedulian terhadap karier dapat membantu siswa mengenali potensi dirinya?',
      options: [
        { text: 'Dengan cara memahami pelajaran yang disukai selama di sekolah.', score: 10 },
        { text: 'Dengan melakukan refleksi diri dan mengenali hal-hal yang menarik bagi dirinya.', score: 20 },
        { text: 'Dengan mengevaluasi kemampuan dan ketertarikan terhadap berbagai bidang kerja.', score: 30 },
        { text: 'Dengan mengeksplorasi minat, bakat, serta menerapkannya dalam perencanaan dan pengalaman kerja nyata.', score: 40 },
      ],
    },
    {
      q: 'Dalam menghadapi dunia kerja yang terus berubah, kepedulian terhadap karier membantu siswa untuk…?',
      options: [
        { text: 'Menyadari bahwa mereka perlu mempersiapkan diri sejak dini.', score: 10 },
        { text: 'Mengetahui bahwa dunia kerja menuntut kemampuan yang terus berkembang.', score: 20 },
        { text: 'Memahami pentingnya meningkatkan keterampilan sesuai perkembangan industri.', score: 30 },
        { text: 'Berkomitmen untuk terus belajar dan beradaptasi agar tetap relevan di dunia kerja.', score: 40 },
      ],
    },
    {
      q: 'Mengapa proses perencanaan karier menjadi bagian penting dari kepedulian karier bagi siswa SMK?',
      options: [
        { text: 'Karena membantu siswa memahami tujuan umum karier mereka di masa depan.', score: 10 },
        { text: 'Karena membantu siswa menentukan langkah awal menuju pekerjaan yang diinginkan.', score: 20 },
        { text: 'Karena mengarahkan siswa untuk menyiapkan kompetensi sesuai bidang pilihan mereka.', score: 30 },
        { text: 'Karena memastikan setiap langkah yang diambil siswa selaras dengan tujuan dan peluang karier jangka panjang.', score: 40 },
      ],
    },
    {
      q: 'Apa peran guru dan orang tua dalam menumbuhkan kepedulian karier siswa?',
      options: [
        { text: 'Memberikan motivasi agar siswa semangat belajar dan bekerja keras.', score: 10 },
        { text: 'Memberikan informasi umum tentang dunia kerja dan peluang masa depan.', score: 20 },
        { text: 'Membimbing siswa dalam memilih dan memahami arah karier sesuai potensi mereka.', score: 30 },
        { text: 'Mendampingi siswa secara aktif dalam merencanakan, mengevaluasi, dan mengembangkan karier secara berkelanjutan.', score: 40 },
      ],
    },
  ],
  control: [
    {
      q: 'Seorang siswa menunjukkan kendali diri pada karier bila ia...',
      options: [
        { text: 'Saya kadang mencari kegiatan tambahan untuk menambah pengalaman dan wawasan saya.', score: 10 },
        { text: 'Saya sering mencari kegiatan tambahan untuk menambah pengalaman dan wawasan saya.', score: 20 },
        { text: 'Saya sering mencari kegiatan tambahan dan mencatat pengalaman untuk pengembangan diri saya.', score: 30 },
        { text: 'Saya terencana mencari kegiatan tambahan, mencatat pengalaman, dan mengevaluasi hasilnya saya.', score: 40 },
      ],
    },
    {
      q: 'Dalam menghadapi kecemasan ujian, tindakan yang mencerminkan kendali diri adalah...',
      options: [
        { text: 'Saya kadang mencoba teknik pernapasan untuk mengurangi kecemasan sebelum ujian saja.', score: 10 },
        { text: 'Saya sering mencoba teknik pernapasan untuk mengurangi kecemasan sebelum ujian saja.', score: 20 },
        { text: 'Saya sering mencoba teknik pernapasan dan mencatat hasilnya sebelum ujian nanti.', score: 30 },
        { text: 'Saya teratur mencoba teknik pernapasan, mencatat, dan mengevaluasi hasilnya sebelum ujian.', score: 40 },
      ],
    },
    {
      q: 'Ketika memilih kegiatan tambahan, sikap yang menunjukkan kendali diri adalah...',
      options: [
        { text: 'Saya kadang memilih kegiatan tanpa mempertimbangkan waktu atau dampak jangka panjang.', score: 10 },
        { text: 'Saya sering memilih kegiatan dengan mempertimbangkan waktu dan dampak jangka panjang.', score: 20 },
        { text: 'Saya sering memilih kegiatan setelah mempertimbangkan waktu, manfaat, dan dukungan tersedia.', score: 30 },
        { text: 'Saya merencanakan memilih kegiatan setelah menilai waktu, manfaat, dan risiko terkait.', score: 40 },
      ],
    },
    {
      q: 'Saat menemui kesulitan, perilaku yang menggambarkan kendali diri adalah...',
      options: [
        { text: 'Saya kadang berhenti ketika kesulitan dan meminta istirahat singkat saja.', score: 10 },
        { text: 'Saya berusaha kembali setelah istirahat singkat untuk menyelesaikan tugas yang sulit.', score: 20 },
        { text: 'Saya mencari bantuan guru atau teman ketika menemui kesulitan dalam tugas.', score: 30 },
        { text: 'Saya merencanakan langkah perbaikan, meminta bantuan, dan melanjutkan tugas sampai selesai.', score: 40 },
      ],
    },
    {
      q: 'Untuk mengelola stres dan menjaga fokus belajar, tindakan yang paling mencerminkan kendali diri adalah...',
      options: [
        { text: 'Saya kadang merasa cemas menjelang ujian dan berusaha menenangkan diri sendiri.', score: 10 },
        { text: 'Saya mencoba teknik pernapasan atau rehat singkat saat merasa cemas ujian.', score: 20 },
        { text: 'Saya menggunakan teknik pernapasan, istirahat, dan membagi waktu belajar dengan baik.', score: 30 },
        { text: 'Saya membuat jadwal belajar, teknik relaksasi, dan evaluasi hasil sebelum ujian.', score: 40 },
      ],
    },
    {
      q: 'Dalam mengambil keputusan penting, sikap kendali diri terbaik adalah...',
      options: [
        { text: 'Saya kadang mengambil keputusan singkat tanpa mempertimbangkan konsekuensi jangka panjang saja.', score: 10 },
        { text: 'Saya mempertimbangkan beberapa akibat sebelum membuat keputusan penting bagi kehidupan saya.', score: 20 },
        { text: 'Saya menimbang pilihan, mencari informasi, dan berdiskusi dengan orang yang dipercaya.', score: 30 },
        { text: 'Saya merencanakan keputusan setelah menilai konsekuensi, sumber daya, dan waktu tersedia.', score: 40 },
      ],
    },
  ],
  curiosity: [
    {
      q: 'Seorang siswa menunjukkan keingintahuan bila ia...',
      options: [
        { text: 'Saya mencoba satu bidang baru, mencari info dasar, dan mencatat kesan awal.', score: 10 },
        { text: 'Saya mencoba beberapa bidang, mencari info lebih, dan membandingkan kesan tiap bidang.', score: 20 },
        { text: 'Saya mengeksplorasi beberapa bidang, mencari data relevan, dan merefleksikan hasil eksperimen.', score: 30 },
        { text: 'Saya mengeksplorasi berbagai bidang, mencari data mendalam, dan merencanakan langkah pengembangan.', score: 40 },
      ],
    },
    {
      q: 'Tindakan yang menunjukkan keberanian eksplorasi adalah...',
      options: [
        { text: 'Saya mencoba ide baru sekali, menerima hasilnya, dan mencatat pelajaran singkat.', score: 10 },
        { text: 'Saya mencoba beberapa ide, memperhatikan hasil, dan mencari pelajaran dari kegagalan.', score: 20 },
        { text: 'Saya mencoba ide baru, mengevaluasi hasil, dan memperbaiki strategi berdasarkan pengalaman.', score: 30 },
        { text: 'Saya mencoba ide berisiko, mengevaluasi kegagalan, dan menyusun rencana perbaikan berkelanjutan.', score: 40 },
      ],
    },
    {
      q: 'Untuk memilih jalur karier, sikap yang mencerminkan curiosity dan critical thinking adalah...',
      options: [
        { text: 'Saya membaca info dasar, menyaring fakta, dan mencatat pandangan umum.', score: 10 },
        { text: 'Saya membaca beberapa sumber, membandingkan fakta, dan menarik kesimpulan sementara.', score: 20 },
        { text: 'Saya menelaah berbagai sumber, menguji asumsi, dan menyusun kesimpulan yang terinformasi.', score: 30 },
        { text: 'Saya menelaah sumber luas, menguji asumsi kritis, dan membuat keputusan berdasarkan bukti.', score: 40 },
      ],
    },
    {
      q: 'Perilaku yang mendemonstrasikan curiosity lintas bidang adalah...',
      options: [
        { text: 'Saya mencoba satu keterampilan baru, melihat kaitannya, dan mencatat manfaat singkat.', score: 10 },
        { text: 'Saya mencoba beberapa keterampilan, melihat hubungan antar bidang, dan mencatat peluang aplikasi.', score: 20 },
        { text: 'Saya menggabungkan beberapa keterampilan, menguji hasilnya, dan merefleksikan potensi karier.', score: 30 },
        { text: 'Saya menggabungkan keterampilan lintas bidang, menguji implementasi, dan merencanakan pengembangan lanjut.', score: 40 },
      ],
    },
    {
      q: 'Cara menunjukkan rasa ingin tahu sosial dalam karier adalah...',
      options: [
        { text: 'Saya bertanya satu orang, mendengarkan, dan mencatat satu insight penting.', score: 10 },
        { text: 'Saya bertanya beberapa orang, mendengarkan, dan membandingkan insight dari berbagai perspektif.', score: 20 },
        { text: 'Saya bertanya ke banyak orang, mendengarkan aktif, dan merefleksikan pelajaran untuk karier.', score: 30 },
        { text: 'Saya membangun jaringan luas, berdiskusi mendalam, dan merencanakan kolaborasi berdasarkan insight.', score: 40 },
      ],
    },
    {
      q: 'Perilaku curiosity yang paling matang adalah...',
      options: [
        { text: 'Saya mencoba satu proyek kecil, mencatat hasil, dan belajar dari pengalaman itu.', score: 10 },
        { text: 'Saya mencoba beberapa proyek, membandingkan hasil, dan mengambil beberapa pelajaran untuk perbaikan.', score: 20 },
        { text: 'Saya mencoba proyek berbeda, mengevaluasi metrik, dan menyesuaikan pendekatan untuk ke depan.', score: 30 },
        { text: 'Saya merancang eksperimen karier, mengumpulkan data, dan menyusun strategi pengembangan berkelanjutan.', score: 40 },
      ],
    },
  ],
  confidence: [
    {
      q: 'Seorang siswa menunjukkan kepercayaan diri bila ia...',
      options: [
        { text: 'Saya merasa cukup percaya diri untuk mencoba tugas baru secara sederhana.', score: 10 },
        { text: 'Saya cukup percaya diri untuk mencoba tugas baru dan meminta bantuan bila perlu.', score: 20 },
        { text: 'Saya percaya diri mencoba tugas baru, mencari sumber belajar, dan mencatat hasil.', score: 30 },
        { text: 'Saya percaya diri mencoba tugas baru, menyiapkan rencana, dan mengevaluasi kemajuan.', score: 40 },
      ],
    },
    {
      q: 'Dalam menghadapi wawancara atau presentasi, tanda kepercayaan diri adalah...',
      options: [
        { text: 'Saya berusaha menjawab pertanyaan dengan jelas sesuai kemampuan saya saat ini.', score: 10 },
        { text: 'Saya menyiapkan jawaban dan latihan singkat sebelum menghadapi wawancara kerja.', score: 20 },
        { text: 'Saya menyiapkan jawaban, latihan, dan menunjukkan contoh kemampuan yang relevan.', score: 30 },
        { text: 'Saya menyiapkan jawaban, latihan, menunjukkan contoh, dan mengekspresikan kepercayaan diri.', score: 40 },
      ],
    },
    {
      q: 'Saat mengalami kegagalan, perilaku yang menunjukkan kepercayaan diri adalah...',
      options: [
        { text: 'Ketika gagal, saya menerima hasil dan mencoba melanjutkan secara perlahan.', score: 10 },
        { text: 'Ketika gagal, saya menerima hasil, mencari pelajaran, dan mencoba lagi.', score: 20 },
        { text: 'Ketika gagal, saya analisis kesalahan, belajar dari pengalaman, dan mencoba lagi.', score: 30 },
        { text: 'Ketika gagal, saya analisis, buat rencana perbaikan, belajar, dan mencoba lagi.', score: 40 },
      ],
    },
    {
      q: 'Sikap yang mencerminkan pengembangan kepercayaan diri melalui tujuan adalah...',
      options: [
        { text: 'Saya menetapkan tujuan kecil yang bisa dicapai dalam jangka pendek.', score: 10 },
        { text: 'Saya menetapkan tujuan kecil dan mengevaluasi pencapaian secara berkala.', score: 20 },
        { text: 'Saya menetapkan tujuan terukur, mengevaluasi, dan menyesuaikan strategi belajar.', score: 30 },
        { text: 'Saya menetapkan tujuan terukur, mengevaluasi berkala, dan merencanakan langkah lanjutan.', score: 40 },
      ],
    },
    {
      q: 'Peran dukungan orang lain terhadap kepercayaan diri ditunjukkan bila siswa...',
      options: [
        { text: 'Saya menerima dukungan dari teman atau keluarga yang memberi semangat.', score: 10 },
        { text: 'Saya menerima dukungan dan meminta masukan untuk memperbaiki kemampuan diri.', score: 20 },
        { text: 'Saya menerima dukungan, meminta masukan, dan menerapkan saran yang bermanfaat.', score: 30 },
        { text: 'Saya menerima dukungan, meminta masukan, menerapkan saran, dan mengevaluasi hasil.', score: 40 },
      ],
    },
    {
      q: 'Tanda kepercayaan diri dalam memimpin atau berbicara di depan kelompok adalah...',
      options: [
        { text: 'Saya kadang berani mengambil peran kecil atau berbicara di depan kelompok.', score: 10 },
        { text: 'Saya sering mencoba mengambil peran atau berbicara untuk melatih kemampuan.', score: 20 },
        { text: 'Saya aktif mengambil peran, memimpin tugas sederhana, dan belajar dari pengalaman.', score: 30 },
        { text: 'Saya aktif memimpin, mempersiapkan diri, dan mengevaluasi hasil kepemimpinan saya.', score: 40 },
      ],
    },
  ],
};

export const weightedIntroSlides: Record<WeightedStageId, IntroSlide[]> = {
  concern: [
    {
      key: 'concern-intro-1',
      title: 'Kepedulian',
      paragraphs: [
        'Kepedulian dalam hal adaptasi karier berkaitan dengan kesadaran seseorang tentang perubahan yang terjadi di tempat kerja dan dampaknya pada jalur karier mereka. Savickas (2013) menyatakan bahwa mereka yang memiliki kepedulian lebih besar cenderung lebih aktif dalam merencanakan masa depan karier mereka. Rencana karier yang baik tidak hanya membantu dalam mencapai tujuan profesional, tetapi juga memberikan rasa aman dan kepastian di tengah situasi kerja yang tidak menentu. Data dari Biro Statistik Tenaga Kerja AS menunjukkan bahwa orang yang memiliki rencana karier yang jelas lebih cenderung meraih tingkat kepuasan kerja yang tinggi (Bureau of Labor Statistics, 2021).',
        'Sebagai contoh, penelitian yang dilakukan oleh Rudolph et al. (2019) menunjukkan bahwa orang yang secara aktif merencanakan karier mereka dapat menyesuaikan diri dengan perubahan dalam industri yang cepat. Mereka yang terlibat dalam perencanaan karier tidak hanya mempersiapkan diri untuk menghadapi tantangan yang ada, tetapi juga menemukan peluang yang sebelumnya mungkin terlewatkan. Hal ini menunjukkan bahwa perhatian pada perkembangan karier dapat meningkatkan daya saing individu di pasar kerja.',
      ],
    },
    {
      key: 'concern-intro-2',
      title: 'Kepedulian',
      paragraphs: [
        'Penting juga untuk mencatat bahwa kepedulian terhadap karier tidak hanya berkaitan dengan pencarian pekerjaan, tetapi juga dengan pengembangan diri yang berkelanjutan. Dalam dunia yang terus berubah ini, keterampilan dan pengetahuan yang relevan menjadi semakin penting. Siswa yang memiliki kepedulian terhadap karier akan lebih cenderung untuk terus belajar dan beradaptasi dengan perubahan yang terjadi di industri.',
        'Sebagai contoh, seorang siswa yang awalnya berfokus pada keahlian tertentu dalam bidang akuntansi mungkin akan menyadari pentingnya memahami teknologi baru, seperti perangkat lunak akuntansi berbasis cloud, untuk tetap kompetitif di pasar kerja. Transisi dari sekolah ke dunia kerja sering kali menjadi tantangan besar bagi banyak siswa. Namun, dengan adanya kepedulian yang kuat terhadap karier, mereka dapat merencanakan langkah-langkah yang lebih terstruktur. Hal ini termasuk mencari informasi tentang peluang kerja, mengikuti seminar atau workshop, serta membangun jaringan yang dapat membantu mereka dalam mencari pekerjaan.',
        'Dalam kesimpulan, kepedulian terhadap karier merupakan aspek yang sangat penting bagi siswa SMK. Ini bukan hanya tentang mempersiapkan diri untuk memasuki dunia kerja, tetapi juga tentang membangun fondasi yang kuat untuk pengembangan diri di masa depan. Dengan memahami pentingnya merencanakan karier dan mengambil langkah-langkah yang tepat, siswa dapat mengubah impian mereka menjadi kenyataan. Melalui eksplorasi minat, pengembangan keterampilan, dan pencarian informasi yang aktif, mereka dapat menciptakan jalur karier yang sukses dan memuaskan. Oleh karena itu, penting bagi semua pihak, termasuk pendidik dan orang tua, untuk mendukung siswa dalam perjalanan mereka menuju masa depan yang cerah.',
      ],
    },
    {
      key: 'concern-instructions',
      title: 'Instruksi Penilaian Concern',
      paragraphs: [
        'Terdapat 6 pertanyaan pada bagian CONCERN. Setiap soal memiliki 4 jawaban yang masing-masing jawaban memiliki nilai tertentu dari 10% hingga 40%. Anda harus memilih jawaban yang paling mencerminkan dimensi kepedulian agar mendapatkan nilai sesuai target.',
        'Pilih jawaban terbaik pada setiap soal untuk mencapai skor minimal. Nilai akhir merupakan akumulasi dari seluruh jawaban.',
        '• Pilihan 10% = gambaran awal.\n• Pilihan 20% = arah dan pemahaman dasar.\n• Pilihan 30% = langkah yang mulai terstruktur.\n• Pilihan 40% = kepedulian optimal dan terarah menuju dunia kerja.',
      ],
    },
  ],
  control: [
    {
      key: 'control-intro-1',
      title: 'Kendali Diri',
      paragraphs: [
        'Kendali diri, atau self-regulation, adalah kemampuan penting yang dimiliki individu dalam mengelola tindakan dan membuat keputusan yang tepat. Dalam konteks pendidikan dan pengembangan karier, kendali diri tidak hanya berkaitan dengan kemampuan untuk menahan diri dari godaan, tetapi juga mencakup tanggung jawab yang lebih besar terhadap langkah-langkah yang diambil dalam hidup.',
        'Pentingnya kendali diri dalam kehidupan siswa sangatlah signifikan. Siswa yang memiliki kemampuan ini cenderung lebih proaktif dalam mengambil inisiatif. Mereka tidak hanya menunggu kesempatan datang, tetapi berusaha menciptakan peluang untuk diri mereka sendiri.',
        'Misalnya, seorang siswa yang memiliki kendali diri yang baik mungkin akan mencari proyek tambahan di luar kurikulum untuk memperdalam pemahaman mereka tentang suatu topik. Mereka memahami bahwa usaha ekstra ini akan memberikan mereka keunggulan di masa depan.',
      ],
    },
    {
      key: 'control-intro-2',
      title: 'Kendali Diri',
      paragraphs: [
        'Dalam situasi sulit, siswa dengan kendali diri tidak mudah menyerah. Mereka mampu menghadapi tantangan dan mencari solusi yang kreatif, bukan hanya berfokus pada masalah yang ada. Contoh nyata dapat dilihat pada siswa yang mengalami kesulitan dalam mata pelajaran tertentu; alih-alih menyerah, mereka akan mencari bantuan dari guru atau teman, atau bahkan menggunakan sumber daya online untuk memahami materi yang sulit.',
        'Mengelola emosi juga merupakan bagian integral dari kendali diri. Ketika siswa dapat mengatur emosinya, mereka lebih mampu untuk tetap tenang dan fokus dalam situasi yang menekan. Dengan mengendalikan emosi, siswa juga dapat berinteraksi dengan lebih baik dengan teman sebaya dan guru, menciptakan lingkungan belajar yang positif.',
        'Proses pengambilan keputusan sangat dipengaruhi oleh kendali diri. Siswa yang mampu mengevaluasi pilihan mereka dengan cermat dan mempertimbangkan konsekuensi dari setiap tindakan cenderung membuat keputusan yang lebih baik.',
      ],
    },
    {
      key: 'control-intro-3',
      title: 'Kendali Diri',
      paragraphs: [
        'Transisi dari satu keputusan ke keputusan lainnya juga memerlukan kendali diri. Siswa yang mampu memahami bahwa setiap keputusan memiliki dampak jangka panjang akan lebih berhati-hati dalam memilih langkah mereka.',
        'Dengan demikian, kendali diri sangat penting dalam membentuk karakter dan pola pikir siswa. Kemampuan untuk mengelola tindakan, bertanggung jawab atas keputusan, dan tetap termotivasi dalam menghadapi tantangan adalah keterampilan yang akan membawa mereka menuju kesuksesan.',
        'Kesimpulannya, kendali diri adalah fondasi yang kuat bagi pengambilan keputusan yang efektif dan pengelolaan tindakan. Dengan mengembangkan kemampuan ini, siswa dapat mengambil inisiatif, menghadapi tantangan dengan keberanian, dan membuat keputusan yang bijaksana untuk masa depan mereka.',
      ],
    },
    {
      key: 'control-instructions',
      title: 'Instruksi Penilaian Control',
      paragraphs: [
        'Terdapat 6 pertanyaan pada bagian CONTROL. Setiap soal memiliki 4 jawaban yang masing-masing jawaban memiliki nilai tertentu dari 10% hingga 40%. Anda harus menemukan jawaban yang benar-benar menggambarkan dimensi kontrol diri sehingga mendapatkan nilai yang sesuai target.',
        'Pilih jawaban terbaik pada setiap soal untuk mencapai skor minimal. Nilai akhir merupakan akumulasi dari seluruh jawaban.',
        '• 10% = tindakan awal yang belum konsisten.\n• 20% = mulai menunjukkan kebiasaan positif.\n• 30% = perilaku terstruktur dengan catatan kemajuan.\n• 40% = kontrol diri optimal dengan evaluasi berkelanjutan.',
      ],
    },
  ],
  curiosity: [
    {
      key: 'curiosity-intro-1',
      title: 'Keingintahuan',
      paragraphs: [
        'Keingintahuan adalah dorongan alami yang dimiliki setiap individu untuk mencari informasi, memahami dunia di sekitar mereka, dan mengeksplorasi kemungkinan yang ada. Dalam konteks karier, rasa ingin tahu mendorong kita untuk mencoba opsi baru, bereksperimen dengan berbagai jalur, dan mengembangkan keterampilan yang mungkin tidak terduga.',
        'Eksplorasi yang luas dapat membuka kesempatan yang sebelumnya tidak terpikirkan. Ketika kita bersedia menjelajahi berbagai bidang, kita dapat menemukan minat dan bakat baru, serta meningkatkan nilai diri di dunia kerja yang menghargai keterampilan multidisiplin.',
      ],
    },
    {
      key: 'curiosity-intro-2',
      title: 'Keingintahuan',
      paragraphs: [
        'Keingintahuan tidak hanya tentang mencari informasi, tetapi juga berani mengambil risiko. Saat menjelajahi jalur karier baru, kita menghadapi ketidakpastian dan tantangan. Sikap positif terhadap kegagalan dan kemampuan beradaptasi adalah kunci untuk terus belajar dari pengalaman.',
        'Rasa ingin tahu juga memperkaya hubungan interpersonal. Dengan menunjukkan minat tulus terhadap orang lain, kita membangun koneksi, belajar dari perspektif berbeda, dan menciptakan kolaborasi yang mendorong inovasi.',
      ],
    },
    {
      key: 'curiosity-intro-3',
      title: 'Keingintahuan',
      paragraphs: [
        'Untuk memanfaatkan keingintahuan secara efektif, kita perlu menggabungkannya dengan kemampuan berpikir kritis. Analisis berbagai sudut pandang membantu kita mengambil keputusan karier yang terinformasi dan penuh pertimbangan.',
        'Keingintahuan dan eksplorasi adalah fondasi penting dalam pengembangan pribadi dan profesional. Dengan rasa ingin tahu yang tinggi, kita tidak hanya membuka diri terhadap peluang, tetapi juga menemukan jalur karier yang bermakna.',
      ],
    },
    {
      key: 'curiosity-instructions',
      title: 'Instruksi Penilaian Curiosity',
      paragraphs: [
        'Terdapat 6 pertanyaan pada bagian CURIOSITY. Setiap soal memiliki 4 jawaban dengan bobot 10% hingga 40%. Pilih jawaban yang paling menggambarkan rasa ingin tahu dan eksplorasimu agar mencapai nilai target.',
        'Nilai akhir merupakan akumulasi dari seluruh jawaban. Fokus pada kombinasi eksplorasi, refleksi, dan keberanian mencoba hal baru.',
        '• 10% = eksplorasi awal.\n• 20% = mengeksplorasi beberapa opsi.\n• 30% = refleksi dan pengujian hasil.\n• 40% = eksplorasi mendalam dengan rencana tindakan lanjut.',
      ],
    },
  ],
  confidence: [
    {
      key: 'confidence-intro-1',
      title: 'Kepercayaan Diri',
      paragraphs: [
        'Kepercayaan diri adalah keyakinan bahwa kita mampu menyelesaikan tugas dan menghadapi tantangan, terutama dalam konteks karier. Sikap ini menjadi fondasi penting agar kita berani mengambil langkah strategis demi masa depan.',
        'Siswa yang percaya diri cenderung proaktif: melamar pekerjaan, memimpin proyek, hingga bernegosiasi tentang peluang. Sebaliknya, kurang percaya diri dapat membuat mereka ragu dan melewatkan kesempatan berharga.',
      ],
    },
    {
      key: 'confidence-intro-2',
      title: 'Kepercayaan Diri',
      paragraphs: [
        'Kepercayaan diri juga menentukan bagaimana kita bangkit dari kegagalan. Individu yang yakin pada kemampuannya akan melihat penolakan sebagai pelajaran, bukan sebagai akhir dari segalanya.',
        'Untuk menguatkan rasa percaya diri, tetapkan tujuan yang realistis, rayakan kemajuan kecil, dan manfaatkan dukungan sosial yang membangun. Lingkungan positif mempercepat pengembangan rasa yakin terhadap diri sendiri.',
      ],
    },
    {
      key: 'confidence-intro-3',
      title: 'Kepercayaan Diri',
      paragraphs: [
        'Dengan keyakinan diri yang kuat, kita lebih berani mengambil risiko, menghadapi tantangan, dan menyusun strategi baru saat situasi berubah. Ini adalah modal utama untuk berhasil di pendidikan maupun dunia kerja.',
        'Gunakan kesempatan ini untuk merefleksikan bagaimana kamu membangun rasa percaya diri. Pilih jawaban yang paling mencerminkan kebiasaanmu dalam menghadapi tugas, kegagalan, dan dukungan sosial.',
      ],
    },
    {
      key: 'confidence-instructions',
      title: 'Instruksi Penilaian Confidence',
      paragraphs: [
        'Terdapat 6 pertanyaan pada bagian CONFIDENCE. Setiap soal memiliki 4 jawaban dengan bobot 10% hingga 40%. Pilih jawaban yang paling menggambarkan kemampuanmu membangun kepercayaan diri.',
        'Nilai akhir merupakan akumulasi dari seluruh jawaban. Fokus pada langkah nyata yang kamu lakukan saat menghadapi tantangan dan mengembangkan keyakinan diri.',
        '• 10% = mencoba secara sederhana.\n• 20% = mulai konsisten dengan dukungan.\n• 30% = refleksi dan perbaikan strategi.\n• 40% = perencanaan matang dan evaluasi berkelanjutan.',
      ],
    },
  ],
};

export function scoreToCategory(percent: number): 'Rendah' | 'Sedang' | 'Tinggi' {
  if (percent >= 70) return 'Tinggi';
  if (percent >= 50) return 'Sedang';
  return 'Rendah';
}


