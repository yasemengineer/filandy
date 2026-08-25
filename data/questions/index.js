// data/questions/index.js
import { questions_norogenisimsel as questions_norogelisimsel } from './norogelisimsel';
import { questions_sizofreni } from './sizofreni';
import { questions_bipolar } from './bipolar';
import { questions_depresif } from './depresif';
import { questions_anksiyete } from './anksiyete';
import { questions_obsesif } from './obsesif';
import { questions_travma } from './travma';
import { questions_disosiyatif } from './disosiyatif';
import { questions_somatik } from './somatik';
import { questions_beslenme } from './beslenme';
import { questions_disa_atim } from './disa_atim';
import { questions_uyku } from './uyku';
import { questions_cinsel } from './cinsel';
import { questions_yikici } from './yikici';
import { questions_madde } from './madde';
import { questions_neurobilissel } from './neurobilissel';
import { questions_kisilik } from './kisilik';
import { questions_parafili } from './parafili';


export const mainCategories = [
  { id: "NÖROGELİŞİMSEL BOZUKLUKLAR", name: "Nörogelişimsel Bozukluklar", icon: "🧩", color: "#fdcb6e" },
  { id: "ŞİZOFRENİ SPEKTRUM BOZUKLUKLARI", name: "Şizofreni Spektrum Bozuklukları", icon: "🌀", color: "#e17055" },
  { id: "BİPOLAR VE İLİŞKİLİ BOZUKLUKLAR", name: "Bipolar ve İlişkili Bozukluklar", icon: "⚡", color: "#0984e3" },
  { id: "DEPRESİF BOZUKLUKLAR", name: "Depresif Bozukluklar", icon: "🌧️", color: "#636e72" },
  { id: "ANKSİYETE BOZUKLUKLARI", name: "Anksiyete Bozuklukları", icon: "😰", color: "#00b894" },
  { id: "OBSESİF KOMPULSİF VE İLİŞKİLİ BOZUKLUKLAR", name: "Obsesif Kompulsif ve İlişkili Bozukluklar", icon: "🔄", color: "#00cec9" },
  { id: "TRAVMA VE STRESÖRLE İLİŞKİLİ BOZUKLUKLAR", name: "Travma ve Stresörle İlişkili Bozukluklar", icon: "💔", color: "#d63031" },
  { id: "DİSOSİYATİF BOZUKLUKLAR", name: "Disosiyatif Bozukluklar", icon: "🪞", color: "#6c5ce7" },
  { id: "SOMATİK BELİRTİ BOZUKLUĞU VE İLİŞKİLİ BOZUKLUKLAR", name: "Somatik Belirti Bozukluğu ve İlişkili Bozukluklar", icon: "🏥", color: "#74b9ff" },
  { id: "BESLENME VE YEME BOZUKLUKLARI", name: "Beslenme ve Yeme Bozuklukları", icon: "🍽️", color: "#fd79a8" },
  { id: "BOŞALTIM BOZUKLUKLARI", name: "Boşaltım Bozuklukları", icon: "💧", color: "#55efc4" },
  { id: "UYKU-UYANIKLIK BOZUKLUKLARI", name: "Uyku-Uyanıklık Bozuklukları", icon: "😴", color: "#a29bfe" },
  { id: "CİNSEL İŞLEV BOZUKLUKLARI", name: "Cinsel İşlev Bozuklukları", icon: "❤️", color: "#e84393" },
  { id: "YIKICI DÜRTÜ KONTROLÜ VE DAVRANIM BOZUKLUKLARI", name: "Yıkıcı Dürtü Kontrolü ve Davranım Bozuklukları", icon: "💥", color: "#e17055" },
  { id: "MADDE KULLANIMI VE BAĞIMLILIK BOZUKLUKLARI", name: "Madde Kullanımı ve Bağımlılık Bozuklukları", icon: "⚠️", color: "#636e72" },
  { id: "NÖROBİLİŞSEL BOZUKLUKLAR", name: "Nörobilişsel Bozukluklar", icon: "🧠", color: "#81ecec" },
  { id: "KİŞİLİK BOZUKLUKLARI", name: "Kişilik Bozuklukları", icon: "🎭", color: "#fd79a8" },
  { id: "PARAFİLİK BOZUKLUKLAR", name: "Parafilik Bozukluklar", icon: "🔒", color: "#b2bec3" },
];

export const questions = [
  ...questions_norogelisimsel,
  ...questions_sizofreni,
  ...questions_bipolar,
  ...questions_depresif,
  ...questions_anksiyete,
  ...questions_obsesif,
  ...questions_travma,
  ...questions_disosiyatif,
  ...questions_somatik,
  ...questions_beslenme,
  ...questions_disa_atim,
  ...questions_uyku,
  ...questions_cinsel,
  ...questions_yikici,
  ...questions_madde,
  ...questions_neurobilissel,
  ...questions_kisilik,
  ...questions_parafili,
];

export const units = [
  { id: "all", name: "Karışık", icon: "🎲", color: "#6c5ce7" },
  { id: "NÖROGELİŞİMSEL BOZUKLUKLAR", name: "Nörogelişimsel Bozukluklar", icon: "🧩", color: "#fdcb6e" },
  { id: "ŞİZOFRENİ SPEKTRUM BOZUKLUKLARI", name: "Şizofreni Spektrum Bozuklukları", icon: "🌀", color: "#e17055" },
  { id: "BİPOLAR VE İLİŞKİLİ BOZUKLUKLAR", name: "Bipolar ve İlişkili Bozukluklar", icon: "⚡", color: "#0984e3" },
  { id: "DEPRESİF BOZUKLUKLAR", name: "Depresif Bozukluklar", icon: "🌧️", color: "#636e72" },
  { id: "ANKSİYETE BOZUKLUKLARI", name: "Anksiyete Bozuklukları", icon: "😰", color: "#00b894" },
  { id: "OBSESİF KOMPULSİF VE İLİŞKİLİ BOZUKLUKLAR", name: "Obsesif Kompulsif ve İlişkili Bozukluklar", icon: "🔄", color: "#00cec9" },
  { id: "TRAVMA VE STRESÖRLE İLİŞKİLİ BOZUKLUKLAR", name: "Travma ve Stresörle İlişkili Bozukluklar", icon: "💔", color: "#d63031" },
  { id: "DİSOSİYATİF BOZUKLUKLAR", name: "Disosiyatif Bozukluklar", icon: "🪞", color: "#6c5ce7" },
  { id: "SOMATİK BELİRTİ BOZUKLUĞU VE İLİŞKİLİ BOZUKLUKLAR", name: "Somatik Belirti Bozukluğu ve İlişkili Bozukluklar", icon: "🏥", color: "#74b9ff" },
  { id: "BESLENME VE YEME BOZUKLUKLARI", name: "Beslenme ve Yeme Bozuklukları", icon: "🍽️", color: "#fd79a8" },
  { id: "BOŞALTIM BOZUKLUKLARI", name: "Boşaltım Bozuklukları", icon: "💧", color: "#55efc4" },
  { id: "UYKU-UYANIKLIK BOZUKLUKLARI", name: "Uyku-Uyanıklık Bozuklukları", icon: "😴", color: "#a29bfe" },
  { id: "CİNSEL İŞLEV BOZUKLUKLARI", name: "Cinsel İşlev Bozuklukları", icon: "❤️", color: "#e84393" },
  { id: "YIKICI DÜRTÜ KONTROLÜ VE DAVRANIM BOZUKLUKLARI", name: "Yıkıcı Dürtü Kontrolü ve Davranım Bozuklukları", icon: "💥", color: "#e17055" },
  { id: "MADDE KULLANIMI VE BAĞIMLILIK BOZUKLUKLARI", name: "Madde Kullanımı ve Bağımlılık Bozuklukları", icon: "⚠️", color: "#636e72" },
  { id: "NÖROBİLİŞSEL BOZUKLUKLAR", name: "Nörobilişsel Bozukluklar", icon: "🧠", color: "#81ecec" },
  { id: "KİŞİLİK BOZUKLUKLARI", name: "Kişilik Bozuklukları", icon: "🎭", color: "#fd79a8" },
  { id: "PARAFİLİK BOZUKLUKLAR", name: "Parafilik Bozukluklar", icon: "🔒", color: "#b2bec3" },
];