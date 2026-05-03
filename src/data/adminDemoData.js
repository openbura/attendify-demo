import daniaImage from "../../assets/admin-site-images/dania-west-hod-hasharon.png";
import golombImage from "../../assets/admin-site-images/golomb-38-ramat-hasharon.png";
import formaImage from "../../assets/admin-site-images/forma-tel-aviv.png";

export const statusReasons = ["מחלה", "אינטר ויזה", "אי הגעה", "תאונת עבודה"];

export const siteDefinitions = [
  {
    id: "dania",
    name: "דניה ווסט הוד השרון",
    location: "הוד השרון",
    client: "דניה סיבוס בע\"מ",
    stage: "שלד",
    nextStage: "עבודות גמר",
    progress: 58,
    status: "בביצוע",
    image: daniaImage,
  },
  {
    id: "golomb",
    name: "גולומב 38 רמת השרון",
    location: "רמת השרון",
    client: "תדהר בנייה בע\"מ",
    stage: "עבודות גמר",
    nextStage: "מסירה",
    progress: 76,
    status: "מתקדם",
    image: golombImage,
  },
  {
    id: "forma",
    name: "פורמה תל אביב",
    location: "תל אביב-יפו",
    client: "אפריקה ישראל מגורים",
    stage: "חשמל ואינסטלציה",
    nextStage: "חיפוי",
    progress: 42,
    status: "בתכנון מתקדם",
    image: formaImage,
  },
];

export const workbookWorkers = [
  { id: 1, firstName: "MINGQIANG", lastName: "SONG", passport: "EL6998320", country: "סין", entry: "07:00", exit: "17:00", status: "" },
  { id: 2, firstName: "ZHIXIAN", lastName: "ZHANG", passport: "EK6579089", country: "סין", entry: "", exit: "", status: "מחלה" },
  { id: 3, firstName: "ZHIHONG", lastName: "WU", passport: "EM6818692", country: "סין", entry: "07:00", exit: "19:00", status: "" },
  { id: 4, firstName: "QIHUA", lastName: "XIE", passport: "EM4124965", country: "סין", entry: "", exit: "", status: "אינטר ויזה" },
  { id: 5, firstName: "AIJUN", lastName: "YANG", passport: "EA0198189", country: "סין", entry: "", exit: "", status: "" },
  { id: 6, firstName: "CHAO", lastName: "YANG", passport: "EE5071901", country: "סין", entry: "", exit: "", status: "" },
  { id: 7, firstName: "SHUSHU", lastName: "JIANG", passport: "EJ6240268", country: "סין", entry: "", exit: "", status: "" },
  { id: 8, firstName: "SHUHAO", lastName: "DONG", passport: "EJ9349666", country: "סין", entry: "", exit: "", status: "" },
  { id: 9, firstName: "PINGTIAN", lastName: "TANG", passport: "EJ6604181", country: "סין", entry: "", exit: "", status: "" },
  { id: 10, firstName: "JINFENG", lastName: "YANG", passport: "EK0198617", country: "סין", entry: "", exit: "", status: "" },
  { id: 11, firstName: "MENGJIE", lastName: "ZHU", passport: "EN3914277", country: "סין", entry: "", exit: "", status: "" },
  { id: 12, firstName: "YANG", lastName: "LIU", passport: "EH9845800", country: "סין", entry: "", exit: "", status: "" },
  { id: 13, firstName: "GUOMIN", lastName: "LIU", passport: "ED6731177", country: "סין", entry: "", exit: "", status: "" },
  { id: 14, firstName: "QIJUN", lastName: "WANG", passport: "EA2253560", country: "סין", entry: "", exit: "", status: "" },
  { id: 15, firstName: "YICHUAN", lastName: "XU", passport: "EJ5449874", country: "סין", entry: "", exit: "", status: "" },
  { id: 16, firstName: "XINJUN", lastName: "YUAN", passport: "EC9494726", country: "סין", entry: "", exit: "", status: "" },
  { id: 17, firstName: "QIANDENG", lastName: "CHEN", passport: "EQ4918912", country: "סין", entry: "", exit: "", status: "" },
  { id: 18, firstName: "Srisaksa", lastName: "Chaiwat", passport: "AD0327653", country: "תאילנד", entry: "", exit: "", status: "" },
  { id: 19, firstName: "BONOUN", lastName: "SOMPONG", passport: "AC8210764", country: "תאילנד", entry: "", exit: "", status: "" },
  { id: 20, firstName: "THANASIT", lastName: "SUWANNAPHROM", passport: "AC4956634", country: "תאילנד", entry: "", exit: "", status: "" },
  { id: 21, firstName: "KUNAKORN", lastName: "MARPHENG", passport: "AC8158586", country: "תאילנד", entry: "", exit: "", status: "" },
  { id: 22, firstName: "MR.KHACHONSAK", lastName: "KHANTIYACHAI", passport: "AC3254995", country: "תאילנד", entry: "", exit: "", status: "" },
  { id: 23, firstName: "MR.RACHATA", lastName: "NGAOPROMMIN", passport: "AC7251665", country: "תאילנד", entry: "", exit: "", status: "" },
  { id: 24, firstName: "ATHAPON", lastName: "DEEOWM", passport: "AD0857968", country: "תאילנד", entry: "", exit: "", status: "" },
  { id: 25, firstName: "SUTTHIPHAT", lastName: "SONSING", passport: "AC3198963", country: "תאילנד", entry: "", exit: "", status: "" },
  { id: 26, firstName: "ANUPHUM", lastName: "CHAMRATPHUM", passport: "AD1798435", country: "תאילנד", entry: "", exit: "", status: "" },
  { id: 27, firstName: "ALEXANDRU", lastName: "GARNET", passport: "AB0525163", country: "מולדובה", entry: "", exit: "", status: "" },
  { id: 28, firstName: "MIHAIL", lastName: "DOGA", passport: "AB0954017", country: "מולדובה", entry: "", exit: "", status: "" },
  { id: 29, firstName: "MIHAIL", lastName: "BERDILA", passport: "AP0747269", country: "מולדובה", entry: "", exit: "", status: "" },
  { id: 30, firstName: "ION", lastName: "FAUREAN", passport: "AB1728059", country: "מולדובה", entry: "", exit: "", status: "" },
  { id: 31, firstName: "GHEORGHE", lastName: "IUZU", passport: "AP0104925", country: "מולדובה", entry: "", exit: "", status: "" },
  { id: 32, firstName: "GHEORGHII", lastName: "LOZINSCHII", passport: "AP0432952", country: "מולדובה", entry: "", exit: "", status: "" },
].map((worker, index) => ({
  ...worker,
  siteId: siteDefinitions[index % siteDefinitions.length].id,
}));
