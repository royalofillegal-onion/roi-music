export interface Song {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  audioUrl: string;
  duration: number; // in seconds
  album?: string;
  year?: number;
  genre?: string;
  language?: 'telugu' | 'hindi' | 'tamil' | 'kannada' | 'other';
  sync?: 'sad' | 'love' | 'happy' | 'devotional' | 'dance' | 'action' | 'romantic' | 'party' | 'classical' | 'folk';
}

import { enhanceSongData } from '@/utils/songEnhancer';

// Raw songs data without enhancement
const rawSongs: Omit<Song, 'language' | 'sync'>[] = [
   {
     id: "song17",
     title: "Adhento Gaani Vunnapaatuga",
     artist: "Jersey",
     imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1744979749/images_8_zglkpf.jpg",
     audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1744978242/Adhento_Gaani_Vunnapaatuga_-_Full_Video_JERSEY_Nani_Shraddha_Srinath_Anirudh_Ravichander_qyjfev.mp3",
     duration: 290,
     album: "Jersey",
     year: 2019,
     genre: "Emotional"
   },
   {
     id: "song37",
     title: "Thanu",
     artist: "HIT 3",
     imageUrl: "https://res.cloudinary.com/dv83upinz/image/upload/v1747215703/wirl2nhuerncbhixa6eh.jpg",
     audioUrl: "https://res.cloudinary.com/dv83upinz/video/upload/v1747215204/aihawlod7kzdhv10ho0m.mp3",
     duration: 248,
     album: "HIT3",
     year: 2025,
     genre: "Title Track"
   },
   {
     id: "song2",
     title: "Mooga Manasulu",
     artist: "Maahanati",
     imageUrl: "https://res.cloudinary.com/dv83upinz/image/upload/v1746957847/size_m_1524230645_o5xq9i.jpg",
     audioUrl: "https://res.cloudinary.com/dv83upinz/video/upload/v1746957845/Mooga_Manasulu_jozppu.mp3",
     duration: 254,
     album: "Feel It",
     year: 2018,
     genre: "Feel"
   },
  {
    id: "song3",
    title: "ye Kannuulu Chudani Chitrame",
    artist: "Ardhashathabdam",
    imageUrl: "https://res.cloudinary.com/dv83upinz/image/upload/v1746958145/Ardhashathabdam-Telugu-2021-20210325224654-500x500_b5ymiz.jpg",
    audioUrl: "https://res.cloudinary.com/dv83upinz/video/upload/v1746958235/Ye_Kannulu_Choodani_-_SenSongsMp3.Com_ggkghh.mp3",
    duration: 290,
    album: "Feel It",
    year: 2021,
    genre: "Feel"
  },
  {
    id: "song4",
    title: "Kanulu Chadire",
    artist: "WWW",
    imageUrl: "https://res.cloudinary.com/dv83upinz/image/upload/v1746958659/WWW-Telugu-2021-20210702222542-500x500_w7fomw.jpg",
    audioUrl: "https://res.cloudinary.com/dv83upinz/video/upload/v1746958682/Kannulu_Chedire_PenduJatt.Com.Se_nqrpt9.mp3",
    duration: 221,
    album: "Feel It",
    year: 2021,
    genre: "Feel"
  },
  {
    id: "song5",
    title: "Golden Sparrow",
    artist: "Jaabilamma Neeku Antha Kopama",
    imageUrl: "https://res.cloudinary.com/dkhbceri0/image/upload/v1747287102/images_16_rmhsqh.jpg",
    audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1744977693/iSongs.info_01_-_Golden_Sparrow_josxui.mp3",
    duration: 258,
    album: "Love",
    year: 2025,
    genre: "Love It"
  },
  {
    id: "song6",
    title: "Prema Velluva",
    artist: "HIT 3",
    imageUrl: "https://res.cloudinary.com/dl8dmkhmv/image/upload/v1743873184/download_10_mpnm7m.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1743866982/Prema_Velluva_ruakii.mp3",
    duration: 246,
    album: "Love",
    year: 2025,
    genre: "Feel It"
  },
  {
    id: "song7",
    title: "Premalo",
    artist: "Court",
    imageUrl: "https://res.cloudinary.com/dl8dmkhmv/image/upload/v1743872399/download_6_jpspgu.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1743866908/Premalo_ir0ohk.mp3",
    duration: 324,
    album: "New Beginnings",
    year: 2025,
    genre: "Love It"
  },
  {
    id: "song8",
    title: "Godari Gattu",
    artist: "Sankranthiki Vasthunam",
    imageUrl: "https://res.cloudinary.com/dl8dmkhmv/image/upload/v1743872530/download_7_fuc547.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1743866920/Godari_Gattu_vsw6tc.mp3",
    duration: 249,
    album: "Late Night",
    year: 2025,
    genre: "good"
  },
  {
    id: "song9",
    title: "Bujji Thalli",
    artist: "Thandel",
    imageUrl: "https://res.cloudinary.com/dl8dmkhmv/image/upload/v1743872765/download_8_vsrdmb.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1743866932/Bujji_Thalli_fmxl8l.mp3",
    duration: 248,
    album: "Sad",
    year: 2025,
    genre: "Love It"
  },
  {
    id: "song10",
    title: "Amaran",
    artist: "Hey Rangule",
    imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1744980197/images_11_vi2n82.jpg",
    audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1744980264/Hey_Rangule_Telugu_KoshalWorld.Com_ppy5la.mp3",
    duration: 229,
    album: "Unexpected",
    year: 2024,
    genre: "Feel It"
  },
  {
    id: "song11",
    title: "Kumkumala",
    artist: "brahmastra",
    imageUrl: "https://res.cloudinary.com/dl8dmkhmv/image/upload/v1743872244/images_5_lpvdam.jpg",
    audioUrl: "https://res.cloudinary.com/dl8dmkhmv/video/upload/v1743872224/Kumkumala_te5lqe.mp3",
    duration: 227,
    album: "Retrowave",
    year: 2023,
    genre: "Synthwave"
  },
  {
    id: "song12",
    title: "Choti Choti Baatein",
    artist: "maharshi",
    imageUrl: "https://res.cloudinary.com/dcso0vsxw/image/upload/v1745145201/size_m_1553829139_yvk9jo.webp",
    audioUrl: "https://res.cloudinary.com/dcso0vsxw/video/upload/v1745145076/Choti_Choti_Baatein_-_SenSongsMp3.Co_mfb1me.mp3",
    duration: 265,
    album: "Journeys",
    year: 2022,
    genre: "World"
  },
  {
    id: "song15",
    title: "Oh Pilla",
    artist: "Private",
    imageUrl: "https://res.cloudinary.com/dcso0vsxw/image/upload/v1743778065/6bec1d111e19dd7d6573f59f9200d0889e6256143f0f9dad4612f9cdcfe52cb5.0_o5osap.jpg",
    audioUrl: "https://res.cloudinary.com/dcso0vsxw/video/upload/v1743778038/Oh_Pilla_PenduJatt.Com.Se_gnrf5f.mp3",
    duration: 308,
    album: "Feel It",
    year: 2025,
    genre: "Love It"
  },
  {
    id: "song16",
    title: "Chandruloo Unde",
    artist: "Nuvvostanante Nenoddantana",
    imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1743418357/images_c9cebr.jpg",
    audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1743418367/04_-_Chandrullo_Unde_Kundelu_-_SenSongsMp3.co_w0qnnr.mp3",
    duration: 300,
    album: "Nuvvostanante Nenoddantana",
    year: 2005,
    genre: "Love"
  },
  {
    id: "song18",
    title: "Bala Tripuramani",
    artist: "Bramhostavam",
    imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1744979888/images_9_am84ql.jpg",
    audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1744979872/Bala_Tripuramani_SenSongsMp3.Com_sxos35.mp3",
    duration: 240,
    album: "Brahmotsavam",
    year: 2016,
    genre: "Devotional"
  },
  {
    id: "song19",
    title: "Uppenantha",
    artist: "Arya 2",
    imageUrl: "https://res.cloudinary.com/dcso0vsxw/image/upload/v1745143475/5b3c1a4a17f0986815b689ff90fcc0a8_f5l8en.jpg",
    audioUrl: "https://res.cloudinary.com/dcso0vsxw/video/upload/v1745143413/2-Uppenantha-SenSongsMp3.Co_1_la1ohs.mp3",
    duration: 272,
    album: "Arya 2",
    year: 2009,
    genre: "Romantic"
  },
  {
    id: "song20",
    title: "Yedurangula Vaana",
    artist: "18 Pages",
    imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1743417356/16712135423689_h4r5p5.jpg",
    audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1743416935/Yedurangula_Vaana_128_Kbps_f9ppps.mp3",
    duration: 265,
    album: "18 Pages",
    year: 2022,
    genre: "Love"
  },
  {
    id: "song21",
    title: "Yemito",
    artist: "Andala Rakshasi",
    imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1743436807/Andala-Rakshasi-2012jpeg_sl2cx9.jpg",
    audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1743436814/Yemito_-_SenSongsmp3.Co_jk9o7m.mp3",
    duration: 250,
    album: "Andala Rakshasi",
    year: 2012,
    genre: "Melody"
  },
  {
    id: "song22",
    title: "Kumkumala",
    artist: "Brahmastra",
    imageUrl: "https://res.cloudinary.com/dl8dmkhmv/image/upload/v1743872244/images_5_lpvdam.jpg",
    audioUrl: "https://res.cloudinary.com/dl8dmkhmv/video/upload/v1743872224/Kumkumala_te5lqe.mp3",
    duration: 275,
    album: "Brahmastra",
    year: 2022,
    genre: "Fantasy"
  },
  {
    id: "song23",
    title: "Hilesso Hilessa",
    artist: "Thandel",
    imageUrl: "https://res.cloudinary.com/dl8dmkhmv/image/upload/v1743872764/download_9_xq9sm5.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1743866911/Hilesso_Hilessa_rxtdxm.mp3",
    duration: 260,
    album: "Thandel",
    year: 2024,
    genre: "Folk"
  },
  {
    id: "song24",
    title: "Choosi Chudangane",
    artist: "Chalo",
    imageUrl: "https://res.cloudinary.com/dl8dmkhmv/image/upload/v1743872062/images_4_h05wcd.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1743866906/Choosi_Chudangane_-_SenSongsMp3.Co_jtc0t4.mp3",
    duration: 245,
    album: "Chalo",
    year: 2018,
    genre: "Romantic"
  },
  {
    id: "song25",
    title: "inkem inkem inkem kaavaale",
    artist: "Geetha Govindam",
    imageUrl: "https://res.cloudinary.com/dkhbceri0/image/upload/v1743738733/size_m_1531202221_vcuqna.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1743591099/Inkem_Inkem_Inkem_Kaavaale_3D_-_SenSongsMp3.Co_jfxqn5.mp3",
    duration: 310,
    album: "Geetha Govindam",
    year: 2018,
    genre: "Romantic"
  },
  {
    id: "song26",
    title: "Mr Perfect",
    artist: "Arya 2",
    imageUrl: "https://res.cloudinary.com/dcso0vsxw/image/upload/v1745143474/size_m_ytunzl.webp",
    audioUrl: "https://res.cloudinary.com/dcso0vsxw/video/upload/v1745143390/1-_Mr._Perfect-SenSongsMp3.Co_1_vdojf3.mp3",
    duration: 240,
    album: "Arya 2",
    year: 2009,
    genre: "Romantic"
  },
  {
    id: "song27",
    title: "Salaam Rocky Bhai",
    artist: "KGF 1",
    imageUrl: "https://res.cloudinary.com/dcso0vsxw/image/upload/v1745142115/KGF-2-Jpeg_yfnllu.jpg",
    audioUrl: "https://res.cloudinary.com/dcso0vsxw/video/upload/v1745136985/Salaam_Rocky_Bhai_-_SenSongsMp3.Co_wrhsr6.mp3",
    duration: 270,
    album: "KGF Chapter 1",
    year: 2018,
    genre: "Mass"
  },
  {
    id: "song28",
    title: "Ticket Eh Konakunda",
    artist: "Dj Tillu 2",
    imageUrl: "https://res.cloudinary.com/dl8dmkhmv/image/upload/v1743870405/images_1_h6vhmu.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1743867094/Ticket_Eh_Konakunda_cpxfbo.mp3",
    duration: 230,
    album: "DJ Tillu 2",
    year: 2024,
    genre: "Party"
  },
  {
    id: "song29",
    title: "Meenu",
    artist: "Sankaranthiki Vasthunam",
    imageUrl: "https://res.cloudinary.com/dv83upinz/image/upload/v1744595432/Meenu-From-Sankranthiki-Vasthunam-Telugu-2024-20241218211003-500x500_dkvieg.jpg",
    audioUrl: "https://res.cloudinary.com/dv83upinz/video/upload/v1744595315/Meenu_1_wrtnpe.mp3",
    duration: 245,
    album: "Sankaranthiki Vasthunam",
    year: 2024,
    genre: "Melody"
  },
  {
    id: "song30",
    title: "Single Kingulam",
    artist: "A1 Express",
    imageUrl: "https://res.cloudinary.com/dl8dmkhmv/image/upload/v1743870091/download_2_b76xdp.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1743866885/Single_Kingulam_-_SenSongsMp3.Com_1_qvvwsw.mp3",
    duration: 220,
    album: "A1 Express",
    year: 2021,
    genre: "Folk"
  },
  {
    id: "song31",
    title: "Dheera Dheera",
    artist: "KGF 1",
    imageUrl: "https://res.cloudinary.com/dcso0vsxw/image/upload/v1745142299/IMG_20250420_151440_imuefn.jpg",
    audioUrl: "https://res.cloudinary.com/dcso0vsxw/video/upload/v1745136994/Dheera_Dheera_-_SenSongsMp3.Co_bgwgxe.mp3",
    duration: 300,
    album: "KGF Chapter 1",
    year: 2018,
    genre: "Mass"
  },
  {
    id: "song32",
    title: "Radhika",
    artist: "Dj Tillu 2",
    imageUrl: "https://res.cloudinary.com/dl8dmkhmv/image/upload/v1743870922/images_2_i0ol8j.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1743867082/Radhika_my4jpd.mp3",
    duration: 215,
    album: "DJ Tillu 2",
    year: 2024,
    genre: "Love"
  },
  {
    id: "song33",
    title: "Paala Pitta",
    artist: "Maharshi",
    imageUrl: "https://res.cloudinary.com/dcso0vsxw/image/upload/v1745145200/size_m_1556507026_bntvkc.webp",
    audioUrl: "https://res.cloudinary.com/dcso0vsxw/video/upload/v1745145096/Paala_Pitta_-_SenSongsMp3.Co_geh9mf.mp3",
    duration: 250,
    album: "Maharshi",
    year: 2019,
    genre: "Folk"
  },
  {
    id: "song34",
    title: "Bujjikanna",
    artist: "Love Today",
    imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1743417531/16712506771622_pzuipy.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1743867065/Bujjikanna_128_Kbps_wj0lmh.mp3",
    duration: 235,
    album: "Love Today",
    year: 2022,
    genre: "Romantic"
  },
  {
    id: "song35",
    title: "Lucky Bhaskar (Title song)",
    artist: "Lucky Bhaskar",
    imageUrl: "https://res.cloudinary.com/dl8dmkhmv/image/upload/v1743869643/download_qyluvw.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1743866865/Lucky_Baskhar_cgx23b.mp3",
    duration: 210,
    album: "Lucky Bhaskar",
    year: 2025,
    genre: "Title Track"
  },
  {
    id: "song36",
    title: "Poratame",
    artist: "HIT 3",
    imageUrl: "https://res.cloudinary.com/dv83upinz/image/upload/v1747215703/kvn462gfwx8lvawud2av.jpg",
    audioUrl: "https://res.cloudinary.com/dv83upinz/video/upload/v1747215195/nipx5wfejlujborhdaiz.mp3",
    duration: 175,
    album: "HIT3",
    year: 2025,
    genre: "Title Track"
  },
  {
    id: "song38",
    title: "Abir Baar Arjun Sarkaar",
    artist: "HIT 3",
    imageUrl: "https://res.cloudinary.com/dv83upinz/image/upload/v1747215702/kwf7xgl4gc6scemiv1ek.jpg",
    audioUrl: "https://res.cloudinary.com/dv83upinz/video/upload/v1747215203/nskl9xhd7co547ea4sdr.mp3",
    duration: 240,
    album: "HIT3",
    year: 2025,
    genre: "Title Track"
  },
  {
    id: "song39",
    title: "Sooreede",
    artist: "Salaar",
    imageUrl: "https://res.cloudinary.com/dkhbceri0/image/upload/v1743730098/Sooreede-From-Salaar-Cease-Fire-Telugu-Telugu-2023-20241107224711-500x500_lyoqqv.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1743591104/iSongs.info_03_-_Sooreede_e83d7n.mp3",
    duration: 198,
    album: "Salaar",
    year: 2025,
    genre: "Title Track"
  },
  {
    id: "song40",
    title: "The Range of Daaku",
    artist: "Daaku Maharaj",
    imageUrl: "https://res.cloudinary.com/dv83upinz/image/upload/v1744595191/MV5BMzJhNDJkODUtNDU4ZC00ZjBhLWI0NDItZGJmNDNmYTllNDI2XkEyXkFqcGc_._V1__xjfe3s.jpg",
    audioUrl: "https://res.cloudinary.com/dv83upinz/video/upload/v1744595016/The_Rage_of_Daaku_tyw9xi.mp3",
    duration: 258,
    album: "Daaku Maharaj",
    year: 2025,
    genre: "Title Track"
  },
  {
    id: "song41",
    title: "Dabidi Dibidi",
    artist: "Daaku Maharaj",
    imageUrl: "https://res.cloudinary.com/dv83upinz/image/upload/v1744595188/Daaku-Maharaaj-Telugu-2024-20250103122655-500x500_vaipkp.jpg",
    audioUrl: "https://res.cloudinary.com/dv83upinz/video/upload/v1744595011/Dabidi_Dibidi_khmna9.mp3",
    duration: 262,
    album: "Daaku Maharaj",
    year: 2025,
    genre: "Title Track"
  },
  {
    id: "song42",
    title: "Padara Padara",
    artist: "Maharshi",
    imageUrl: "https://res.cloudinary.com/dcso0vsxw/image/upload/v1745145201/size_m_1556103610_z7eenm.webp",
    audioUrl: "https://res.cloudinary.com/dcso0vsxw/video/upload/v1745145101/Padara_Padara_-_SenSongsMp3.Co_g7o8uh.mp3",
    album: "Maharshi",
    duration: 291,
    year: 2025,
    genre: "Title Track"
  },
  {
    id: "song43",
    title: "Konda Devara",
    artist: "GAME CHANGER",
    imageUrl: "https://res.cloudinary.com/dv83upinz/image/upload/v1744594795/dam_tu_dikhaja_hindi_ott_1440_1727676854_y5frwg.jpg",
    audioUrl: "https://res.cloudinary.com/dv83upinz/video/upload/v1744594641/Konda_Devara_bvvonc.mp3",
    album: "GAME CHANGER",
    duration: 166,
    year: 2025,
    genre: "Title Track"
  },
  {
    id: "song44",
    title: "Dhop",
    artist: "GAME CHANGER",
    imageUrl: "https://res.cloudinary.com/dv83upinz/image/upload/v1744594795/dam_tu_dikhaja_hindi_ott_1440_1727676854_y5frwg.jpg",
    audioUrl: "https://res.cloudinary.com/dv83upinz/video/upload/v1744594665/Dhop_snuo2i.mp3",
    album: "GAME CHANGER",
    duration: 288,
    year: 2025,
    genre: "Title Track"
  },
   {
    id: "song45",
    title: "Jaragandi",
    artist: "GAME CHANGER",
    imageUrl: "https://res.cloudinary.com/dv83upinz/image/upload/v1744594794/game_changer_hin_jaragandi_ott-new_1440_1711480488_tycljn.jpg",
    audioUrl: "https://res.cloudinary.com/dv83upinz/video/upload/v1744594642/Jaragandi_psnpcm.mp3",
    album: "GAME CHANGER",
    duration: 246,
    year: 2025,
    genre: "Title Track"
  },
  {
    id: "song46",
    title: "Unpredictable",
    artist: "GAME CHANGER",
    imageUrl: "https://res.cloudinary.com/dv83upinz/image/upload/v1744594795/Game-Changer-2025-Unpredictable_zri2lf.jpg",
    audioUrl: "https://res.cloudinary.com/dv83upinz/video/upload/v1744594646/Unpredictable_q7fivp.mp3",
    album: "GAME CHANGER",
    duration: 171,
    year: 2025,
    genre: "Title Track"
  },
  {
    id: "song47",
    title: "Pilla Padesaave",
    artist: "Love Today",
    imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1743417446/16697883393741_kwtjqx.jpg",
    audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1743417450/Pilla_Padesaave_128_Kbps_chpf6p.mp3",
    album: "Love Today",
    duration: 171,
    year: 2025,
    genre: "Title Track"
  },
  {
    id: "song48",
    title: "Pranam pothunna",
    artist: "Love Today",
    imageUrl: "https://res.cloudinary.com/dkhbceri0/image/upload/v1747286451/Love-Today-2022_xdvygz.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1747286336/iSongs.info_02_-_Pranam_Pothunna_zksvla.mp3",
    album: "Love Today",
    duration: 231,
    year: 2025,
    genre: "Title Track"
  },
  {
    id: "song49",
    title: "Pranam pothunna",
    artist: "Love Today",
    imageUrl: "https://res.cloudinary.com/dkhbceri0/image/upload/v1747286451/Love-Today-Tamil-2022-20221107113815-500x500_ixviu2.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1747287658/iSongs.info_02_-_Pillaa_nwhbhd.mp3",
    album: "Love Today",
    duration: 210,
    year: 2025,
    genre: "Title Track"
  },
  {
    id: "song50",
    title: "Pilla",
    artist: "Jaabilamma Neeku Antha Kopama",
    imageUrl: "https://res.cloudinary.com/dkhbceri0/image/upload/v1747287103/download_12_bfoxqe.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1747286292/iSongs.info_03_-_Bangu_Aaku_Thechi_r8iq9p.mp3",
    album: "Jaabilamma Neeku Antha Kopama",
    duration: 186,
    year: 2025,
    genre: "Title Track"
  },
  {
    id: "song51",
    title: "Prema Failai Poyera",
    artist: "Jaabilamma Neeku Antha Kopama",
    imageUrl: "https://res.cloudinary.com/dkhbceri0/image/upload/v1747287102/download_14_oqftyq.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1747287706/iSongs.info_03_-_Prema_Failai_Poyera_tgm5tb.mp3",
    album: "Jaabilamma Neeku Antha Kopama",
    duration: 235,
    year: 2025,
    genre: "Title Track"
  },
  {
    id: "song52",
    title: "Yedhee",
    artist: "Jaabilamma Neeku Antha Kopama",
    imageUrl: "https://res.cloudinary.com/dkhbceri0/image/upload/v1747287103/download_11_gaceov.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1747287715/iSongs.info_04_-_Yedhee_oiryi5.mp3",
    album: "Jaabilamma Neeku Antha Kopama",
    duration: 202,
    year: 2025,
    genre: "Title Track"
  },
  {
    id: "song53",
    title: "Naa Praanam",
    artist: "Jaabilamma Neeku Antha Kopama",
    imageUrl: "https://res.cloudinary.com/dkhbceri0/image/upload/v1747287103/download_13_nk1osp.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1747287620/iSongs.info_05_-_Naa_Praanam_xlsjrb.mp3",
    album: "Jaabilamma Neeku Antha Kopama",
    duration: 138,
    year: 2025,
    genre: "Title Track"
  },
  {
    id: "song54",
    title: "Yettu Poya",
    artist: "Jaabilamma Neeku Antha Kopama",
    imageUrl: "https://res.cloudinary.com/dkhbceri0/image/upload/v1747287103/download_15_an3dds.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1747287691/iSongs.info_07_-_Yettu_Poya_nizhhc.mp3",
    album: "Jaabilamma Neeku Antha Kopama",
    duration: 200,
    year: 2025,
    genre: "Title Track"
  },
  {
    id: "song55",
    title: "Nee Manasu Naa Manasu",
    artist: "Jaabilamma Neeku Antha Kopama",
    imageUrl: "https://res.cloudinary.com/dkhbceri0/image/upload/v1747287103/download_15_an3dds.jpg",
    audioUrl: "https://res.cloudinary.com/dkhbceri0/video/upload/v1747287741/iSongs.info_06_-_Nee_Manusu_Naan_Manusu_r6vi44.mp3",
    album: "Jaabilamma Neeku Antha Kopama",
    duration: 210,
    year: 2025,
    genre: "Title Track"
  },
  {
    id: "song1",
    title: "My Love Is Gone",
    artist: "Araya 2",
    imageUrl: "https://res.cloudinary.com/dcso0vsxw/image/upload/v1745143474/arya-2-indian-movie-poster_jl3eqb.webp",
    audioUrl: "https://res.cloudinary.com/dcso0vsxw/video/upload/v1745143401/6-My_Love_Is_Gone-SenSongsMp3.Co_1_vqkwrz.mp3",
    duration: 289,
    album: "Chill Vibes",
    year: 2009,
    genre: "Break Vibes"
  }
];

// Enhance all songs with language and sync properties
export const songs: Song[] = rawSongs.map(song => enhanceSongData(song as Song));

export const popularSongs = [songs[22], songs[114], songs[33], songs[165], songs[137], songs[84], songs[124], songs[50], songs[94], songs[1], songs[109], songs[86], songs[40], songs[53], songs[2], songs[60], songs[102], songs[91], songs[57], songs[21], songs[120], songs[144], songs[58], songs[148], songs[23], songs[47], songs[44], songs[36], songs[126], songs[7], songs[142], songs[122], songs[137], songs[56], songs[106], songs[93], songs[77], songs[10], songs[41], songs[130], songs[103], songs[38], songs[48], songs[4], songs[69], songs[129], songs[134], songs[75], songs[46], songs[132], songs[19], songs[152], songs[127], songs[78], songs[103]];
export const newReleases = [songs[66], songs[20], songs[43], songs[54], songs[67], songs[119], songs[42], songs[36], songs[10], songs[0], songs[107], songs[156], songs[85], songs[145], songs[104], songs[140], songs[105], songs[11], songs[28], songs[151], songs[99], songs[52], songs[31], songs[80], songs[3], songs[121], songs[95], songs[8], songs[121], songs[128], songs[139], songs[67], songs[32], songs[96], songs[110], songs[34], songs[6], songs[30], songs[76], songs[70], songs[98], songs[64], songs[141], songs[62], songs[60], songs[16], songs[27], songs[35], songs[33], songs[138], songs[51], songs[19], songs[89], songs[106], songs[82]];
