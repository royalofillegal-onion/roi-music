
export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  imageUrl: string;
  audioUrl: string;
  duration: number;
  year?: number;
}

export const additionalSongs: Song[] = [
  {
  id: "add-001",
  title: "Aaradugula Bullettu",
  artist: " Atharintiki Dharedhi",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752559913/19._Attarintiki_Daredi_ACD_jstwrc.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752559822/Aaradugula_Bullettu.Co_g908es.mp3",
  duration: 287,
  album: "Aaradugula Bullettu",
  year: 2025,
  genre: "."
},
  {
  id: "aa-002",
  title: "Ninnu Chudagane",
  artist: " Atharintiki Dharedhi",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752559913/19._Attarintiki_Daredi_ACD_jstwrc.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752559812/Ninnu_Chudaganne_tuxza2.mp3",
  duration: 333,
  album: "Ninnu Chudagane",
  year: 2025,
  genre: "."
},
  {
  id: "add-003",
  title: "Bapu Gari Bommo",
  artist: " Atharintiki Dharedhi",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752559913/19._Attarintiki_Daredi_ACD_jstwrc.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752559811/Bapu_Gari_Bommo_p8adex.mp3",
  duration: 282,
  album: "Bapu Gari Bommo",
  year: 2025,
  genre: "."
},
  {
  id: "add-004",
  title: "Time To Party",
  artist: " Atharintiki Dharedhi",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752559913/19._Attarintiki_Daredi_ACD_jstwrc.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752559811/Time_To_Party_e96vti.mp3",
  duration: 269,
  album: "Time To Party",
  year: 2025,
  genre: "."
},
  {
  id: "add-004",
  title: "Kirraaku",
  artist: " Atharintiki Dharedhi",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752559913/19._Attarintiki_Daredi_ACD_jstwrc.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752559810/Kirraaku_eh5dop.mp3",
  duration: 237,
  album: "Kirraaku",
  year: 2025,
  genre: "."
},
  {
  id: "add-005",
  title: "Deva Devam",
  artist: " Atharintiki Dharedhi",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752559913/19._Attarintiki_Daredi_ACD_jstwrc.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752559802/Deva_Devam_p5vavs.mp3",
  duration: 287,
  album: "Deva Devam",
  year: 2025,
  genre: "."
},
  {
  id: "add-006",
  title: "Katamarayuda",
  artist: " Atharintiki Dharedhi",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752559913/19._Attarintiki_Daredi_ACD_jstwrc.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752559801/Katamarayuda_zcuo6d.mp3",
  duration: 65,
  album: "Katamarayuda",
  year: 2025,
  genre: "."
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
  genre: "."
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
  genre: "."
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
  genre: "."
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
  genre: "."
},
  {
  id: "add-011",
  title: "Varinche Prema",
  artist: "Malli Malli Idi Rani Roju",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752559936/Malli-Malli-Idi-Rani-Roju-2014jpeg_kfga1k.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752559946/Varinche_Prema_avbppn.mp3",
  duration: 270,
  album: "Varinche Prema",
  year: 2025,
  genre: "."
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
  genre: "."
},
  {
  id: "add-013",
  title: "Poyiraa Mama",
  artist: "Kubera",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628146/Kubera-Telugu-2024-20241117001625-500x500_wufd8d.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628199/Poyiraa_Mama_evltpn.mp3",
  duration: 263,
  album: "Poyiraa Mama",
  year: 2025,
  genre: "."
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
  genre: "."
},
  {
  id: "add-015",
  title: "Pippi Pippi Dum Dum",
  artist: "Kubera",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628146/Kubera-Telugu-2024-20241117001625-500x500_wufd8d.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628194/Naa_Koduka_d5ocut.mp3",
  duration: 227,
  album: "Pippi Pippi Dum Dum",
  year: 2025,
  genre: "."
},
  {
  id: "add-016",
  title: "kannappa Theme",
  artist: "kannappa",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628225/Kannappa-Theme-From-Kannappa-Telugu-2025-20250221191004-500x500_o4ajst.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628344/kannappa_Theme_wscvs4.mp3",
  duration: 68,
  album: "kannappa Theme",
  year: 2025,
  genre: "."
},
  {
  id: "add-017",
  title: "Alapana",
  artist: "kannappa",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628225/Kannappa-Theme-From-Kannappa-Telugu-2025-20250221191004-500x500_o4ajst.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628344/Alapana_sxwlxr.mp3",
  duration: 87,
  album: "Alapana",
  year: 2025,
  genre: "."
},
  {
  id: "add-018",
  title: "kannappa Theme",
  artist: "kannappa",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628225/Kannappa-Theme-From-Kannappa-Telugu-2025-20250221191004-500x500_o4ajst.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628351/Kannappa_Theme_Music_2_koeweq.mp3",
  duration: 89,
  album: "kannappa Theme",
  year: 2025,
  genre: "."
},
  {
  id: "add-019",
  title: "Aadu Macha",
  artist: "kannappa",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628225/Kannappa-Theme-From-Kannappa-Telugu-2025-20250221191004-500x500_o4ajst.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628366/Aadu_Macha_vonfgo.mp3",
  duration: 211,
  album: "Aadu Macha",
  year: 2025,
  genre: "."
},
  {
  id: "add-020",
  title: "Om Namah Shivaya",
  artist: "kannappa",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628225/Kannappa-Theme-From-Kannappa-Telugu-2025-20250221191004-500x500_o4ajst.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628370/Om_Namah_Shivaya_vfliod.mp3",
  duration: 145,
  album: "Om NamahS hivaya",
  year: 2025,
  genre: "."
},
  {
  id: "add-021",
  title: "Sri Kala Hasti",
  artist: "kannappa",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628226/Sri-Kala-Hasti-From-Kannappa-Malayalam-Malayalam-2025-20250528131018-500x500_jhmjjb.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628383/Sri_Kala_Hasti_nvsees.mp3",
  duration: 345,
  album: "Sri Kala Hasti",
  year: 2025,
  genre: "."
},
  {
  id: "add-022",
  title: "kannapa Love Song",
  artist: "kannappa",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628225/Kannappa-Theme-From-Kannappa-Telugu-2025-20250221191004-500x500_o4ajst.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628344/kannappa_Theme_wscvs4.mp3",
  duration: 254,
  album: "kannapa Love Song ",
  year: 2025,
  genre: "."
},
  {
  id: "add-023",
  title: "Akasha Veedhilo",
  artist: "kannappa",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628225/Kannappa-Theme-From-Kannappa-Telugu-2025-20250221191004-500x500_o4ajst.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628396/Akasha_Veedhilo_x7pki0.mp3",
  duration: 319,
  album: "Akasha Veedhilo",
  year: 2025,
  genre: "."
},
  {
  id: "add-024",
  title: "Shiva Shiva Shankaraa",
  artist: "kannappa",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628225/size_m_1_x5ehao.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628396/Shiva_Shiva_Shankaraa_freasy.mp3",
  duration: 342,
  album: "Shiva Shiva Shankaraa",
  year: 2025,
  genre: "."
},
  {
  id: "add-025",
  title: "Eagles On His Way",
  artist: "Eagle",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628438/size_m_1731401609_we3mmj.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628503/Eagles_On_His_Way_uzqwzy.mp3",
  duration: 169,
  album: "Eagles On His Way",
  year: 2025,
  genre: "."
},
  {
  id: "add-026",
  title: "Garudam",
  artist: "Eagle",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628438/Eagle-Telugu-2024-20241112134618-500x500_s2lxoi.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628508/Garudam_goo9a6.mp3",
  duration: 208,
  album: "Garudam",
  year: 2025,
  genre: "."
},
  {
  id: "add-027",
  title: "Gallanthe",
  artist: "Eagle",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628438/Eagle-Naa-Songs-2024-Ravi-Teja_fgdwdc.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628508/Gallanthe_aaswd7.mp3",
  duration: 224,
  album: "Gallanthe",
  year: 2025,
  genre: "."
},
  {
  id: "add-028",
  title: "Hey Garuda",
  artist: "Eagle",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628439/Eagle-2023_tyzwps.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628508/Hey_Garuda_jswtpv.mp3",
  duration: 158,
  album: "Hey Garuda",
  year: 2025,
  genre: "."
},
  {
  id: "add-029",
  title: "Kalyani Vaccha Vacchaa",
  artist: "Family Star",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628548/Kalyani-Tera-Hoon-Main-From-The-Family-Star-Hindi-2024-20240326171016-500x500_rglf4y.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628656/Kalyani_Vaccha_Vacchaa_mmnah8.mp3",
  duration: 201,
  album: "Kalyani Vaccha Vacchaa",
  year: 2025,
  genre: "."
},
  {
  id: "add-030",
  title: "Madhuramu Kadha",
  artist: "Family Star",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628588/Madhuramu-Kadha-From-The-Family-Star-Telugu-2024-20240325231002-500x500_zmmuhg.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628656/Madhuramu_Kadha_skebq0.mp3",
  duration: 254,
  album: "Madhuramu Kadha",
  year: 2025,
  genre: "."
},
  {
  id: "add-031",
  title: "Nandanandanaa",
  artist: "Family Star",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628548/Kalyani-Tera-Hoon-Main-From-The-Family-Star-Hindi-2024-20240326171016-500x500_rglf4y.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628659/Nandanandanaa_clvjp8.mp3",
  duration: 296,
  album: "Nandanandanaa",
  year: 2025,
  genre: "."
},
  {
  id: "add-032",
  title: "Dekhore Dekho",
  artist: "Family Star",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628548/Kalyani-Tera-Hoon-Main-From-The-Family-Star-Hindi-2024-20240326171016-500x500_rglf4y.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628662/Dekhore_Dekho_iwgzt5.mp3",
  duration: 200,
  album: "Dekhore Dekho",
  year: 2025,
  genre: "."
},
  {
  id: "add-033",
  title: "Suttamla Soosi",
  artist: "Gangs of Godavari",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628685/2de09070c22bd02bb93db2d1e86fe67e_xz6khx.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628757/Suttamla_Soosi_nxj0gj.mp3",
  duration: 228,
  album: "Suttamla Soosi",
  year: 2025,
  genre: "."
},
  {
  id: "add-034",
  title: "Motha",
  artist: "Gangs of Godavari",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628687/Gangsofgdavari_vuoa8a.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628754/Motha_fikhtk.mp3",
  duration: 234,
  album: "Motha",
  year: 2025,
  genre: "."
},
  {
  id: "add-035",
  title: "Not A Teaser",
  artist: "Saripodha Sanivaram",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628785/Saripodhaa-Sanivaaram-Original-Motion-Picture-Soundtrack-Telugu-2024-20240828160005-500x500_x3ldmy.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628831/Not_A_Teaser_hrepxi.mp3",
  duration: 79,
  album: "Not A Teaser",
  year: 2025,
  genre: "."
},
  {
  id: "add-036",
  title: "Shiva Thandavame",
  artist: "Saripodha Sanivaram",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628785/Saripodhaa-Sanivaaram-Original-Motion-Picture-Soundtrack-Telugu-2024-20240828160005-500x500_x3ldmy.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628832/Shiva_Thandavame_alv8ms.mp3",
  duration: 188,
  album: "Shiva Thandavame",
  year: 2025,
  genre: "."
},
  {
  id: "add-037",
  title: "Bhaga Bhaga",
  artist: "Saripodha Sanivaram",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628785/Saripodhaa-Sanivaaram-Original-Motion-Picture-Soundtrack-Telugu-2024-20240828160005-500x500_x3ldmy.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752628834/Bhaga_Bhaga_apta9g.mp3",
  duration: 176,
  album: "Bhaga Bhaga",
  year: 2025,
  genre: "."
},
  {
  id: "add-038",
  title: "Samavarthi",
  artist: "Saripodha Sanivaram",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628786/Samavarthi-From-Saripodhaa-Sanivaaram-Telugu-2024-20240226152958-500x500_vhlmd8.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752629410/Samavarthi_v5vvga.mp3",
  duration: 84,
  album: "Samavarthi",
  year: 2025,
  genre: "."
},
  {
  id: "add-039",
  title: "Laalijo Raagam",
  artist: "Saripodha Sanivaram",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628786/Saripodha-Sanivaaram-Naa-Songs-Download_beefii.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752629417/Laalijo_Raagam_wuz2ne.mp3",
  duration: 254,
  album: "Laalijo Raagam",
  year: 2025,
  genre: "."
},
  {
  id: "add-040",
  title: "Unchained",
  artist: "Saripodha Sanivaram",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628786/Samavarthi-From-Saripodhaa-Sanivaaram-Telugu-2024-20240226152958-500x500_vhlmd8.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752629417/Unchained_wkmggl.mp3",
  duration: 166,
  album: "Unchained",
  year: 2025,
  genre: "."
},
  {
  id: "add-041",
  title: "Malupero",
  artist: "Saripodha Sanivaram",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628786/Saripodha-Sanivaaram-Naa-Songs-Download_beefii.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752629422/Malupero_dobxyl.mp3",
  duration: 281,
  album: "Malupero",
  year: 2025,
  genre: "."
},
  {
  id: "add-042",
  title: "Veta Vinodham",
  artist: "Saripodha Sanivaram",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628786/Saripodha-Sanivaaram-Naa-Songs-Download_beefii.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752629427/Veta_Vinodham_ogxqdg.mp3",
  duration: 166,
  album: "Veta Vinodham",
  year: 2025,
  genre: "."
},
  {
  id: "add-043",
  title: "Sarimapa",
  artist: "Saripodha Sanivaram",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628786/Samavarthi-From-Saripodhaa-Sanivaaram-Telugu-2024-20240226152958-500x500_vhlmd8.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752629428/Sarimapa_pj67zy.mp3",
  duration: 262,
  album: "Sarimapa",
  year: 2025,
  genre: "."
},
  {
  id: "add-044",
  title: "Dimbhaka",
  artist: "Saripodha Sanivaram",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628785/Saripodhaa-Sanivaaram-Original-Motion-Picture-Soundtrack-Telugu-2024-20240828160005-500x500_x3ldmy.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752629430/Dimbhaka_nqbrnz.mp3",
  duration: 153,
  album: "Dimbhaka",
  year: 2025,
  genre: "."
},
  {
  id: "add-045",
  title: "Garam Garam",
  artist: "Saripodha Sanivaram",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628786/Samavarthi-From-Saripodhaa-Sanivaaram-Telugu-2024-20240226152958-500x500_vhlmd8.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752629432/Garam_Garam_acwsoj.mp3",
  duration: 255,
  album: "Garam Garam",
  year: 2025,
  genre: "."
},
  {
  id: "add-046",
  title: "RRR Theme Music",
  artist: "RRR",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752629715/RRR-2022_rybevg.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752630267/RRR_Theme_Music_ajoepm.mp3",
  duration: 75,
  album: "RRR Theme Music",
  year: 2025,
  genre: "."
},
  {
  id: "add-047",
  title: "Bheem For Ramaraju",
  artist: "RRR",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752629716/rrr_do2gu6.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752630267/Bheem_For_Ramaraju_qq704c.mp3",
  duration: 74,
  album: "Bheem For Ramaraju",
  year: 2025,
  genre: "."
},
  {
  id: "add-048",
  title: "Naatu Naatu",
  artist: "RRR",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752629615/RRR-2021-Dosti_fhq88v.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752630270/Naatu_Naatu_ja9vk8.mp3",
  duration: 208,
  album: "Naatu Naatu",
  year: 2025,
  genre: "."
},
  {
  id: "add-049",
  title: "Janani",
  artist: "RRR",
  imageUrl: "https://res.cl",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752630276/Janani_wewros.mp3",
  duration: 189,
  album: "Janani",
  year: 2025,
  genre: "."
},
  {
  id: "add-050",
  title: "Roar Of RRR",
  artist: "RRR",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752629715/RRR-2022_rybevg.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752630278/Roar_Of_RRR_oiceqw.mp3",
  duration: 111,
  album: "Roar Of RRR",
  year: 2025,
  genre: "."
},
  {
  id: "add-051",
  title: "Dosti",
  artist: "RRR",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752629615/RRR-2021-Dosti_fhq88v.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752630287/Dosti_tosi19.mp3",
  duration: 340,
  album: "Dosti",
  year: 2025,
  genre: "."
},
  {
  id: "add-052",
  title: "Raamam Raaghavam",
  artist: "RRR",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752629628/RRR-2021-Raamam-Raaghavam_unrtta.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752631258/Raamam_Raaghavam_vh4nil.mp3",
  duration: 231,
  album: "Raamam Raaghavam",
  year: 2025,
  genre: "."
},
  {
  id: "add-053",
  title: "Komma Uyyala",
  artist: "RRR",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752629715/RRR-2022_rybevg.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752631261/Komma_Uyyala_yyvm2g.mp3",
  duration: 284,
  album: "Komma Uyyala",
  year: 2025,
  genre: "."
},
  {
  id: "add-054",
  title: "Etthara Jenda",
  artist: "RRR",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752629715/RRR-2022_rybevg.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752631263/Etthara_Jenda_mo9q5k.mp3",
  duration: 262,
  album: "Etthara Jenda",
  year: 2025,
  genre: "."
},
  {
  id: "add-055",
  title: "Komuram Bheemudo",
  artist: "RRR",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752629715/RRR-2022_rybevg.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1752631264/Komuram_Bheemudo_bly9cb.mp3",
  duration: 248,
  album: "Komuram Bheemudo",
  year: 2025,
  genre: "."
},
  {
  id: "add-056",
  title: "Hridayam Lopala",
  artist: "Kingdom",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1754740913/size_m_1746425141_j58ecx.webp",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1754740891/Hridayam_Lopala_yq1sdw.mp3",
  duration: 134,
  album: "Hridayam Lopala",
  year: 2025,
  genre: "."
},
  {
  id: "add-057",
  title: "Ragile Ragile",
  artist: "Kingdom",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1754740913/size_m_1753770287_a22f0j.webp",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1754740895/Ragile_Ragile_w8dp1e.mp3",
  duration: 329,
  album: "Ragile Ragile",
  year: 2025,
  genre: "."
},
  {
  id: "add-058",
  title: "Anna Antene",
  artist: "Kingdom",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1754740914/kingdom-tamil-2025_x4ijhc.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1754740894/Anna_Antene_iv7m6y.mp3",
  duration: 278,
  album: "Anna Antene",
  year: 2025,
  genre: "."
},
  {
  id: "add-059",
  title: "Monica Telugu",
  artist: "Monica",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1754741575/59317_4_eoh8rw.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1754741635/Monica_Telugu_KoshalWorld.Com_itvbc7.mp3",
  duration: 188,
  album: "Monica Telugu",
  year: 2025,
  genre: "."
},
  {
  id: "add-060",
  title: "Viral Vayyari",
  artist: "Viral Vayyari",
  imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1754741749/Junior-2025_rxo3fe.jpg",
  audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1754741760/Viral_Vayyari_ivbxka.mp3",
  duration: 290,
  album: "Viral Vayyari",
  year: 2025,
  genre: "."
}
];
