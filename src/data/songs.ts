export interface Song {
  id: string;
  title: string;
  artist: string; // Movie name
  singer?: string; // Actual singer name
  movie?: string; // Movie name (same as artist for now)
  imageUrl: string;
  audioUrl: string;
  duration: number; // in seconds
  album?: string;
  year?: number;
  genre?: string;
  language?: 'telugu' | 'hindi' | 'tamil' | 'kannada' | 'other';
  sync?: 'sad' | 'love' | 'break' | 'happy' | 'devotional' | 'feel1' | 'action' | 'romantic' | 'friend' | 'dance' | 'folk' | 'mass' | 'party' | 'classical' | 'rap' | 'moti' | '.' | 'mother' | 'normal' | 'good' | 'Rap' | 'Feel' | 'Sad' | 'Love' | '9';
}
export const songs: Song[] =[
    //18 Pages
    {
    id: "Yedurangula Vaana",
    title: "Yedurangula Vaana",
    artist: "18 Pages",
    imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1743417356/16712135423689_h4r5p5.jpg",
    audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1743416935/Yedurangula_Vaana_128_Kbps_f9ppps.mp3",
    duration: 265,
    album: "18 Pages",
    year: 2022,
    genre: "Love",
    language: "telugu",
    sync: "love"
  },
  //Peddi
  {
  id: "Peddi",
  title: "Chikiri Chikiri",
  artist: "Peddi",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764608257/Peddi-2025_i5pzhr.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764608269/Chikiri_Chikiri_jfcks5.mp3",
  duration: 272,
  album: "Chikiri Chikiri",
  year: 2025,
  genre: "love",
  language: "telugu",
  sync: "love"
  },
  {
  id: "Chikiri Chikiri-hindi",
  title: "Chikiri Chikiri-hindi",
  artist: "Peddi",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764608257/Peddi-2025_i5pzhr.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764608262/Chikiri_Chikiri_1_obxyw5.mp4",
  duration: 272,
  album: "Chikiri Chikiri",
  year: 2025,
  genre: "love",
  language: "hindi",
  sync: "love"
},
 {
  id: "Chikiri Chikiri-hindi",
  title: "Chikiri Chikiri-hindi",
  artist: "Peddi",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764608257/Peddi-2025_i5pzhr.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764608262/Chikiri_Chikiri_1_obxyw5.mp4",
  duration: 272,
  album: "Chikiri Chikiri",
  year: 2025,
  genre: "love",
  language: "hindi",
  sync: "love"
},
//The RajaSaab
{
      id: "Sahana Sahana",
      title: "Sahana Sahana",
      artist: "The RajaSaab",
      imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1766109884/IMG_20251219_072805_efxbnx.jpg",
      audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1766109891/Sahana_Sahana_xzgekh.mp3",
      duration: 258,
      album: "Sahana Sahana",
      year: 2025,
      genre: ".",
      language: "telugu",
      sync: "."
    },
     {
  id: "Rebel Saab",
  title: "Rebel Saab",
  artist: "The RajaSaab",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1766109884/IMG_20251219_072805_efxbnx.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1766109887/Rebel_Saab_aeal4v.mp3",
  duration: 221,
  album: "Rebel Saab",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "."
},
{
  id: "Rebel Saab",
  title: "Rebel Saab",
  artist: "The RajaSaab",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1766109884/IMG_20251219_072805_efxbnx.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1766109887/Rebel_Saab_aeal4v.mp3",
  duration: 221,
  album: "Rebel Saab",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "."
},
//Dude
{
  id: "Boom Boom",
  title: "Boom Boom",
  artist: "Dude",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764609908/Dude-2025-Baagundu-Po-250x250_am0wji.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764610233/Boom_Boom_PenduJatt.Com.Se_cwkiup.mp3",
  duration: 240,
  album: "Boom Boom",
  year: 2025,
  genre: "love",
  language: "telugu",
  sync: "love"
},
{
  id: "Nee Gunde Lona",
  title: "Nee Gunde Lona",
  artist: "Dude",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764609908/Dude-2025-Baagundu-Po-250x250_am0wji.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764609913/Nee_Gunde_Lona_PenduJatt.Com.Se_qbnszs.mp3",
  duration: 274,
  album: "Nee Gunde Lona",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "."
},
  {
  id: "Baagundu Po",
  title: "Baagundu Po",
  artist: "Dude",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764609908/Dude-2025-Baagundu-Po-250x250_am0wji.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764610246/Baagundu_Po_PenduJatt.Com.Se_xochft.mp3",
  duration: 240,
  album: "Baagundu Po",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "."
},
   {
  id: "Singari",
  title: "Singari",
  artist: "Dude",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764609908/Dude-2025-Baagundu-Po-250x250_am0wji.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764609945/Singari_PenduJatt.Com.Se_botju7.mp3",
  duration: 182,
  album: "Singari",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "love"
},

  //OG
   {
  id: "suvvi-suvvi",
  title: "Suvvi Suvvi",
  artist: "OG",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1756834705/IMG_20250902_230806_xw0rxf.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1756834521/They_Call_Him_OG_-_Suvvi_Suvvi_Lyric_Video_Pawan_Kalyan_Sujeeth_Thaman_S_DVV_Danayya_vamobe.mp3",
  duration: 281,
  album: "Suvvi Suvvi",
  year: 2025,
  genre: "Love it ",
  language: "telugu",
  sync: "romantic"
},
  {
  id: "Hungry Cheetah OG Glimpse",
  title: "Hungry Cheetah OG Glimpse",
  artist: "OG",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755087726/OG-2025-Firestorm-250x250_pu9b4q.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1755087729/iSongs.info_01_-_Hungry_Cheetah_OG_Glimpse_nuclxx.mp3",
  duration: 119,
  album: "Hungry Cheetah OG Glimpse",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "rap"
},
 {
    id: "6d313dfd-4814-4c9f-92f0-9fcb2fd7203b",
    title: "Firestorm",
    artist: "OG",
    imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755087726/OG-2025-Firestorm-250x250_pu9b4q.jpg",
    audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1755087734/iSongs.info_02_-_Firestorm_mmu1pg.mp3",
    duration: 240,
    album: "Firestorm",
    year: 2025,
    genre: ".",
    language: "telugu",
    sync: "action"
  },
   {
  id: "Guns And Roses",
  title: "Guns And Roses",
  artist: "OG",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755087726/OG-2025-Firestorm-250x250_pu9b4q.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1764298876/Guns_And_Roses_ozfrvx.mp3",
  duration: 257,
  album: "Guns And Roses",
  year: 2025,
  genre: "."
},
{
  id: "Washi O Washi",
  title: "Washi O Washi",
  artist: "OG",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755087726/OG-2025-Firestorm-250x250_pu9b4q.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1764298819/Washi_O_Washi_ghjrsd.mp3",
  duration: 112,
  album: "Washi O Washi",
  year: 2025,
  genre: "."
},
  {
  id: "The Streets Of Fire",
  title: "The Streets Of Fire",
  artist: "OG",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755087726/OG-2025-Firestorm-250x250_pu9b4q.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1764298848/In_The_Streets_Of_Fire_yg549b.mp3",
  duration: 119,
  album: "The Streets Of Fire",
  year: 2025,
  genre: "."
},
  {
  id: "Trance of OMI",
  title: "Trance of OMI",
  artist: "OG",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755087726/OG-2025-Firestorm-250x250_pu9b4q.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1764298857/Trance_of_OMI_ki4rob.mp3",
  duration: 173,
  album: "Trance of OMI",
  year: 2025,
  genre: "."
},
  {
  id: "Kiss Kiss Bang Bang",
  title: "Kiss Kiss Bang Bang",
  artist: "OG",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755087726/OG-2025-Firestorm-250x250_pu9b4q.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1764298858/Kiss_Kiss_Bang_Bang_wwtyeo.mp3",
  duration: 257,
  album: "Kiss Kiss Bang Bang",
  year: 2025,
  genre: "."
},
//Monica
 {
  id: "Monica Telugu",
  title: "Monica Telugu",
  artist: "Monica",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1754741575/59317_4_eoh8rw.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1754741635/Monica_Telugu_KoshalWorld.Com_itvbc7.mp3",
  duration: 188,
  album: "Monica Telugu",
  year: 2025,
  genre: "rap",
  language: "telugu",
  sync: "mass"
},
//Kingdom
{
  id: "trending5",
  title: "Hridayam Lopala",
  artist: "Kingdom",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1754740913/size_m_1746425141_j58ecx.webp",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1754740891/Hridayam_Lopala_yq1sdw.mp3",
  duration: 134,
  album: "Hridayam Lopala",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "sad"
},
{
  id: "Ragile Ragile",
  title: "Ragile Ragile",
  artist: "Kingdom",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1754740913/size_m_1753770287_a22f0j.webp",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1754740895/Ragile_Ragile_w8dp1e.mp3",
  duration: 329,
  album: "Ragile Ragile",
  year: 2025,
  genre: "action",
  language: "telugu",
  sync: "mass"
},
{
  id: "Hridayam Lopala",
  title: "Hridayam Lopala",
  artist: "Kingdom",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1754740913/size_m_1746425141_j58ecx.webp",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1754740891/Hridayam_Lopala_yq1sdw.mp3",
  duration: 134,
  album: "Hridayam Lopala",
  year: 2025,
  genre: "love",
  language: "telugu",
  sync: "romantic"
},
{
  id: "Anna Antene",
  title: "Anna Antene",
  artist: "Kingdom",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1754740914/kingdom-tamil-2025_x4ijhc.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1754740894/Anna_Antene_iv7m6y.mp3",
  duration: 278,
  album: "Anna Antene",
  year: 2025,
  genre: "blood",
  language: "telugu",
  sync: "love"
},

  //Return of the Dargon
  {
  id: "Yendhukae Nannodhilaavu",
  title: "Yendhukae Nannodhilaavu",
  artist: "Return of the Dargon",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755939650/Return-Of-The-Dragon-Telugu-2025-Yendhukae-Nannodhilaavu-250x250_p53pfr.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1755939685/iSongs.info_03_-_Yendhukae_Nannodhilaavu_tumpal.mp3",
  duration: 258,
  album: "Yendhukae Nannodhilaavu",
  year: 2025,
  genre: "love",
  language: "telugu",
  sync: "sad"
},
{
  id: "db7f1b4b-9f04-4ec3-9cdd-7c77090b7e56",
  title: "Madhuvaramae",
  artist: "Return of the Dargon",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755939650/Return-Of-The-Dragon-Telugu-2025-Yendhukae-Nannodhilaavu-250x250_p53pfr.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1755939688/iSongs.info_02_-_Madhuvaramae_rkpzlv.mp3",
  duration: 218,
  album: "Madhuvaramae",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "."
},
{
  id: "rise-of-dragon",
  title: "Rise Of Dragon",
  artist: "Return of the Dargon",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755939650/Return-Of-The-Dragon-Telugu-2025-Yendhukae-Nannodhilaavu-250x250_p53pfr.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1755939685/iSongs.info_03_-_Yendhukae_Nannodhilaavu_tumpal.mp3",
  duration: 210,
  album: "Rise Of Dragon",
  year: 2025,
  genre: "mass",
  language: "telugu",
  sync: "rap"
},
  //Andhra King Taluka
  {
    id: "Chinni Gundelo",
    title: "Chinni Gundelo",
    artist: "Andhra King Taluka",
    imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1764302605/chinni-gundelo-andhra-king-taluka_tbnig6.jpg",
    audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1764298267/Chinni_Gundelo_wsdnmm.mp3",
    duration: 219,
    album: "Nuvvunte Chaley",
    year: 2025,
    genre: ".",
    language: "telugu",
    sync: "romantic"
  },
  {
    id: "trending2",
    title: "Nuvvunte Chaley",
    artist: "Andhra King Taluka",
    imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1754743786/andhrakingtaluka-20250515112950-23300_mu8zny.jpg",
    audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1754743776/Nuvvunte_Chaley_gvcrva.mp3",
    duration: 240,
    album: "Nuvvunte Chaley",
    year: 2025,
    genre: ".",
    language: "telugu",
    sync: "sad"
  },
  {
  id: "Untold Emotions",
  title: "Untold Emotions",
  artist: "Andhra King Taluka",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1754743786/andhrakingtaluka-20250515112950-23300_mu8zny.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1764298323/Untold_Emotions_zzyhrl.mp3",
  duration: 276,
  album: "Untold Emotions",
  year: 2025,
  genre: "."
},
  {
  id: "Puppy Shame",
  title: "Puppy Shame",
  artist: "Andhra King Taluka",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1754743786/andhrakingtaluka-20250515112950-23300_mu8zny.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1764298288/Puppy_Shame_zv1i4t.mp3",
  duration: 214,
  album: "Andhra King Taluka",
  year: 2025,
  genre: "."
},
{
  id: "Chalu",
  title: "Chalu",
  artist: "Andhra King Taluka",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1754743786/andhrakingtaluka-20250515112950-23300_mu8zny.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1764298339/Chalu_h3lay1.mp3",
  duration: 269,
  album: "Chalu",
  year: 2025,
  genre: "."
},
  {
  id: "First Day First Show",
  title: "First Day First Show",
  artist: "Andhra King Taluka",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1754743786/andhrakingtaluka-20250515112950-23300_mu8zny.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1764298358/First_Day_First_Show_tnev6d.mp3",
  duration: 176,
  album: "First Day First Show",
  year: 2025,
  genre: "."
},
//Kubera
{
  id: "trending6",
  title: "Naa Koduka",
  artist: "Kubera",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628146/Kuberaa-Telugu-2025-20250624153504-500x500_gappsa.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628194/Naa_Koduka_d5ocut.mp3",
  duration: 285,
  album: "Naa Koduka",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "love"
},
{
  id: "Poyiraa Mama",
  title: "Poyiraa Mama",
  artist: "Kubera",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628146/Kubera-Telugu-2024-20241117001625-500x500_wufd8d.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628199/Poyiraa_Mama_evltpn.mp3",
  duration: 263,
  album: "Poyiraa Mama",
  year: 2025,
  genre: "Sad",
  language: "telugu",
  sync: "feel1"
},
{
  id: "Pippi Pippi Dum Dum",
  title: "Pippi Pippi Dum Dum",
  artist: "Kubera",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628146/Kubera-Telugu-2024-20241117001625-500x500_wufd8d.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628194/Naa_Koduka_d5ocut.mp3",
  duration: 227,
  album: "Pippi Pippi Dum Dum",
  year: 2025,
  genre: "good",
  language: "telugu",
  sync: "happy"
},
{
  id: "add-012",
  title: "Naa Koduka",
  artist: "Kubera",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628146/Kuberaa-Telugu-2025-20250624153504-500x500_gappsa.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628194/Naa_Koduka_d5ocut.mp3",
  duration: 285,
  album: "Naa Koduka",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "romantic"
},
{
  id: "add-014",
  title: "Anaganaga Kadha",
  artist: "Kubera",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628146/Kubera-Telugu-2024-20241117001625-500x500_wufd8d.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628191/Anaganaga_Kadha_eelfc2.mp3",
  duration: 202,
  album: "Anaganaga Kadha",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "sad"
},
//Arjun Reddy
{
  id: "Telisineyn Na Nuvvey",
  title: "Telisineyn Na Nuvvey",
  artist: "Arjun Reddy",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755345046/images_12_ykyjsh.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1755913600/Telisiney_Na_Nuvvey_-_SenSongsMp3.Co_fqniw8.mp3",
  duration: 252,
  album: "Telisineyn Na Nuvvey",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "break"
},
{
  id: "Oopiri Aaguthunnadey",
  title: "Oopiri Aaguthunnadey",
  artist: "Arjun Reddy",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755345046/images_12_ykyjsh.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1755345054/Oopiri_Aaguthunnadey_PenduJatt.Com.Se_jesbuy.mp3",
  duration: 244,
  album: "Oopiri Aaguthunnadey",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "sad"
},
{
  id: "Emitemitemo",
  title: "Emitemitemo",
  artist: "Arjun Reddy",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755345046/images_12_ykyjsh.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1755345050/Emitemitemo_PenduJatt.Com.Se_josscd.mp3",
  duration: 203,
  album: "Emitemitemo",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "sad"
},
{
  id: "5a23d0e1-2387-4c55-a293-5032d47eaad1",
  title: "Mari Mari",
  artist: "Arjun Reddy",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755345046/images_12_ykyjsh.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1755345053/Mari_Mari_PenduJatt.Com.Se_mui80r.mp3",
  duration: 174,
  album: "Mari Mari",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "."
},
  {
  id: "2be75c4f-d4af-4be9-bd2e-d423f781f411",
  title: "Gundelonaa",
  artist: "Arjun Reddy",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755345046/images_12_ykyjsh.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1755345053/Gundelonaa_PenduJatt.Com.Se_nrjwen.mp3",
  duration: 235,
  album: "Gundelonaa",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "."
},
  {
  id: "ce588104-805d-470d-b56f-554449456efa",
  title: "Dhooram",
  artist: "Arjun Reddy",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755345046/images_12_ykyjsh.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1755345049/Dhooram_PenduJatt.Com.Se_vayuwm.mp3",
  duration: 180,
  album: "Dhooram",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "."
},
//Araya 2
  {
    id: "Uppenantha",
    title: "Uppenantha",
    artist: "Arya 2",
    imageUrl: "https://res.cloudinary.com/dcso0vsxw/image/upload/v1745143475/5b3c1a4a17f0986815b689ff90fcc0a8_f5l8en.jpg",
    audioUrl: "https://res.cloudinary.com/dcso0vsxw/video/upload/v1745143413/2-Uppenantha-SenSongsMp3.Co_1_la1ohs.mp3",
    duration: 272,
    album: "Arya 2",
    year: 2009,
    genre: "Romantic",
    language: "telugu",
    sync: "break"
  },
  {
    id: "Mr Perfect",
    title: "Mr Perfect",
    artist: "Arya 2",
    imageUrl: "https://res.cloudinary.com/dcso0vsxw/image/upload/v1745143474/size_m_ytunzl.webp",
    audioUrl: "https://res.cloudinary.com/dcso0vsxw/video/upload/v1745143390/1-_Mr._Perfect-SenSongsMp3.Co_1_vdojf3.mp3",
    duration: 240,
    album: "Arya 2",
    year: 2009,
    genre: "Romantic",
    language: "telugu",
    sync: "happy"
  },
  {
    id: "My Love Is Gone",
    title: "My Love Is Gone",
    artist: "Araya 2",
    imageUrl: "https://res.cloudinary.com/dcso0vsxw/image/upload/v1745143474/arya-2-indian-movie-poster_jl3eqb.webp",
    audioUrl: "https://res.cloudinary.com/dcso0vsxw/video/upload/v1745143401/6-My_Love_Is_Gone-SenSongsMp3.Co_1_vqkwrz.mp3",
    duration: 289,
    album: "Chill Vibes",
    year: 2009,
    genre: "Break Vibes",
    language: "telugu",
    sync: "break"
  },
  //Ardhashathabdam
  {
    id: "ye Kannuulu Chudani Chitrame",
    title: "ye Kannuulu Chudani Chitrame",
    artist: "Ardhashathabdam",
    imageUrl: "https://res.cloudinary.com/dv83upinz/image/upload/v1746958145/Ardhashathabdam-Telugu-2021-20210325224654-500x500_b5ymiz.jpg",
    audioUrl: "https://res.cloudinary.com/dv83upinz/video/upload/v1746958235/Ye_Kannulu_Choodani_-_SenSongsMp3.Com_ggkghh.mp3",
    duration: 290,
    album: "Feel It",
    year: 2021,
    genre: "love",
    language: "telugu",
    sync: "love"
  },
  //Parugu
  {
  id: "Nammavemo",
  title: "Nammavemo",
  artist: "Parugu",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1764304751/Parugu-2008jpeg-300x300_tlxzja.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1764304782/Nammavemo-SenSongsMp3.Com_f5rm9u.mp3",
  duration: 288,
  album: "Nammavemo",
  year: 2025,
  genre: "."
},
{
  id: "Parugulu",
  title: "Parugulu",
  artist: "Parugu",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1764304751/Parugu-2008jpeg-300x300_tlxzja.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1764304773/Parugulu-SenSongsMp3.Com_1_uuuzzf.mp3",
  duration: 260,
  album: "Parugulu",
  year: 2025,
  genre: "."
},
  {
  id: " Yelageyalaga",
  title: " Yelageyalaga",
  artist: "Parugu",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1764304751/Parugu-2008jpeg-300x300_tlxzja.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1764304759/Yelageyalaga-SenSongsMp3.Com_v6vao0.mp3",
  duration: 262,
  album: " Yelageyalaga",
  year: 2025,
  genre: "."
},
  {
  id: "Hrudayam",
  title: "Hrudayam",
  artist: "Parugu",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1764304751/Parugu-2008jpeg-300x300_tlxzja.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1764304772/Hrudayam-SenSongsMp3.Com_wzi89d.mp3",
  duration: 228,
  album: "Hrudayam",
  year: 2025,
  genre: "."
},
  {
  id: "Manakanna Podiche",
  title: "Manakanna Podiche",
  artist: "Parugu",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1764304751/Parugu-2008jpeg-300x300_tlxzja.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1764304781/Manakanna_Podiche-SenSongsMp3.Com_i17gwc.mp3",
  duration: 280,
  album: "Manakanna Podiche",
  year: 2025,
  genre: "."
},
  {
  id: "Chal Chal",
  title: "Chal Chal",
  artist: "Parugu",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1764304751/Parugu-2008jpeg-300x300_tlxzja.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1764304788/Chal_Chal-SenSongsMp3.Com_fpjeao.mp3",
  duration: 277,
  album: "Chal Chal",
  year: 2025,
  genre: "."
},
  //Bommarillu
  {
  id: "Bommanu Geesthey",
  title: "Bommanu Geesthey",
  artist: "Bommarillu",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1764304650/Bommarillu-2006jpeg_kukod8.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1764304723/Bommanu_Geesthey-SenSongsMp3.Co_dr7mod.mp3",
  duration: 237,
  album: "Bommanu Geesthey",
  year: 2025,
  genre: "."
},
  {
  id: "We Have Romeo",
  title: "We Have Romeo",
  artist: "Bommarillu",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1764304650/Bommarillu-2006jpeg_kukod8.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1764304700/We_Have_Romeo-SenSongsMp3.Co_xixps4.mp3",
  duration: 235,
  album: "We Have Romeo",
  year: 2025,
  genre: "."
},{
  id: "Nammaka Tappani",
  title: "Nammaka Tappani",
  artist: "Bommarillu",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1764304650/Bommarillu-2006jpeg_kukod8.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1764304716/Nammaka_Tappani-SenSongsMp3.Co_wue3xa.mp3",
  duration: 275,
  album: "Nammaka Tappani",
  year: 2025,
  genre: "."
},
  {
  id: "Apudo Ipudo",
  title: "Apudo Ipudo",
  artist: "Bommarillu",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1764304650/Bommarillu-2006jpeg_kukod8.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1764304721/Apudo_Ipudo-SenSongsMp3.Co_ehnshm.mp3",
  duration: 243,
  album: "Apudo Ipudo",
  year: 2025,
  genre: "."
},
  {
  id: "Laalu Dharvaja",
  title: "Laalu Dharvaja",
  artist: "Bommarillu",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1764304650/Bommarillu-2006jpeg_kukod8.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1764304727/Laalu_Dharvaja-SenSongsMp3.Co_cxduuh.mp3",
  duration: 293,
  album: "Laalu Dharvaja",
  year: 2025,
  genre: "."
},
  {
  id: "Kaani Ippudu",
  title: "Kaani Ippudu",
  artist: "Bommarillu",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1764304650/Bommarillu-2006jpeg_kukod8.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1764304729/Kaani_Ippudu-SenSongsMp3.Co_ftb7vi.mp3",
  duration: 316,
  album: "Kaani Ippudu",
  year: 2025,
  genre: "."
},
//Malli Malli Idi Rani Roju
{
    id: "Varinche Prema",
    title: "Varinche Prema",
    artist: "Malli Malli Idi Rani Roju",
    imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752559936/Malli-Malli-Idi-Rani-Roju-2014jpeg_kfga1k.jpg",
    audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752559946/Varinche_Prema_avbppn.mp3",
    duration: 270,
    album: "Varinche Prema",
    year: 2025,
    genre: "Love",
    language: "telugu",
    sync: "break"
   },
{
  id: "add-007",
  title: "Yenno Yenno",
  artist: "Malli Malli Idi Rani Roju",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752559936/Malli-Malli-Idi-Rani-Roju-2014jpeg_kfga1k.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752559960/Yenno_Yenno_lgmgcj.mp3",
  duration: 270,
  album: "Yenno Yenno",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "romantic"
},
  {
  id: "add-008",
  title: "Marhaba",
  artist: "Malli Malli Idi Rani Roju",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752559936/Malli-Malli-Idi-Rani-Roju-2014jpeg_kfga1k.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752559950/Marhaba_koy9jr.mp3",
  duration: 280,
  album: "Marhaba",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "happy"
},
  {
  id: "add-009",
  title: "Choti Zindagi",
  artist: "Malli Malli Idi Rani Roju",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752559936/Malli-Malli-Idi-Rani-Roju-2014jpeg_kfga1k.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752559951/Choti_Jindagi_vb7eji.mp3",
  duration: 249,
  album: "Choti Zindagi",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "sad"
},
  {
  id: "add-010",
  title: "Gathama Gathama",
  artist: "Malli Malli Idi Rani Roju",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752559936/Malli-Malli-Idi-Rani-Roju-2014jpeg_kfga1k.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752559944/Gathama_Gathama_cuulno.mp3",
  duration: 178,
  album: "Gathama Gathama",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "dance"
},
//Animal
{
    id: "Evarevaro",
    title: "Evarevaro",
    artist: "Animal",
    imageUrl: "https://res.cloudinary.com/dkhbceri0/image/upload/v1748169667/Evarevaro-Soul-Version-From-ANIMAL-Telugu-2023-20231223151007-500x500_geciwj.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1748169847/ANIMAL__Evarevaro_Full_Video_-_Ranbir_K_Rashmika_Anil_K_Bobby_D_Sandeep_V_Vishal_M_Bhushan_K_qbszwc.mp3",
    duration: 248,
    album: "Evarevaro",
    year: 2025,
    genre: "feel",
    language: "telugu",
    sync: "sad"
  },
  {
    "id": "song190",
    "title": "Nanna Nuv Naa Pranam",
    "artist": "Animal",
    "imageUrl": "https://res.cloudinary.com/dkhbceri0/image/upload/v1748169643/Animal-2023_v47iqv.jpg",
    "audioUrl": "https://res.cloudinary.com/dkhbceri0/video/upload/v1748169862/Full_Video__Nanna_Nuv_Naa_Pranam_ANIMAL_Ranbir_K_Rashmika_Sonu_Nigam_AnanthaS_Sandeep_Reddy_V_qyk37k.mp3",
    "duration": 320,
    "album": "Nanna Nuv Naa Pranam",
    "year": 2025,
    "genre": "rap"
  },
  {
    "id": "song191",
    "title": "Ney Veyrey",
    "artist": "Animal",
    "imageUrl": "https://res.cloudinary.com/dkhbceri0/image/upload/v1748169643/Animal-2023_v47iqv.jpg",
    "audioUrl": "https://res.cloudinary.com/dkhbceri0/video/upload/v1748169832/ANIMAL_Telugu_Ney_Veyrey___Ranbir_Kapoor_Rashmika_M_Karthik_ShreyasP_AnanthaS_Sandeep_Reddy_V_z1dlqa.mp3",
    "duration": 272,
    "album": "Ney Veyrey",
    "year": 2025,
    "genre": "rap"
  },
{
    id: "Ammayi",
    title: "Ammayi",
    artist: "Animal",
    imageUrl: "https://res.cloudinary.com/dkhbceri0/image/upload/v1748169643/Animal-2023_v47iqv.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1748169827/ANIMAL__Ammayi_Full_Video_Ranbir_K_Rashmika_Raghav_Pritam_Anantha_Sandeep_Reddy_V_Bhushan_K_tritnc.mp3",
    duration: 275,
    album: "Ammayi",
    year: 2025,
    genre: "good",
    language: "telugu",
    sync: "folk"
  },
  {
    id: "song189",
    title: "Kashmeeru ANIMAL ",
    artist: "Animal",
    imageUrl: "https://res.cloudinary.com/dkhbceri0/image/upload/v1748169643/Animal-2023_v47iqv.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1748169862/Full_Video_Kashmeeru_ANIMAL_Ranbir_K_Rashmika_Sandeep_V_Shreya_G_Yazin_N_Bhushan_K_koo3di.mp3",
    duration: 217,
    album: "Kashmeeru ANIMAL ",
    year: 2025,
    genre: "rap"
  },
  //3(Moonu)
  {
    id: "Why This Kolaveri Di",
    title: "Why This Kolaveri Di",
    artist: "3(Moonu)",
    imageUrl: "https://res.cloudinary.com/dkhbceri0/image/upload/v1747320161/Why-This-Kolaveri-Di-The-Soup-of-Love--Tamil-2011-20200807101420-500x500_ljgqiq.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1747320074/iSongs.info_09_-_Why_This_Kolaveri_Di_zclg5f.mp3",
    duration: 260,
    album: "3(Moonu)",
    year: 2025,
    genre: "Mood",
    language: "telugu",
    sync: "sad"
  },
  {
    id: "Po Ve Po Remix",
    title: "Po Ve Po Remix",
    artist: "3(Moonu)",
    imageUrl: "https://res.cloudinary.com/dkhbceri0/image/upload/v1747320161/3-2012jpeg_tzy92o.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1747320073/iSongs.info_05_-_Po_Ve_Po_Remix_zkiumo.mp3",
    duration: 222,
    album: "3(Moomu)",
    year: 20225,
    genre: "Mood",
    language: "telugu",
    sync: "break"
  },
  {
    id: "A Life Full Of Love",
    title: "A Life Full Of Love",
    artist: "3(Moonu)",
    imageUrl: "https://res.cloudinary.com/dkhbceri0/image/upload/v1747320161/3-2012jpeg_tzy92o.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1747320094/iSongs.info_01_-_A_Life_Full_Of_Love_w9oog0.mp3",
    duration: 116,
    album: "3(Moonu)",
    year: 2025,
    genre: "Mood",
    language: "telugu",
    sync: "sad"
  },
  //8 Vasantal
  {
  id: "andhamaa-andhamaa",
  title: "Andhamaa Andhamaa",
  artist: "8 Vasantalu",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755941762/8-Vasantalu-2025-Parichayamila-250x250_cpn2x1.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1755941781/Andhamaa_Andhamaa_ytethq.mp3",
  duration: 276,
  album: "Andhamaa Andhamaa",
  year: 2025,
  genre: "Love it ",
  language: "telugu",
  sync: "Love"
},
  {
  id: "parichayamila",
  title: "Parichayamila",
  artist: "8 Vasantalu",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755941762/8-Vasantalu-2025-Parichayamila-250x250_cpn2x1.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1755941781/Parichayamila_iwhbd4.mp3",
  duration: 204,
  album: "Parichayamila",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "Feel"
},
//Amaran
{
    id: "Hey Rangule",
    title: "Hey Rangule",
    artist: "Amaran",
    imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1744980197/images_11_vi2n82.jpg",
    audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1744980264/Hey_Rangule_Telugu_KoshalWorld.Com_ppy5la.mp3",
    duration: 229,
    album: "Unexpected",
    year: 2024,
    genre: "Feel It",
    language:"telugu",
    sync: "love"
  },
  //Andala Rakshasi
  {
  id: "eYe Mantramo",
  title: "Ye Mantramo",
  artist: "Andala Rakshasi",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1757093128/Andala-Rakshasi-2012-250x250_nv5jct.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1757093144/iSongs.info_04_-_Ye_Mantramo_g1li9o.mp3",
  duration: 167,
  album: "Ye Mantramo",
  year: 2025,
  genre: "."
},
 {
    id: "Yemito",
    title: "Yemito",
    artist: "Andala Rakshasi",
    imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1743436807/Andala-Rakshasi-2012jpeg_sl2cx9.jpg",
    audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1743436814/Yemito_-_SenSongsmp3.Co_jk9o7m.mp3",
    duration: 250,
    album: "Andala Rakshasi",
    year: 2012,
    genre: "Melody",
    language: "telugu",
    sync: "love"
  },
  {
  id: "Vennante",
  title: "Vennante",
  artist: "Andala Rakshasi",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1757093128/Andala-Rakshasi-2012-250x250_nv5jct.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1757093145/iSongs.info_06_-_Vennante_kqv463.mp3",
  duration: 207,
  album: "Vennante",
  year: 2025,
  genre: "."
},
  {
  id: "Ne Ninnu Chera",
  title: "Ne Ninnu Chera",
  artist: "Andala Rakshasi",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1757093128/Andala-Rakshasi-2012-250x250_nv5jct.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1757093133/iSongs.info_03_-_Ne_Ninnu_Chera_isovdm.mp3",
  duration: 209,
  album: "Ne Ninnu Chera",
  year: 2025,
  genre: "."
},
  {
  id: "Manasa Marchipo",
  title: "Manasa Marchipo",
  artist: "Andala Rakshasi",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1757093128/Andala-Rakshasi-2012-250x250_nv5jct.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1757093147/iSongs.info_05_-_Manasa_Marchipo_gb0j3s.mp3",
  duration: 268,
  album: "Manasa Marchipo",
  year: 2025,
  genre: "."
},
  {
  id: "Manasu Palike",
  title: "Manasu Palike",
  artist: "Andala Rakshasi",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1757093128/Andala-Rakshasi-2012-250x250_nv5jct.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1757093143/iSongs.info_02_-_Manasu_Palike_mshtqp.mp3",
  duration: 228,
  album: "Manasu Palike",
  year: 2025,
  genre: "."
},
//A1 Express
{
    id: "Single Kingulam",
    title: "Single Kingulam",
    artist: "A1 Express",
    imageUrl: "https://res.cloudinary.com/dl8dmkhmv/image/upload/v1743870091/download_2_b76xdp.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1743866885/Single_Kingulam_-_SenSongsMp3.Com_1_qvvwsw.mp3",
    duration: 220,
    album: "A1 Express",
    year: 2021,
    genre: "Folk",
    language: "telugu",
    sync: "rap"
  },
  //Agent
  {
  id: "502f1361-bb38-487a-bdb2-224c58c27147",
  title: "Wild Saala",
  artist: "Agent",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755344677/images_6_em46gm.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1755344685/Wild_Saala_xpbucd.mp3",
  duration: 94,
  album: "Wild Saala",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "."
},
  {
  id: "3eeb3055-54fd-4651-9912-e37d2dcdd8f3",
  title: "Endhe Endhe",
  artist: "Agent",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755344677/images_6_em46gm.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1755344680/Endhe_Endhe_z0ofov.mp3",
  duration: 214,
  album: "Endhe Endhe",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "."
},
  {
  id: "1fec8165-32e2-4678-afd5-b3b88dcd4374",
  title: "Malli Malli",
  artist: "Agent",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755344677/images_6_em46gm.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1755344680/Malli_Malli_evhzvc.mp3",
  duration: 193,
  album: "Malli Malli",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "."
},
//A Aa
{
  id: "rang-de",
  title: "Rang De ",
  artist: "A Aa",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755940721/A-Aa-2016-250x250_m7p2yd.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1755940727/iSongs.info_02_-_Rang_De_rlq5px.mp3",
  duration: 241,
  album: "Rang De ",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "happy"
},
  {
  id: "anasuya-kosam",
  title: "Anasuya Kosam",
  artist: "A Aa",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755940721/A-Aa-2016-250x250_m7p2yd.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1755940735/iSongs.info_03_-_Anasuya_Kosam_qu2hdg.mp3",
  duration: 204,
  album: "Anasuya Kosam",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "."
},
  {
  id: "mummy-returns",
  title: "Mummy Returns",
  artist: "A Aa",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755940721/A-Aa-2016-250x250_m7p2yd.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1755940741/iSongs.info_04_-_Mummy_Returns_dpwxv2.mp3",
  duration: 173,
  album: "Mummy Returns",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "."
},
  {
  id: "yaa-yaa",
  title: "Yaa Yaa",
  artist: "A Aa",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1755940721/A-Aa-2016-250x250_m7p2yd.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1755940742/iSongs.info_01_-_Yaa_Yaa_ehpcyl.mp3",
  duration: 239,
  album: "Yaa Yaa",
  year: 2025,
  genre: ".",
  language: "telugu",
  sync: "."
},
//Remo
{
    id: "Kollagotte",
    title: "Kollagotte",
    artist: "Remo",
    imageUrl: "https://res.cloudinary.com/dkhbceri0/image/upload/v1747319908/Remo-Telugu-Original-Motion-Picture-Soundtrack--Telugu-2016-20210522202710-500x500_x32d8x.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1747319804/iSongs.info_02_-_Kollagotte_rxhaax.mp3",
    duration: 251,
    album: "Remo",
    year: 2025,
    genre: "Feel",
    language: "telugu",
    sync: "romantic"
  },
  {
     id: "song87",
     title: "Meesa Beauty",
     artist: "Remo",
     imageUrl: "https://res.cloudinary.com/dkhbceri0/image/upload/v1747319906/Remo-2016-Tamiljpeg_drsjdk.jpg",
     audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1747319777/iSongs.info_04_-_Meesa_Beauty_iq1es4.mp3",
     duration: 251,
     album: "Remo",
     year: 2025,
     genre: "Feel"
  },
  {
     id: "song=88",
     title: "Love Selfie",
     artist: "Remo",
     imageUrl: "https://res.cloudinary.com/dkhbceri0/image/upload/v1747319907/artworks-000198881612-cc7588-t500x500_nkzbpf.jpg",
     audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1747319837/iSongs.info_05_-_Love_Selfie_ffufoq.mp3",
     duration: 224,
     album: "Remo",
     year: 2025,
     genre: "Feel"
  },
  {
    "id": "song89",
    "title": "Come Closer",
    "artist": "Remo",
    "imageUrl": "https://res.cloudinary.com/dkhbceri0/image/upload/v1747319908/Remo-Telugu-Original-Motion-Picture-Soundtrack--Telugu-2016-20210522202710-500x500_x32d8x.jpg",
    "audioUrl": "https://res.cloudinary.com/dkhbceri0/video/upload/v1747319831/iSongs.info_06_-_Come_Closer_Katha_Kaadhey_Reprise_vioqhc.mp3",
    "duration": 206,
    "album": "Remo",
    "year": 2025,
    "genre": "Feel"
  },
  {
    "id": "song90",
    "title": "Remo Nee Styleki",
    "artist": "Remo",
    "imageUrl": "https://res.cloudinary.com/dkhbceri0/image/upload/v1747319906/Remo-2016-Tamiljpeg_drsjdk.jpg",
    "audioUrl": "https://res.cloudinary.com/dkhbceri0/video/upload/v1747319788/iSongs.info_01_-_Remo_Nee_Styleki_t0fxnz.mp3",
    "duration": 243,
    "album": "Remo",
    "year": 2025,
    "genre": "Feel"
  }

];
// Shuffle helper
function shuffle<T>(array: T[]): T[] {
  return [...array]
    .map(item => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(a => a.item);
}

// 🔥 One export only: popularSongs  
// Top-10 random + remaining songs automatically added below
export const popularSongs = (() => {
  const shuffled = shuffle(songs);
  const top10 = shuffled.slice(0, 10);
  const remaining = shuffled.slice(10);
  return [...top10, ...remaining]; // first top10 then remaining
})();
