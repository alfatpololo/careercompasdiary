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
        'Kepedulian terhadap karier merupakan suatu konsep yang sangat penting, terutama bagi siswa Sekolah Menengah Kejuruan (SMK). Definisi ini mencakup perhatian yang mendalam dan kesiapan dalam merencanakan arah hidup profesional. Dalam konteks ini, kepedulian terhadap karier bukan hanya sekadar pemikiran tentang pekerjaan di masa depan, tetapi juga melibatkan proses aktif dalam merancang langkah-langkah yang diperlukan untuk mencapai tujuan tersebut.',
        'Mengapa kepedulian terhadap karier sangat penting bagi siswa SMK? Pertama-tama, siswa di tingkat ini berada pada fase transisi yang krusial antara pendidikan formal dan dunia kerja. Mereka sering kali dihadapkan pada pilihan yang menentukan, seperti bidang pekerjaan yang ingin mereka geluti dan langkah-langkah yang perlu diambil untuk mencapai tujuan tersebut. Dengan memiliki kepedulian yang tinggi terhadap karier, siswa dapat mengubah mimpi-mimpi mereka menjadi rencana yang lebih konkret dan terarah. Misalnya, seorang siswa yang bercita-cita menjadi seorang desainer grafis harus memahami langkah-langkah yang diperlukan, seperti mengambil kursus tambahan, membangun portofolio, dan mencari pengalaman kerja melalui magang.',
        'Selain itu, kepedulian terhadap karier juga membantu siswa untuk mengidentifikasi minat dan bakat mereka. Melalui eksplorasi diri dan refleksi, siswa dapat menemukan apa yang benar-benar mereka sukai dan bagaimana hal tersebut dapat diterapkan dalam dunia kerja. Contoh yang relevan adalah seorang siswa yang menyukai teknologi dan memiliki keterampilan dalam pemrograman. Dengan kepedulian yang tepat, siswa tersebut dapat memilih untuk mendalami bidang teknologi informasi dan mencari peluang untuk belajar lebih lanjut, baik melalui kursus online maupun proyek-proyek praktis.',
      ],
    },
    {
      key: 'concern-intro-2',
      title: 'Kepedulian',
      paragraphs: [
        'Penting juga untuk mencatat bahwa kepedulian terhadap karier tidak hanya berkaitan dengan pencarian pekerjaan, tetapi juga dengan pengembangan diri yang berkelanjutan. Dalam dunia yang terus berubah ini, keterampilan dan pengetahuan yang relevan menjadi semakin penting. Siswa yang memiliki kepedulian terhadap karier akan lebih cenderung untuk terus belajar dan beradaptasi dengan perubahan yang terjadi di industri. Sebagai contoh, seorang siswa yang awalnya berfokus pada keahlian tertentu dalam bidang akuntansi mungkin akan menyadari pentingnya memahami teknologi baru, seperti perangkat lunak akuntansi berbasis cloud, untuk tetap kompetitif di pasar kerja.',
        'Transisi dari sekolah ke dunia kerja sering kali menjadi tantangan besar bagi banyak siswa. Namun, dengan adanya kepedulian yang kuat terhadap karier, mereka dapat merencanakan langkah-langkah yang lebih terstruktur. Hal ini termasuk mencari informasi tentang peluang kerja, mengikuti seminar atau workshop, serta membangun jaringan yang dapat membantu mereka dalam mencari pekerjaan. Siswa yang aktif dalam mencari informasi dan terlibat dalam kegiatan yang berkaitan dengan karier mereka akan lebih siap menghadapi tantangan yang ada.',
        'Dalam kesimpulan, kepedulian terhadap karier merupakan aspek yang sangat penting bagi siswa SMK. Ini bukan hanya tentang mempersiapkan diri untuk memasuki dunia kerja, tetapi juga tentang membangun fondasi yang kuat untuk pengembangan diri di masa depan. Dengan memahami pentingnya merencanakan karier dan mengambil langkah-langkah yang tepat, siswa dapat mengubah impian mereka menjadi kenyataan. Melalui eksplorasi minat, pengembangan keterampilan, dan pencarian informasi yang aktif, mereka dapat menciptakan jalur karier yang sukses dan memuaskan. Oleh karena itu, penting bagi semua pihak, termasuk pendidik dan orang tua, untuk mendukung siswa dalam perjalanan mereka menuju masa depan yang cerah.',
      ],
    },
    {
      key: 'concern-instructions',
      title: 'Instruksi Penilaian Concern',
      paragraphs: [
        'Terdapat 6 pertanyaan pada bagian CONCERN. Setiap soal memiliki 4 jawaban. Pilih jawaban yang paling mencerminkan dimensi kepedulianmu terhadap karier.',
        'Pilih jawaban terbaik pada setiap soal. Nilai akhir merupakan akumulasi dari seluruh jawaban.',
      ],
    },
  ],
  control: [
    {
      key: 'control-intro-1',
      title: 'Kendali Diri',
      paragraphs: [
        'Kendali diri, atau self-regulation, adalah kemampuan penting yang dimiliki individu dalam mengelola tindakan dan membuat keputusan yang tepat. Dalam konteks pendidikan dan pengembangan karier, kendali diri tidak hanya berkaitan dengan kemampuan untuk menahan diri dari godaan, tetapi juga mencakup tanggung jawab yang lebih besar terhadap langkah-langkah yang diambil dalam hidup. Hal ini mencakup berbagai aspek, mulai dari pengaturan emosi hingga pengambilan keputusan strategis yang akan berdampak pada masa depan seseorang.',
        'Pentingnya kendali diri dalam kehidupan siswa sangatlah signifikan. Siswa yang memiliki kemampuan ini cenderung lebih proaktif dalam mengambil inisiatif. Mereka tidak hanya menunggu kesempatan datang, tetapi berusaha menciptakan peluang untuk diri mereka sendiri. Misalnya, seorang siswa yang memiliki kendali diri yang baik mungkin akan mencari proyek tambahan di luar kurikulum untuk memperdalam pemahaman mereka tentang suatu topik. Mereka memahami bahwa usaha ekstra ini akan memberikan mereka keunggulan di masa depan. Dalam situasi sulit, siswa dengan kendali diri tidak mudah menyerah. Mereka mampu menghadapi tantangan dan mencari solusi yang kreatif, bukan hanya berfokus pada masalah yang ada. Contoh nyata dapat dilihat pada siswa yang mengalami kesulitan dalam mata pelajaran tertentu; alih-alih menyerah, mereka akan mencari bantuan dari guru atau teman, atau bahkan menggunakan sumber daya online untuk memahami materi yang sulit.',
        'Mengelola emosi juga merupakan bagian integral dari kendali diri. Ketika siswa dapat mengatur emosinya, mereka lebih mampu untuk tetap tenang dan fokus dalam situasi yang menekan. Misalnya, saat menghadapi ujian yang sulit, siswa yang mampu mengelola kecemasan mereka akan lebih baik dalam berkonsentrasi dan memberikan performa terbaiknya. Dalam hal ini, teknik seperti pernapasan dalam atau meditasi dapat menjadi alat yang efektif untuk menenangkan pikiran dan membantu siswa tetap fokus pada tujuan mereka. Dengan mengendalikan emosi, siswa juga dapat berinteraksi dengan lebih baik dengan teman sebaya dan guru, menciptakan lingkungan belajar yang positif',
      ],
    },
    {
      key: 'control-intro-2',
      title: 'Kendali Diri',
      paragraphs: [
        'Proses pengambilan keputusan juga sangat dipengaruhi oleh kendali diri. Siswa yang mampu mengevaluasi pilihan mereka dengan cermat dan mempertimbangkan konsekuensi dari setiap tindakan cenderung membuat keputusan yang lebih baik. Sebagai contoh, ketika dihadapkan pada pilihan untuk bergabung dengan organisasi ekstrakurikuler, siswa yang memiliki kendali diri akan mempertimbangkan waktu yang tersedia, komitmen yang diperlukan, dan bagaimana kegiatan tersebut dapat mendukung tujuan jangka panjang mereka. Mereka tidak hanya akan memilih berdasarkan popularitas atau tekanan dari teman, tetapi akan melakukan analisis yang mendalam tentang apa yang terbaik untuk perkembangan diri mereka.',
        'Transisi dari satu keputusan ke keputusan lainnya juga memerlukan kendali diri. Siswa yang mampu memahami bahwa setiap keputusan memiliki dampak jangka panjang akan lebih berhati-hati dalam memilih langkah mereka. Misalnya, ketika memilih jurusan di perguruan tinggi, siswa yang memiliki kendali diri akan melakukan riset tentang prospek karier, minat pribadi, dan kemampuan mereka, sehingga mereka dapat membuat pilihan yang lebih bijaksana. Mereka tidak hanya terfokus pada keputusan itu sendiri, tetapi juga pada bagaimana keputusan tersebut akan membentuk masa depan mereka.',
        'Dengan demikian, kendali diri sangat penting dalam membentuk karakter dan pola pikir siswa. Kemampuan untuk mengelola tindakan, bertanggung jawab atas keputusan, dan tetap termotivasi dalam menghadapi tantangan adalah keterampilan yang akan membawa mereka menuju kesuksesan. Siswa yang memiliki kendali diri yang baik tidak hanya akan unggul di lingkungan akademis, tetapi juga akan siap menghadapi tantangan di dunia profesional.',
        'Kesimpulannya, kendali diri adalah fondasi yang kuat bagi pengambilan keputusan yang efektif dan pengelolaan tindakan. Dengan mengembangkan kemampuan ini, siswa dapat mengambil inisiatif, menghadapi tantangan dengan keberanian, dan membuat keputusan yang bijaksana untuk masa depan mereka. Kendali diri bukan hanya tentang menahan diri dari godaan, tetapi juga tentang memiliki visi yang jelas dan komitmen untuk mencapai tujuan jangka panjang. Oleh karena itu, penting bagi pendidik dan orang tua untuk mendukung pengembangan kendali diri ini pada siswa, agar mereka dapat tumbuh menjadi individu yang bertanggung jawab dan sukses di masa depan.',
      ],
    },
    {
      key: 'control-instructions',
      title: 'Instruksi Penilaian Control',
      paragraphs: [
        'Terdapat 6 pertanyaan pada bagian CONTROL. Setiap soal memiliki 4 jawaban. Pilih jawaban yang benar-benar menggambarkan dimensi kontrol dirimu dalam mengambil keputusan karier.',
        'Pilih jawaban terbaik pada setiap soal. Nilai akhir merupakan akumulasi dari seluruh jawaban.',
      ],
    },
  ],
  curiosity: [
    {
      key: 'curiosity-intro-1',
      title: 'Keingintahuan',
      paragraphs: [
        'Keingintahuan adalah dorongan alami yang dimiliki setiap individu untuk mencari informasi, memahami dunia di sekitar mereka, dan mengeksplorasi kemungkinan yang ada. Dalam konteks karier, keingintahuan ini mendorong individu untuk mencoba opsi baru, bereksperimen dengan berbagai jalur, dan mengembangkan keterampilan yang mungkin tidak terduga sebelumnya. Dalam dunia yang terus berubah dan berkembang dengan cepat, memiliki rasa ingin tahu yang tinggi menjadi semakin penting. Hal ini tidak hanya membuka pintu bagi berbagai peluang, tetapi juga membantu individu menghindari risiko terjebak dalam pilihan sempit yang dapat membatasi potensi mereka.',
        'Salah satu alasan utama mengapa keingintahuan sangat penting adalah karena eksplorasi yang luas dapat membuka kesempatan yang mungkin sebelumnya tidak terpikirkan. Ketika seseorang bersedia untuk menjelajahi berbagai bidang, mereka dapat menemukan minat dan bakat baru yang mungkin tidak mereka sadari sebelumnya. Misalnya, seorang insinyur yang mulai tertarik pada desain grafis dapat menemukan cara untuk menggabungkan kedua bidang tersebut, menciptakan produk yang inovatif dan menarik. Proses eksplorasi ini tidak hanya memperkaya pengalaman pribadi, tetapi juga meningkatkan nilai seseorang di pasar kerja. Dalam era di mana keterampilan multidisiplin semakin dihargai, keingintahuan menjadi aset yang sangat berharga.',
        'Namun, penting untuk memahami bahwa keingintahuan tidak hanya tentang mencari informasi, tetapi juga tentang berani mengambil risiko. Ketika seseorang menjelajahi jalur karier yang baru, mereka sering kali dihadapkan pada ketidakpastian dan tantangan. Dalam situasi ini, sikap positif terhadap kegagalan menjadi sangat penting. Misalnya, seorang pengusaha yang memulai bisnis baru mungkin mengalami beberapa kegagalan sebelum akhirnya menemukan model bisnis yang berhasil. Setiap kegagalan tersebut memberikan pelajaran berharga yang dapat digunakan untuk meningkatkan strategi di masa depan. Dengan demikian, keingintahuan yang didukung oleh keberanian untuk beradaptasi dan belajar dari pengalaman menjadi kunci untuk mencapai kesuksesan.',
      ],
    },
    {
      key: 'curiosity-intro-2',
      title: 'Keingintahuan',
      paragraphs: [
        'Selain itu, keingintahuan juga dapat memperkaya hubungan interpersonal. Ketika seseorang menunjukkan minat yang tulus terhadap orang lain, mereka tidak hanya membangun koneksi yang lebih dalam, tetapi juga membuka diri untuk belajar dari pengalaman dan perspektif orang lain. Misalnya, dalam lingkungan kerja, seorang karyawan yang aktif bertanya dan mendengarkan rekan-rekannya dapat menciptakan suasana kolaboratif yang mendorong inovasi. Dengan berinteraksi secara aktif dan mengeksplorasi ide-ide baru, tim dapat menemukan solusi yang lebih baik dan lebih kreatif untuk masalah yang dihadapi.',
        'Namun, untuk memanfaatkan keingintahuan secara efektif, individu perlu mengembangkan keterampilan tertentu. Salah satunya adalah kemampuan untuk berpikir kritis. Dalam proses eksplorasi, penting untuk tidak hanya menerima informasi begitu saja, tetapi juga menganalisis dan mengevaluasi berbagai sudut pandang. Dengan berpikir kritis, seseorang dapat membuat keputusan yang lebih baik dan lebih terinformasi mengenai jalur karier yang ingin diambil. Misalnya, seseorang yang mempertimbangkan untuk beralih dari satu industri ke industri lain harus melakukan riset mendalam tentang tren pasar, keterampilan yang dibutuhkan, dan potensi pertumbuhan di bidang baru tersebut.',
        'Sebagai penutup, keingintahuan dan eksplorasi merupakan dua elemen yang saling terkait dan sangat penting dalam pengembangan pribadi dan profesional. Dengan memiliki rasa ingin tahu yang tinggi, individu tidak hanya dapat membuka diri terhadap berbagai peluang, tetapi juga menghindari risiko terjebak dalam pilihan sempit. Melalui eksplorasi yang berani dan berpikir kritis, seseorang dapat menemukan jalur karier yang lebih memuaskan dan bermakna. Oleh karena itu, penting bagi setiap individu untuk terus mendorong rasa ingin tahu mereka dan berani menjelajahi berbagai kemungkinan yang ada di depan mereka.',
      ],
    },
    {
      key: 'curiosity-instructions',
      title: 'Instruksi Penilaian Curiosity',
      paragraphs: [
        'Terdapat 6 pertanyaan pada bagian CURIOSITY. Setiap soal memiliki 4 jawaban. Pilih jawaban yang paling menggambarkan rasa ingin tahu dan eksplorasimu dalam karier.',
        'Pilih jawaban terbaik pada setiap soal. Nilai akhir merupakan akumulasi dari seluruh jawaban.',
      ],
    },
  ],
  confidence: [
    {
      key: 'confidence-intro-1',
      title: 'Kepercayaan Diri',
      paragraphs: [
        'Kepercayaan diri atau self-efficacy, merupakan salah satu komponen penting dalam pengembangan pribadi dan profesional seseorang. Secara sederhana, kepercayaan diri adalah keyakinan individu akan kemampuan mereka untuk menyelesaikan tugas dan menghadapi tantangan yang ada di depan mereka, terutama dalam konteks karier. Dalam dunia yang semakin kompetitif ini, memiliki kepercayaan diri yang tinggi sangatlah penting, karena dapat mempengaruhi segala aspek kehidupan, mulai dari pendidikan hingga pekerjaan.',
        'Kepercayaan diri berfungsi sebagai pendorong utama bagi siswa untuk mengambil langkah-langkah yang diperlukan dalam mencapai tujuan mereka. Misalnya, seorang siswa yang percaya diri akan lebih cenderung untuk melamar pekerjaan, bernegosiasi tentang gaji, atau bahkan mencoba untuk memimpin sebuah proyek meskipun ada risiko kegagalan. Sebaliknya, siswa yang kurang percaya diri mungkin akan ragu untuk mengambil inisiatif, sehingga melewatkan berbagai kesempatan yang berharga. Hal ini menunjukkan bahwa kepercayaan diri bukan hanya sekadar perasaan positif, tetapi juga merupakan faktor kunci yang dapat membuka pintu menuju kesuksesan.',
        'Salah satu contoh nyata dari pentingnya kepercayaan diri dapat dilihat dalam dunia kerja. Misalnya, seorang lulusan baru yang melamar pekerjaan di perusahaan besar. Jika lulusan tersebut memiliki kepercayaan diri yang tinggi, mereka akan lebih berani untuk menghadapi wawancara, menjawab pertanyaan dengan tegas, dan menunjukkan kemampuan serta keahlian yang dimiliki. Dalam situasi ini, kepercayaan diri tidak hanya membantu mereka untuk tampil lebih baik, tetapi juga meningkatkan peluang mereka untuk diterima. Di sisi lain, lulusan yang kurang percaya diri mungkin akan merasa terintimidasi dan tidak mampu mengekspresikan diri dengan baik, sehingga mengurangi peluang mereka untuk mendapatkan pekerjaan yang diinginkan.',
      ],
    },
    {
      key: 'confidence-intro-2',
      title: 'Kepercayaan Diri',
      paragraphs: [
        'Selain itu, kepercayaan diri juga berperan penting dalam kemampuan seseorang untuk bertahan dalam menghadapi kegagalan. Dalam perjalanan karier, tidak jarang seseorang mengalami kegagalan atau penolakan. Namun, individu yang memiliki kepercayaan diri yang kuat cenderung lebih mampu bangkit dari kegagalan tersebut. Mereka melihat kegagalan sebagai bagian dari proses belajar dan kesempatan untuk memperbaiki diri, bukan sebagai akhir dari segalanya. Misalnya, seorang pengusaha yang mengalami kegagalan dalam usaha pertamanya mungkin akan merasa kecewa, tetapi dengan kepercayaan diri yang tinggi, mereka akan berusaha untuk menganalisis kesalahan yang terjadi dan mencoba lagi dengan pendekatan yang lebih baik. Dalam hal ini, kepercayaan diri berfungsi sebagai fondasi yang memungkinkan seseorang untuk terus berjuang meskipun dihadapkan pada berbagai rintangan.',
        'Untuk mengembangkan kepercayaan diri, ada beberapa strategi yang dapat diterapkan. Salah satunya adalah dengan menetapkan tujuan yang realistis dan terukur. Dengan mencapai tujuan-tujuan kecil, individu akan merasakan peningkatan kepercayaan diri seiring dengan kemajuan yang dicapai. Misalnya, seorang siswa yang ingin meningkatkan kemampuan berbicara di depan umum dapat mulai dengan berbicara di depan teman-teman terdekatnya sebelum akhirnya tampil di depan audiens yang lebih besar. Setiap pencapaian kecil akan memberikan dorongan positif yang memperkuat kepercayaan diri mereka.',
        'Selain itu, penting juga untuk mengelilingi diri dengan orang-orang yang mendukung dan memberikan feedback konstruktif. Lingkungan sosial yang positif dapat membantu individu merasa lebih percaya diri. Misalnya, seorang siswa yang didukung oleh teman-teman dan keluarga yang percaya pada kemampuannya akan merasa lebih termotivasi untuk menghadapi tantangan. Sebaliknya, kritik yang tidak membangun dapat merusak kepercayaan diri dan menghambat kemajuan.',
        'Dalam kesimpulannya, kepercayaan diri adalah elemen krusial dalam mencapai kesuksesan, baik di bidang pendidikan maupun karier. Dengan memiliki keyakinan akan kemampuan diri, individu akan lebih berani mengambil risiko, menghadapi tantangan, dan bangkit dari kegagalan. Oleh karena itu, penting untuk terus mengembangkan kepercayaan diri melalui pencapaian tujuan, dukungan sosial, dan pengembangan diri. Dengan cara ini, setiap individu dapat memaksimalkan potensi mereka dan meraih keberhasilan yang diimpikan.',
      ],
    },
    {
      key: 'confidence-instructions',
      title: 'Instruksi Penilaian Confidence',
      paragraphs: [
        'Terdapat 6 pertanyaan pada bagian CONFIDENCE. Setiap soal memiliki 4 jawaban. Pilih jawaban yang paling menggambarkan kemampuanmu membangun kepercayaan diri dalam menghadapi tantangan karier.',
        'Pilih jawaban terbaik pada setiap soal. Nilai akhir merupakan akumulasi dari seluruh jawaban.',
      ],
    },
  ],
};

export type ScoreCategory = 'Very High' | 'High' | 'Medium' | 'Low' | 'Very Low';

export function scoreToCategory(score: number, maxScore: number = 240): ScoreCategory {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  if (pct >= 90) return 'Very High';   // Sangat tinggi
  if (pct >= 70) return 'High';       // Tinggi
  if (pct >= 50) return 'Medium';     // Sedang
  if (pct >= 30) return 'Low';        // Rendah
  return 'Very Low';                  // Sangat rendah
}

export function getCategoryInfo(category: ScoreCategory): { 
  label: string; 
  action: string; 
  color: string;
  passed: boolean;
} {
  switch (category) {
    case 'Very High':
      return {
        label: 'Sangat Tinggi',
        action: 'Lolos otomatis',
        color: 'text-green-700 bg-green-100',
        passed: true,
      };
    case 'High':
      return {
        label: 'Tinggi',
        action: 'Lolos',
        color: 'text-blue-700 bg-blue-100',
        passed: true,
      };
    case 'Medium':
      return {
        label: 'Sedang',
        action: 'Perlu penguatan',
        color: 'text-amber-700 bg-amber-100',
        passed: false,
      };
    case 'Low':
      return {
        label: 'Rendah',
        action: 'Ulang materi + Remedial + retest',
        color: 'text-yellow-700 bg-yellow-100',
        passed: false,
      };
    case 'Very Low':
      return {
        label: 'Sangat Rendah',
        action: 'Ulang intensif',
        color: 'text-red-700 bg-red-100',
        passed: false,
      };
  }
}


